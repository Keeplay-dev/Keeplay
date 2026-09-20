const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { rejectUnauthorized: true }
  });

  console.log("=== USERS ===");
  const [users] = await conn.execute('SELECT id, name, username, email FROM users');
  console.log(users);

  for (const u of users) {
    console.log(`\n=== USER ${u.name} (${u.id}) ===`);
    const [stats] = await conn.execute('SELECT * FROM v_user_stats WHERE user_id = ?', [u.id]);
    console.log("v_user_stats:", stats[0]);

    const [items] = await conn.execute('SELECT id, title, category, hours_spent FROM media_items WHERE user_id = ?', [u.id]);
    console.log("media_items:", items);
    const sumHours = items.reduce((acc, it) => acc + Number(it.hours_spent || 0), 0);
    console.log("Actual sum of hours_spent in media_items:", sumHours);

    const [achievements] = await conn.execute('SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?', [u.id]);
    console.log("user_achievements count:", achievements[0].count);

    const [connections] = await conn.execute('SELECT COUNT(*) as count FROM user_connections WHERE (requester_id = ? OR addressee_id = ?) AND status = "accepted"', [u.id, u.id]);
    console.log("accepted connections count:", connections[0].count);
  }

  await conn.end();
  process.exit(0);
}
run().catch(console.error);
