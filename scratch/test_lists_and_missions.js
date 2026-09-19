const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

async function run() {
  const uri = process.env.DATABASE_URL || 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay';
  const pool = mysql.createPool({
    uri: uri,
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 5,
  });

  console.log("=== Testing TiDB connection ===");
  const [testRes] = await pool.query("SELECT DATABASE() as db, VERSION() as version");
  console.log("Connected to TiDB:", testRes[0]);

  // Test custom_lists creation
  console.log("\n=== 1. Test Creating a Custom List in TiDB ===");
  const listId = `list_test_${Date.now()}`;
  const userId = "usr_rafael";
  await pool.query(
    `INSERT INTO custom_lists (id, user_id, title, description, visibility, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [listId, userId, "Lista de Teste TiDB", "Descrição de teste para edição", "publica"]
  );
  console.log("Created custom list with ID:", listId);

  // Insert items
  console.log("\n=== 2. Add items to custom_list_items in TiDB ===");
  const [items] = await pool.query("SELECT id FROM media_items LIMIT 2");
  if (items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      await pool.query(
        `INSERT INTO custom_list_items (list_id, media_item_id, display_order, added_at) VALUES (?, ?, ?, NOW())`,
        [listId, items[i].id, i]
      );
    }
    console.log(`Linked ${items.length} items to list ${listId}`);
  }

  // Verify list and items
  console.log("\n=== 3. Query list and items ===");
  const [rows] = await pool.query(
    `SELECT l.*, COUNT(cli.media_item_id) as item_count 
     FROM custom_lists l 
     LEFT JOIN custom_list_items cli ON l.id = cli.list_id 
     WHERE l.id = ? GROUP BY l.id`,
    [listId]
  );
  console.log("List fetched:", rows[0]);

  // Test updating list (PUT)
  console.log("\n=== 4. Test Editing (PUT) Custom List in TiDB ===");
  await pool.query(
    `UPDATE custom_lists 
     SET title = ?, description = ?, visibility = ?, updated_at = NOW() 
     WHERE id = ? AND user_id = ?`,
    ["Lista Editada com Sucesso", "Nova descrição editada no TiDB", "privada", listId, userId]
  );
  // Update items: delete and re-insert 1 item
  await pool.query("DELETE FROM custom_list_items WHERE list_id = ?", [listId]);
  if (items.length > 0) {
    await pool.query(
      `INSERT INTO custom_list_items (list_id, media_item_id, display_order, added_at) VALUES (?, ?, ?, NOW())`,
      [listId, items[0].id, 0]
    );
  }
  const [updatedRows] = await pool.query(
    `SELECT l.*, COUNT(cli.media_item_id) as item_count 
     FROM custom_lists l 
     LEFT JOIN custom_list_items cli ON l.id = cli.list_id 
     WHERE l.id = ? GROUP BY l.id`,
    [listId]
  );
  console.log("Updated list fetched:", updatedRows[0]);
  if (updatedRows[0].title === "Lista Editada com Sucesso" && updatedRows[0].visibility === "privada") {
    console.log("✓ Update verification PASSED!");
  } else {
    console.error("✗ Update verification FAILED!");
  }

  // Test deleting list (DELETE)
  console.log("\n=== 5. Test Deleting (DELETE) Custom List in TiDB ===");
  await pool.query("DELETE FROM custom_list_items WHERE list_id = ?", [listId]);
  const [delRes] = await pool.query("DELETE FROM custom_lists WHERE id = ? AND user_id = ?", [listId, userId]);
  console.log("Deleted rows:", delRes.affectedRows);

  const [checkDeleted] = await pool.query("SELECT * FROM custom_lists WHERE id = ?", [listId]);
  const [checkDeletedItems] = await pool.query("SELECT * FROM custom_list_items WHERE list_id = ?", [listId]);
  console.log("Remaining list records:", checkDeleted.length);
  console.log("Remaining list items:", checkDeletedItems.length);
  if (checkDeleted.length === 0 && checkDeletedItems.length === 0) {
    console.log("✓ Delete verification PASSED!");
  } else {
    console.error("✗ Delete verification FAILED!");
  }

  // Verify monthly missions quinzena turnover rule
  console.log("\n=== 6. Verify monthly_missions schema and records in TiDB ===");
  const [missions] = await pool.query(
    "SELECT id, title, month_year, period_label, ai_generated, ai_theme, expires_at FROM monthly_missions LIMIT 6"
  );
  console.log("Active / recent missions:", missions);

  await pool.end();
  console.log("\nAll TiDB operations successfully completed!");
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
