const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

(async () => {
  const pool = mysql.createPool({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

  // Check test user Rafael
  const [users] = await pool.query("SELECT id, name, username FROM users WHERE id = 'usr_rafael'");
  console.log('User Rafael:', users[0]);

  // Test target user Maria Eduarda
  const [target] = await pool.query("SELECT id, name, username, is_private FROM users WHERE id = 'usr_mariacine'");
  console.log('Target Maria:', target[0]);

  // Test target user items
  const [items] = await pool.query("SELECT id, title, category, status, rating FROM media_items WHERE user_id = 'usr_mariacine'");
  console.log('Maria items:', items);

  process.exit(0);
})();
