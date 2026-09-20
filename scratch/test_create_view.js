const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { rejectUnauthorized: true }
  });

  const ddl = `
    CREATE OR REPLACE VIEW test_v_user_stats AS
    SELECT 
        u.id AS user_id,
        u.name,
        u.username,
        u.total_xp,
        u.equipped_title,
        COALESCE(m.total_media_items, 0) AS total_media_items,
        COALESCE(m.total_movies, 0) AS total_movies,
        COALESCE(m.total_series, 0) AS total_series,
        COALESCE(m.total_books, 0) AS total_books,
        COALESCE(m.total_games, 0) AS total_games,
        COALESCE(m.total_hours_invested, 0) AS total_hours_invested,
        COALESCE(ua.total_achievements_unlocked, 0) AS total_achievements_unlocked,
        COALESCE(c.total_friends, 0) AS total_friends
    FROM users u
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(id) AS total_media_items,
            COUNT(CASE WHEN category = 'filme' THEN 1 END) AS total_movies,
            COUNT(CASE WHEN category = 'serie' THEN 1 END) AS total_series,
            COUNT(CASE WHEN category = 'livro' THEN 1 END) AS total_books,
            COUNT(CASE WHEN category = 'jogo' THEN 1 END) AS total_games,
            COALESCE(SUM(hours_spent), 0) AS total_hours_invested
        FROM media_items
        GROUP BY user_id
    ) m ON m.user_id = u.id
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(DISTINCT achievement_id) AS total_achievements_unlocked
        FROM user_achievements
        GROUP BY user_id
    ) ua ON ua.user_id = u.id
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(DISTINCT connection_id) AS total_friends
        FROM (
            SELECT requester_id AS user_id, id AS connection_id FROM user_connections WHERE status = 'accepted'
            UNION ALL
            SELECT addressee_id AS user_id, id AS connection_id FROM user_connections WHERE status = 'accepted'
        ) conn_all
        GROUP BY user_id
    ) c ON c.user_id = u.id;
  `;

  try {
    await conn.execute(ddl);
    console.log('Successfully created test_v_user_stats view!');
    const [rows] = await conn.execute('SELECT * FROM test_v_user_stats WHERE username = "rafael"');
    console.log('Rafael stats from view:', rows[0]);
    await conn.execute('DROP VIEW test_v_user_stats');
    console.log('Cleaned up test_v_user_stats view.');
  } catch (err) {
    console.error('Error creating view:', err);
  }

  await conn.end();
}

test().catch(console.error);
