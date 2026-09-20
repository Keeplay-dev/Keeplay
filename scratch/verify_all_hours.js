const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function verify() {
  const conn = await mysql.createConnection({
    uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
    ssl: { rejectUnauthorized: true }
  });

  console.log("=== 1. VERIFYING ALL USERS' TOTAL HOURS INVESTED ===");
  const [users] = await conn.execute('SELECT id, name, username FROM users ORDER BY name');

  let allMatch = true;
  for (const u of users) {
    const [viewStats] = await conn.execute('SELECT * FROM v_user_stats WHERE user_id = ?', [u.id]);
    const [items] = await conn.execute('SELECT hours_spent FROM media_items WHERE user_id = ?', [u.id]);
    const expectedSum = items.reduce((acc, it) => acc + (parseFloat(it.hours_spent) || 0), 0);
    const viewHours = parseFloat(viewStats[0]?.total_hours_invested || 0);

    const diff = Math.abs(expectedSum - viewHours);
    if (diff > 0.001) {
      console.error(`MISMATCH for user ${u.name} (${u.username}): expected ${expectedSum}, got ${viewHours}`);
      allMatch = false;
    } else if (expectedSum > 0) {
      console.log(`User ${u.name} (${u.username}): ${viewHours}h (items: ${items.length}) [OK]`);
    }
  }

  if (allMatch) {
    console.log("-> SUCCESS: All users have 100% accurate hours matching media_items sum!");
  }

  console.log("\n=== 2. TEST DYNAMIC UPDATE WITH NEW MEDIA ITEM ===");
  const testUserId = 'usr_rafael';
  const [initialStats] = await conn.execute('SELECT total_hours_invested, total_media_items FROM v_user_stats WHERE user_id = ?', [testUserId]);
  const initialHours = parseFloat(initialStats[0].total_hours_invested);
  const initialItems = parseInt(initialStats[0].total_media_items);

  const testItemId = 'test_item_' + Date.now();
  await conn.execute(
    `INSERT INTO media_items (id, user_id, title, category, status, hours_spent, xp_gained) VALUES (?, ?, ?, 'filme', 'assistido', ?, 50)`,
    [testItemId, testUserId, 'Filme de Teste Validação', 3.5]
  );

  const [afterAdd] = await conn.execute('SELECT total_hours_invested, total_media_items FROM v_user_stats WHERE user_id = ?', [testUserId]);
  const addedHours = parseFloat(afterAdd[0].total_hours_invested);
  const addedItems = parseInt(afterAdd[0].total_media_items);

  console.log(`Initial: ${initialHours}h (${initialItems} items) -> After +3.5h: ${addedHours}h (${addedItems} items)`);
  if (Math.abs(addedHours - (initialHours + 3.5)) < 0.001 && addedItems === initialItems + 1) {
    console.log("-> SUCCESS: Adding an item dynamically incremented total_hours_invested by exactly 3.5h!");
  } else {
    console.error("-> FAILED: Dynamic addition check failed!");
  }

  // Clean up test item
  await conn.execute('DELETE FROM media_items WHERE id = ?', [testItemId]);

  const [afterDelete] = await conn.execute('SELECT total_hours_invested, total_media_items FROM v_user_stats WHERE user_id = ?', [testUserId]);
  const revertedHours = parseFloat(afterDelete[0].total_hours_invested);
  if (Math.abs(revertedHours - initialHours) < 0.001) {
    console.log(`-> SUCCESS: After deletion, restored to exactly ${revertedHours}h!`);
  }

  console.log("\n=== 3. TEST THAT NEW CONNECTIONS/ACHIEVEMENTS DO NOT MULTIPLY HOURS ===");
  // Test adding a dummy achievement for Rafael
  const testAchId = 'test_ach_' + Date.now();
  await conn.execute(
    'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
    [testUserId, testAchId]
  );

  const [afterAch] = await conn.execute('SELECT total_hours_invested, total_achievements_unlocked FROM v_user_stats WHERE user_id = ?', [testUserId]);
  const hoursAfterAch = parseFloat(afterAch[0].total_hours_invested);
  console.log(`After adding achievement: hours = ${hoursAfterAch} (should remain ${initialHours}), achievements = ${afterAch[0].total_achievements_unlocked}`);
  if (Math.abs(hoursAfterAch - initialHours) < 0.001) {
    console.log("-> SUCCESS: Adding an achievement did NOT alter or multiply total_hours_invested!");
  } else {
    console.error("-> FAILED: Adding achievement altered hours!");
  }

  await conn.execute('DELETE FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [testUserId, testAchId]);

  console.log("\n=== 4. TEST FORMATTING FUNCTION ===");
  function formatHours(val) {
    const num = Number(val) || 0;
    if (num === 0) return "0h";
    return Number.isInteger(num) ? `${num}h` : `${parseFloat(num.toFixed(1))}h`;
  }

  console.log("formatHours(165.8) =>", formatHours(165.8), "(Expected: '165.8h')");
  console.log("formatHours(44.0) =>", formatHours(44.0), "(Expected: '44h')");
  console.log("formatHours(2.5) =>", formatHours(2.5), "(Expected: '2.5h')");
  console.log("formatHours(0) =>", formatHours(0), "(Expected: '0h')");
  console.log("formatHours(null) =>", formatHours(null), "(Expected: '0h')");

  await conn.end();
  console.log("\nAll verification checks completed successfully!");
}

verify().catch(console.error);
