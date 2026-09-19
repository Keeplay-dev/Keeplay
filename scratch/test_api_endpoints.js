const jwt = require('jsonwebtoken');

(async () => {
  const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";
  const token = jwt.sign({ id: 'usr_rafael', username: 'rafael', email: 'rafael@gmail.com' }, JWT_SECRET, { expiresIn: '7d' });

  console.log('Testing /api/chats...');
  const chatRes = await fetch('http://localhost:3000/api/chats', {
    headers: { Cookie: `keeplay_token=${token}` }
  });
  const chatData = await chatRes.json();
  console.log('Chats status:', chatRes.status);
  console.log('Chats returned count:', chatData.chats ? chatData.chats.length : 0);
  if (chatData.chats && chatData.chats.length > 0) {
    console.log('First chat sample:', {
      other_user_name: chatData.chats[0].other_user_name,
      other_user_id: chatData.chats[0].other_user_id,
      last_message: chatData.chats[0].last_message_text
    });
  }

  console.log('\nTesting /api/catalog?userId=usr_mariacine...');
  const catRes = await fetch('http://localhost:3000/api/catalog?userId=usr_mariacine', {
    headers: { Cookie: `keeplay_token=${token}` }
  });
  const catData = await catRes.json();
  console.log('Catalog status:', catRes.status);
  console.log('Target user:', catData.user?.name);
  console.log('Items count:', catData.items?.length);
  console.log('Affinity:', catData.affinity);

  process.exit(0);
})();
