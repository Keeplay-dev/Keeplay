const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const userId = 'usr_rafael';
  const [rows] = await pool.query(`
    WITH all_contacts AS (
      SELECT 
        CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END as contact_id,
        MAX(created_at) as connected_at
      FROM user_connections
      WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
      GROUP BY contact_id
      UNION
      SELECT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id,
        MAX(created_at) as connected_at
      FROM chat_messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY contact_id
    ),
    unique_contacts AS (
      SELECT contact_id, MAX(connected_at) as connected_at
      FROM all_contacts
      GROUP BY contact_id
    ),
    ranked_messages AS (
      SELECT 
        m.*,
        ROW_NUMBER() OVER (
          PARTITION BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
          ORDER BY m.created_at DESC
        ) AS rn
      FROM chat_messages m
      WHERE m.sender_id = ? OR m.receiver_id = ?
    )
    SELECT 
      u.id AS other_user_id,
      u.name AS other_user_name,
      u.username AS other_user_username,
      u.avatar_url AS other_user_avatar,
      u.equipped_title AS other_user_title,
      rm.id AS last_message_id,
      rm.sender_id,
      rm.receiver_id,
      rm.message_text AS last_message_text,
      rm.is_read AS last_message_is_read,
      rm.created_at AS last_message_time,
      c.connected_at
    FROM unique_contacts c
    JOIN users u ON u.id = c.contact_id
    LEFT JOIN ranked_messages rm ON rm.rn = 1 AND (rm.sender_id = u.id OR rm.receiver_id = u.id)
    ORDER BY COALESCE(rm.created_at, c.connected_at) DESC
  `, [userId, userId, userId, userId, userId, userId, userId, userId]);

  console.log('Result count:', rows.length);
  console.log(rows);
  process.exit(0);
})();
