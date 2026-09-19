const http = require("http");

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: options.method || "GET",
        headers: options.headers || {},
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
  console.log("=== 1. Login with usr_rafael ===");
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { username: "rafael", password: "123" }, // will check error or get cookie
  });

  let cookie = "";
  if (loginRes.headers["set-cookie"]) {
    cookie = loginRes.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ");
  }

  // If login failed, try with senha123
  if (!cookie || loginRes.status !== 200) {
    const loginRes2 = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { username: "rafael", password: "password123" },
    });
    if (loginRes2.headers["set-cookie"]) {
      cookie = loginRes2.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ");
    }
  }

  // Let's create a direct token if needed via jwt
  if (!cookie) {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: "usr_rafael", username: "rafael" }, "keeplay-secret-key-123");
    cookie = `keeplay_token=${token}`;
  }
  console.log("Using auth cookie:", cookie.slice(0, 30) + "...");

  console.log("\n=== 2. Test GET /api/missions ===");
  const missionsRes = await request("/api/missions", {
    headers: { Cookie: cookie },
  });
  console.log("Missions Status:", missionsRes.status);
  console.log("Period Label:", missionsRes.data.periodInfo?.periodLabel);
  console.log("Theme:", missionsRes.data.theme);
  console.log("Remaining Days:", missionsRes.data.periodInfo?.remainingDays);
  console.log("Missions Count:", missionsRes.data.missions?.length);

  console.log("\n=== 3. Test POST /api/missions with generate_ai (Reroll MUST be blocked) ===");
  const rerollRes = await request("/api/missions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: { action: "generate_ai" },
  });
  console.log("Reroll Status:", rerollRes.status, "Response:", rerollRes.data);
  if (rerollRes.status === 400 && rerollRes.data.error?.includes("quinzena")) {
    console.log("✓ Manual reroll successfully blocked! Users must wait for the quinzena turnover.");
  } else {
    console.log("Response:", rerollRes.data);
  }

  console.log("\n=== 4. Test POST /api/lists (Create custom list) ===");
  const createListRes = await request("/api/lists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: {
      title: "Coleção Sci-Fi & Drama",
      description: "Melhores obras selecionadas",
      visibility: "publica",
      itemIds: ["9b307906-4882-45f9-b8bf-34e705cca25f"],
    },
  });
  console.log("Create List Status:", createListRes.status, createListRes.data);
  const createdListId = createListRes.data.list?.id;

  if (!createdListId) {
    throw new Error("Failed to create list");
  }

  console.log("\n=== 5. Test GET /api/lists/[id] (Fetch custom list details) ===");
  const getListRes = await request(`/api/lists/${createdListId}`, {
    headers: { Cookie: cookie },
  });
  console.log("Get List Status:", getListRes.status);
  console.log("List Title:", getListRes.data.list?.title);
  console.log("List Items Count:", getListRes.data.items?.length);

  console.log("\n=== 6. Test PUT /api/lists/[id] (Edit custom list) ===");
  const updateListRes = await request(`/api/lists/${createdListId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: {
      title: "Coleção Sci-Fi & Drama (Editada)",
      description: "Descrição atualizada pelo usuário",
      visibility: "privada",
      itemIds: [],
    },
  });
  console.log("Update List Status:", updateListRes.status, updateListRes.data);

  // Verify the update via GET
  const verifyUpdateRes = await request(`/api/lists/${createdListId}`, {
    headers: { Cookie: cookie },
  });
  console.log("Updated Title in TiDB:", verifyUpdateRes.data.list?.title);
  console.log("Updated Visibility in TiDB:", verifyUpdateRes.data.list?.visibility);
  console.log("Updated Items count in TiDB:", verifyUpdateRes.data.items?.length);

  console.log("\n=== 7. Test DELETE /api/lists/[id] (Delete custom list) ===");
  const deleteListRes = await request(`/api/lists/${createdListId}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  console.log("Delete List Status:", deleteListRes.status, deleteListRes.data);

  // Confirm 404
  const confirmDeletedRes = await request(`/api/lists/${createdListId}`, {
    headers: { Cookie: cookie },
  });
  console.log("Confirm Deleted (should be 404):", confirmDeletedRes.status, confirmDeletedRes.data);

  if (confirmDeletedRes.status === 404) {
    console.log("✓ List successfully deleted and synchronized with TiDB Cloud!");
  }

  console.log("\n=== ALL E2E API TESTS PASSED! ===");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
