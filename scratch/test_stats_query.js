const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { rejectUnauthorized: true }
  });

  const [oldStats] = await conn.execute('SELECT user_id, total_media_items, total_movies, total_series, total_books, total_games, total_achievements_unlocked, total_friends FROM v_user_stats ORDER BY user_id');

  const newQuery = `
    SELECT 
        u.id AS user_id,
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
    ) c ON c.user_id = u.id
    ORDER BY u.id
  `;

  const [newStats] = await conn.execute(newQuery);

  console.log('Comparing old vs new for all', oldStats.length, 'users:');
  let match = true;
  for (let i = 0; i < oldStats.length; i++) {
    const o = oldStats[i];
    const n = newStats[i];
    if (
      o.user_id !== n.user_id ||
      Number(o.total_media_items) !== Number(n.total_media_items) ||
      Number(o.total_movies) !== Number(n.total_movies) ||
      Number(o.total_series) !== Number(n.total_series) ||
      Number(o.total_books) !== Number(n.total_books) ||
      Number(o.total_games) !== Number(n.total_games) ||
      Number(o.total_achievements_unlocked) !== Number(n.total_achievements_unlocked) ||
      Number(o.total_friends) !== Number(n.total_friends)
    ) {
      console.log('Mismatch for user:', o.user_id, 'old:', o, 'new:', n);
      match = false;
    }
  }
  if (match) {
    console.log('SUCCESS: ALL metrics (media, movies, series, books, games, achievements, friends) match 100% identically for all users!');
  }

  await conn.end();
}

test().catch(console.error);
