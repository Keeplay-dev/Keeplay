const pool = require('../src/lib/db.js').default;

const LEVEL_TITLES = [
  { minLevel: 20, title: "Patrono Eterno das Artes" },
  { minLevel: 15, title: "Lenda Cultural" },
  { minLevel: 12, title: "Sábio Multimídia" },
  { minLevel: 10, title: "Guardião do Acervo" },
  { minLevel: 9,  title: "Mestre das Narrativas" },
  { minLevel: 8,  title: "Conhecedor Ilustre" },
  { minLevel: 7,  title: "Polímata Cultural" },
  { minLevel: 6,  title: "Maratonista de Elite" },
  { minLevel: 5,  title: "Curador Experiente" },
  { minLevel: 4,  title: "Crítico Cultural" },
  { minLevel: 3,  title: "Apreciador das Artes" },
  { minLevel: 2,  title: "Explorador Cultural" },
  { minLevel: 1,  title: "Iniciante Curioso" },
];

function getTitleByXp(xp) {
  const level = Math.floor((Math.max(0, Number(xp) || 0)) / 500) + 1;
  for (const tier of LEVEL_TITLES) {
    if (level >= tier.minLevel) return tier.title;
  }
  return "Iniciante Curioso";
}

async function syncTiDBTitles() {
  console.log("=== SINCRONIZANDO TÍTULOS HONORÍFICOS POR NÍVEL NO TIDB CLOUD ===");
  const [users] = await pool.query("SELECT id, name, username, total_xp, equipped_title FROM users");
  console.log(`Encontrados ${users.length} usuários no TiDB.`);

  for (const user of users) {
    const level = Math.floor((Number(user.total_xp) || 0) / 500) + 1;
    const correctTitle = getTitleByXp(user.total_xp);
    const oldTitle = user.equipped_title;

    if (oldTitle !== correctTitle) {
      console.log(`[ATUALIZANDO] ${user.name} (@${user.username}): Nível ${level} (${user.total_xp} XP) -> De "${oldTitle}" para "${correctTitle}"`);
      await pool.query("UPDATE users SET equipped_title = ? WHERE id = ?", [correctTitle, user.id]);
    } else {
      console.log(`[OK] ${user.name} (@${user.username}): Nível ${level} (${user.total_xp} XP) -> Já possui "${correctTitle}"`);
    }

    // Registrar o título como desbloqueado na tabela user_unlocked_titles para consistência
    try {
      await pool.query(
        "INSERT IGNORE INTO user_unlocked_titles (user_id, title_name) VALUES (?, ?)",
        [user.id, correctTitle]
      );
    } catch (e) {
      // Ignora se tabela não existir ou erro menor
    }
  }

  console.log("\n=== RESULTADO FINAL NO TIDB CLOUD ===");
  const [updatedUsers] = await pool.query("SELECT id, name, username, total_xp, equipped_title FROM users ORDER BY total_xp DESC");
  console.table(updatedUsers.map(u => ({
    Nome: u.name,
    Usuario: u.username,
    XP: u.total_xp,
    Nivel: Math.floor((Number(u.total_xp) || 0) / 500) + 1,
    Titulo_Equipado: u.equipped_title
  })));

  process.exit(0);
}

syncTiDBTitles().catch(err => {
  console.error("Erro ao sincronizar TiDB:", err);
  process.exit(1);
});
