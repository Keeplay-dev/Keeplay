const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { rejectUnauthorized: true }
  });
  const [rows] = await conn.execute('SELECT id, username, email, password_hash FROM users');
  console.log(rows);
  process.exit(0);
}
run();
