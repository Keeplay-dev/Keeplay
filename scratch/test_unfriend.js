const http = require("http");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const JWT_SECRET = "keeplay-secret-key-123";

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : null;
    const headers = { ...options.headers };
    if (postData) {
      headers["Content-Length"] = Buffer.byteLength(postData);
    }
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: options.method || "GET",
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  const pool = mysql.createPool({
    uri: "mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay",
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });

  const myUserId = "usr_rafael";
  const myToken = jwt.sign({ id: myUserId, username: "rafael" }, JWT_SECRET);
  const cookieHeader = `keeplay_token=${myToken}`;

  console.log("=== 1. Create a dedicated test friend connection in TiDB Cloud ===");
  const testFriendId = "usr_test_friend_" + Date.now();
  // Ensure test user exists
  await pool.query(
    `INSERT INTO users (id, name, username, email, password_hash, is_private, total_xp, created_at, updated_at)
     VALUES (?, 'Amigo Teste', ?, ?, 'hash', 0, 100, NOW(), NOW())`,
    [testFriendId, `testuser_${Date.now()}`, `test_${Date.now()}@example.com`]
  );
  console.log("Created dummy friend user:", testFriendId);

  const connId = `conn_test_${Date.now()}`;
  await pool.query(
    `INSERT INTO user_connections (id, requester_id, addressee_id, status, created_at, updated_at)
     VALUES (?, ?, ?, 'accepted', NOW(), NOW())`,
    [connId, myUserId, testFriendId]
  );
  console.log("Created 'accepted' connection in TiDB Cloud:", connId);

  console.log("\n=== 2. Test DELETE /api/community/connect/[id] using target_user_id ===");
  const unfriendRes1 = await request(`/api/community/connect/${testFriendId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  console.log("Unfriend by user ID status:", unfriendRes1.status, unfriendRes1.data);

  // Check in TiDB Cloud
  const [check1] = await pool.query("SELECT * FROM user_connections WHERE id = ?", [connId]);
  console.log("Connection exists in TiDB after unfriend by user ID:", check1.length > 0);
  if (check1.length === 0) {
    console.log("✓ Successfully unfriended using target user ID!");
  } else {
    throw new Error("Failed: connection still exists in TiDB");
  }

  console.log("\n=== 3. Test DELETE /api/community/connect/[id] using connection_id ===");
  const connId2 = `conn_test2_${Date.now()}`;
  await pool.query(
    `INSERT INTO user_connections (id, requester_id, addressee_id, status, created_at, updated_at)
     VALUES (?, ?, ?, 'accepted', NOW(), NOW())`,
    [connId2, testFriendId, myUserId] // reverse direction
  );
  console.log("Created reverse connection:", connId2);

  const unfriendRes2 = await request(`/api/community/connect/${connId2}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  console.log("Unfriend by connection ID status:", unfriendRes2.status, unfriendRes2.data);

  const [check2] = await pool.query("SELECT * FROM user_connections WHERE id = ?", [connId2]);
  console.log("Connection exists in TiDB after unfriend by conn ID:", check2.length > 0);
  if (check2.length === 0) {
    console.log("✓ Successfully unfriended using connection ID!");
  } else {
    throw new Error("Failed: connection still exists in TiDB");
  }

  console.log("\n=== 4. Test DELETE /api/community/connect with JSON body ===");
  const connId3 = `conn_test3_${Date.now()}`;
  await pool.query(
    `INSERT INTO user_connections (id, requester_id, addressee_id, status, created_at, updated_at)
     VALUES (?, ?, ?, 'accepted', NOW(), NOW())`,
    [connId3, myUserId, testFriendId]
  );

  const unfriendRes3 = await request("/api/community/connect", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: { target_user_id: testFriendId },
  });
  console.log("Unfriend by body status:", unfriendRes3.status, unfriendRes3.data);

  const [check3] = await pool.query("SELECT * FROM user_connections WHERE id = ?", [connId3]);
  console.log("Connection exists in TiDB after unfriend via body:", check3.length > 0);
  if (check3.length === 0) {
    console.log("✓ Successfully unfriended via DELETE body!");
  } else {
    throw new Error("Failed: connection still exists in TiDB");
  }

  console.log("\n=== 5. Test cancelling a pending request ===");
  const connId4 = `conn_test4_${Date.now()}`;
  await pool.query(
    `INSERT INTO user_connections (id, requester_id, addressee_id, status, created_at, updated_at)
     VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
    [connId4, myUserId, testFriendId]
  );

  const cancelRes = await request(`/api/community/connect/${testFriendId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  console.log("Cancel pending request status:", cancelRes.status, cancelRes.data);

  const [check4] = await pool.query("SELECT * FROM user_connections WHERE id = ?", [connId4]);
  if (check4.length === 0) {
    console.log("✓ Successfully cancelled pending request!");
  } else {
    throw new Error("Failed: pending connection still exists in TiDB");
  }

  // Cleanup dummy user
  await pool.query("DELETE FROM users WHERE id = ?", [testFriendId]);
  await pool.end();

  console.log("\n=== ALL UNFRIEND TESTS PASSED WITH 100% SUCCESS! ===");
}

run().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
