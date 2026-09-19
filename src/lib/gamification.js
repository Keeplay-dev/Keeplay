import { v4 as uuidv4 } from "uuid";

// Definição canônica de Conquistas do Keeplay
export const ACHIEVEMENTS_DATA = [
  // Categoria: Filmes
  { id: 'filme_10', name: 'Cinéfilo Iniciante', category: 'filme', description: 'Cadastre 10 filmes no seu catálogo.', icon: '🎬', is_secret: 0, target_count: 10, reward_xp: 100, granted_title: 'Cinéfilo Iniciante' },
  { id: 'filme_30', name: 'Cinéfilo Assíduo', category: 'filme', description: 'Cadastre 30 filmes no seu catálogo.', icon: '🎥', is_secret: 0, target_count: 30, reward_xp: 150, granted_title: 'Cinéfilo Assíduo' },
  { id: 'filme_70', name: 'Crítico de Cinema', category: 'filme', description: 'Cadastre 70 filmes no seu catálogo.', icon: '🎞️', is_secret: 0, target_count: 70, reward_xp: 200, granted_title: 'Crítico de Cinema' },
  { id: 'filme_100', name: 'Mestre da Sétima Arte', category: 'filme', description: 'Cadastre 100 filmes no seu catálogo.', icon: '📽️', is_secret: 0, target_count: 100, reward_xp: 300, granted_title: 'Mestre da Sétima Arte' },

  // Categoria: Séries
  { id: 'serie_10', name: 'Maratonista Iniciante', category: 'serie', description: 'Cadastre 10 séries no seu catálogo.', icon: '🍿', is_secret: 0, target_count: 10, reward_xp: 100, granted_title: 'Maratonista Iniciante' },
  { id: 'serie_30', name: 'Maratonista Noturno', category: 'serie', description: 'Cadastre 30 séries no seu catálogo.', icon: '📺', is_secret: 0, target_count: 30, reward_xp: 150, granted_title: 'Maratonista Noturno' },
  { id: 'serie_70', name: 'Devorador de Temporadas', category: 'serie', description: 'Cadastre 70 séries no seu catálogo.', icon: '⚡', is_secret: 0, target_count: 70, reward_xp: 200, granted_title: 'Devorador de Temporadas' },

  // Categoria: Livros
  { id: 'livro_10', name: 'Leitor Iniciante', category: 'livro', description: 'Cadastre 10 livros no seu catálogo.', icon: '📚', is_secret: 0, target_count: 10, reward_xp: 100, granted_title: 'Leitor Iniciante' },
  { id: 'livro_30', name: 'Devorador de Páginas', category: 'livro', description: 'Cadastre 30 livros no seu catálogo.', icon: '📖', is_secret: 0, target_count: 30, reward_xp: 150, granted_title: 'Devorador de Páginas' },
  { id: 'livro_70', name: 'Rato de Biblioteca', category: 'livro', description: 'Cadastre 70 livros no seu catálogo.', icon: '📜', is_secret: 0, target_count: 70, reward_xp: 200, granted_title: 'Rato de Biblioteca' },

  // Categoria: Jogos
  { id: 'jogo_10', name: 'Gamer Casual', category: 'jogo', description: 'Cadastre 10 jogos no seu catálogo.', icon: '🎮', is_secret: 0, target_count: 10, reward_xp: 100, granted_title: 'Gamer Casual' },
  { id: 'jogo_30', name: 'Gamer Hardcore', category: 'jogo', description: 'Cadastre 30 jogos no seu catálogo.', icon: '🕹️', is_secret: 0, target_count: 30, reward_xp: 150, granted_title: 'Gamer Hardcore' },
  { id: 'jogo_100', name: 'Zerador Profissional', category: 'jogo', description: 'Cadastre 100 jogos no seu catálogo.', icon: '🏆', is_secret: 0, target_count: 100, reward_xp: 300, granted_title: 'Zerador Profissional' },

  // Especiais
  { id: 'special_first', name: 'Primeiro Registro', category: 'especial', description: 'Adicione sua primeira obra ao acervo.', icon: '🌱', is_secret: 0, target_count: 1, reward_xp: 50, granted_title: 'Iniciante Curioso' },
  { id: 'special_5stars', name: 'Exigência Máxima', category: 'especial', description: 'Avalie 3 ou mais obras com 5 estrelas.', icon: '⭐', is_secret: 0, target_count: 3, reward_xp: 80, granted_title: 'Crítico Exigente' },
  { id: 'special_polymath', name: 'Polímata Cultural', category: 'especial', description: 'Tenha ao menos 1 obra em cada uma das 4 categorias.', icon: '🔮', is_secret: 0, target_count: 4, reward_xp: 120, granted_title: 'Polímata Cultural' },

  // Missões
  { id: 'mission_first', name: 'Primeira Missão Cumprida', category: 'missoes', description: 'Complete e resgate sua 1ª missão sazonal do mês.', icon: '🎯', is_secret: 0, target_count: 1, reward_xp: 100, granted_title: 'Agente Sazonal' },
  { id: 'mission_3', name: 'Foco Mensal', category: 'missoes', description: 'Complete 3 missões sazonais.', icon: '🏅', is_secret: 0, target_count: 3, reward_xp: 150, granted_title: 'Mestre do Mês' },
  { id: 'mission_month_master', name: 'Mestre da Temporada', category: 'missoes', description: 'Resgate todas as missões ativas do mês.', icon: '🌟', is_secret: 0, target_count: 4, reward_xp: 250, granted_title: 'Lenda da Temporada' },

  // Secretas
  { id: 'secret_platina', name: 'Caçador de Troféus', category: 'secreta', description: 'Platine um jogo épico (100% de progresso alcançado).', icon: '🏆', is_secret: 1, target_count: 1, reward_xp: 200, granted_title: 'Mestre dos Troféus' },
  { id: 'secret_harsh_critic', name: 'Crítico Implacável', category: 'secreta', description: 'Avalie uma obra com 1 estrela e redija uma análise com mais de 50 caracteres.', icon: '⚡', is_secret: 1, target_count: 1, reward_xp: 100, granted_title: 'Crítico Ácido' },
  { id: 'secret_speedrun', name: 'Colecionador Obsessivo', category: 'secreta', description: 'Cadastre 3 ou mais obras culturais no mesmo dia.', icon: '🏃', is_secret: 1, target_count: 3, reward_xp: 120, granted_title: 'Colecionador Veloz' },
  { id: 'secret_midnight', name: 'Coruja da Madrugada', category: 'secreta', description: 'Registre ou avalie uma obra na calada da noite (entre 00:00 e 05:00).', icon: '🦉', is_secret: 1, target_count: 1, reward_xp: 90, granted_title: 'Vigilante Noturno' }
];

let achievementsEnsured = false;

// Garante que todas as conquistas existam na tabela achievements (batch insert otimizado)
export async function ensureAllAchievementsInDB(pool) {
  if (achievementsEnsured) return;

  try {
    const values = ACHIEVEMENTS_DATA.map(ach => [
      ach.id, ach.name, ach.category, ach.description, ach.icon,
      ach.is_secret, ach.target_count, ach.reward_xp, ach.granted_title
    ]);

    const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const flatParams = values.flat();

    await pool.query(
      `INSERT INTO achievements (id, name, category, description, icon, is_secret, target_count, reward_xp, granted_title)
       VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         category = VALUES(category),
         description = VALUES(description),
         icon = VALUES(icon),
         is_secret = VALUES(is_secret),
         target_count = VALUES(target_count),
         reward_xp = VALUES(reward_xp),
         granted_title = VALUES(granted_title)`,
      flatParams
    );

    achievementsEnsured = true;
  } catch (err) {
    console.error("Erro ao sincronizar conquistas no banco:", err);
  }
}

// Atualiza o progresso das missões quinzenais do usuário com base no seu acervo real
export async function calculateMissionsProgress(userId, pool) {
  const { getCurrentPeriod } = await import("./missionAi.js");
  const periodInfo = getCurrentPeriod();

  // 1. Obter missões ativas desta quinzena
  const [missions] = await pool.query(
    "SELECT * FROM monthly_missions WHERE month_year = ? ORDER BY id ASC",
    [periodInfo.periodKey]
  );

  if (missions.length === 0) return [];

  // 2. Obter itens do usuário
  const [items] = await pool.query(
    "SELECT id, category, status, rating, comment, created_at FROM media_items WHERE user_id = ?",
    [userId]
  );

  const quinzenaItems = items.filter(i => {
    const itemDate = new Date(i.created_at);
    return itemDate >= periodInfo.startDate && itemDate <= periodInfo.endDate;
  });

  // 3. Obter progresso existente do usuário
  const [existingProgress] = await pool.query(
    "SELECT * FROM user_mission_progress WHERE user_id = ? AND mission_id IN (?)",
    [userId, missions.map(m => m.id)]
  );

  const progressMap = existingProgress.reduce((acc, p) => {
    acc[p.mission_id] = p;
    return acc;
  }, {});

  const updatedMissions = [];

  for (const m of missions) {
    const prev = progressMap[m.id] || { current_count: 0, is_completed: 0, is_claimed: 0 };
    let currentCount = 0;

    const reqType = m.requirement_type || 'category_count';
    const minRating = Number(m.min_rating) || 4.0;
    const minChars = Number(m.min_chars) || 50;

    if (reqType === 'total_items') {
      currentCount = items.length;
    } else if (reqType === 'high_rating') {
      const candidates = quinzenaItems.length > 0 ? quinzenaItems : items;
      currentCount = candidates.filter(i => 
        (!m.category || i.category === m.category) && Number(i.rating) >= minRating
      ).length;
    } else if (reqType === 'in_depth_review') {
      const candidates = quinzenaItems.length > 0 ? quinzenaItems : items;
      currentCount = candidates.filter(i => 
        (!m.category || i.category === m.category) && i.comment && i.comment.trim().length >= minChars
      ).length;
    } else if (reqType === 'completed_status') {
      const candidates = quinzenaItems.length > 0 ? quinzenaItems : items;
      currentCount = candidates.filter(i => 
        (!m.category || i.category === m.category) && 
        ['zerado', 'platinado', 'lido', 'finalizada'].includes(i.status)
      ).length;
    } else {
      // category_count padrão
      const candidates = quinzenaItems.length > 0 ? quinzenaItems : items;
      if (m.category) {
        currentCount = candidates.filter(i => i.category === m.category).length;
      } else {
        currentCount = candidates.length;
      }
    }

    const isCompleted = currentCount >= m.target_count ? 1 : 0;
    const isClaimed = prev.is_claimed ? 1 : 0;

    // Atualiza ou insere na tabela user_mission_progress
    await pool.query(
      `INSERT INTO user_mission_progress (user_id, mission_id, current_count, is_completed, is_claimed)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         current_count = VALUES(current_count),
         is_completed = VALUES(is_completed)`,
      [userId, m.id, currentCount, isCompleted, isClaimed]
    );

    updatedMissions.push({
      ...m,
      progress: {
        current_count: currentCount,
        is_completed: isCompleted,
        is_claimed: isClaimed,
        completed_at: prev.completed_at || null
      }
    });
  }

  return updatedMissions;
}

// Resgatar recompensa de uma missão completada
export async function claimMissionReward(userId, missionId, pool) {
  // 1. Verificar a missão e progresso
  const [rows] = await pool.query(
    `SELECT m.*, p.current_count, p.is_completed, p.is_claimed
     FROM monthly_missions m
     JOIN user_mission_progress p ON p.mission_id = m.id AND p.user_id = ?
     WHERE m.id = ?`,
    [userId, missionId]
  );

  if (rows.length === 0) {
    throw new Error("Missão não encontrada ou sem progresso.");
  }

  const mission = rows[0];

  if (!mission.is_completed) {
    throw new Error("Meta da missão ainda não foi alcançada.");
  }

  if (mission.is_claimed) {
    throw new Error("Recompensa desta missão já foi resgatada.");
  }

  // 2. Marcar como resgatada
  await pool.query(
    `UPDATE user_mission_progress
     SET is_claimed = 1, completed_at = NOW()
     WHERE user_id = ? AND mission_id = ?`,
    [userId, missionId]
  );

  // 3. Creditar XP ao usuário
  await pool.query(
    "UPDATE users SET total_xp = total_xp + ? WHERE id = ?",
    [mission.reward_xp, userId]
  );

  // 4. Inserir no feed de atividades
  try {
    await pool.query(
      `INSERT INTO activity_feed (id, user_id, activity_type, title, media_title, comment, created_at)
       VALUES (?, ?, 'mission', ?, ?, ?, NOW())`,
      [
        uuidv4(),
        userId,
        `completou a missão sazonal "${mission.title}" ${mission.icon || '🎯'}`,
        mission.description,
        `Resgatou +${mission.reward_xp} XP de bônus!`
      ]
    );
  } catch (e) {}

  // 5. Verificar se desbloqueou conquistas de missões!
  await checkAndUnlockAchievements(userId, pool);

  const [[userUpdated]] = await pool.query("SELECT total_xp FROM users WHERE id = ?", [userId]);

  return {
    success: true,
    reward_xp: mission.reward_xp,
    total_xp: userUpdated.total_xp
  };
}

// Avalia e desbloqueia conquistas para o usuário
export async function checkAndUnlockAchievements(userId, pool) {
  // Garantir catálogo de conquistas
  await ensureAllAchievementsInDB(pool);

  // 1. Obter itens do usuário
  const [items] = await pool.query(
    "SELECT id, category, status, rating, comment, created_at FROM media_items WHERE user_id = ?",
    [userId]
  );

  // 2. Obter missões resgatadas pelo usuário
  const [claimedMissions] = await pool.query(
    "SELECT mission_id FROM user_mission_progress WHERE user_id = ? AND is_claimed = 1",
    [userId]
  );
  const claimedCount = claimedMissions.length;

  // 3. Obter conquistas já desbloqueadas
  const [userAchievements] = await pool.query(
    "SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?",
    [userId]
  );
  const unlockedMap = userAchievements.reduce((acc, ua) => {
    acc[ua.achievement_id] = ua.unlocked_at;
    return acc;
  }, {});

  // 4. Obter todas as conquistas do banco
  const [allAchievements] = await pool.query("SELECT * FROM achievements ORDER BY category, target_count");

  const newlyUnlocked = [];
  const achievementsWithProgress = [];

  for (const ach of allAchievements) {
    let current = 0;
    let target = ach.target_count || 1;
    let shouldUnlock = false;

    // Regras de avaliação por categoria e ID
    if (ach.category === 'filme') {
      current = items.filter(i => i.category === 'filme').length;
      shouldUnlock = current >= target;
    } else if (ach.category === 'serie') {
      current = items.filter(i => i.category === 'serie').length;
      shouldUnlock = current >= target;
    } else if (ach.category === 'livro') {
      current = items.filter(i => i.category === 'livro').length;
      shouldUnlock = current >= target;
    } else if (ach.category === 'jogo') {
      current = items.filter(i => i.category === 'jogo').length;
      shouldUnlock = current >= target;
    } else if (ach.id === 'special_first') {
      current = Math.min(items.length, 1);
      shouldUnlock = items.length >= 1;
    } else if (ach.id === 'special_5stars') {
      current = items.filter(i => Number(i.rating) === 5).length;
      shouldUnlock = current >= 3;
    } else if (ach.id === 'special_polymath') {
      const cats = new Set(items.map(i => i.category));
      current = ['filme', 'serie', 'livro', 'jogo'].filter(c => cats.has(c)).length;
      shouldUnlock = current === 4;
    } else if (ach.id === 'mission_first') {
      current = Math.min(claimedCount, 1);
      shouldUnlock = claimedCount >= 1;
    } else if (ach.id === 'mission_3') {
      current = Math.min(claimedCount, 3);
      shouldUnlock = claimedCount >= 3;
    } else if (ach.id === 'mission_month_master') {
      current = Math.min(claimedCount, 4);
      shouldUnlock = claimedCount >= 4;
    } else if (ach.id === 'mission_10') {
      current = Math.min(claimedCount, 10);
      shouldUnlock = claimedCount >= 10;
    } else if (ach.id === 'secret_platina') {
      const hasPlatina = items.some(i => i.status === 'platinado');
      current = hasPlatina ? 1 : 0;
      shouldUnlock = hasPlatina;
    } else if (ach.id === 'secret_harsh_critic') {
      const found = items.some(i => Number(i.rating) === 1 && (i.comment && i.comment.trim().length >= 50));
      current = found ? 1 : 0;
      shouldUnlock = found;
    } else if (ach.id === 'secret_speedrun') {
      const dates = items.map(i => {
        if (!i.created_at) return '';
        const d = new Date(i.created_at);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      }).filter(Boolean);
      const counts = {};
      dates.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
      current = Math.min(Math.max(0, ...Object.values(counts)), 3);
      shouldUnlock = current >= 3;
    } else if (ach.id === 'secret_midnight') {
      const hasMidnight = items.some(i => {
        if (!i.created_at) return false;
        const hour = new Date(i.created_at).getHours();
        return hour >= 0 && hour < 5;
      });
      current = hasMidnight ? 1 : 0;
      shouldUnlock = hasMidnight;
    }

    const isAlreadyUnlocked = Boolean(unlockedMap[ach.id]);

    // Se alcançou o requisito e ainda não estava gravada
    if (shouldUnlock && !isAlreadyUnlocked) {
      const unlockedAt = new Date();
      await pool.query(
        "INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
        [userId, ach.id, unlockedAt]
      );

      // Creditar recompensa de XP da conquista
      if (ach.reward_xp) {
        await pool.query("UPDATE users SET total_xp = total_xp + ? WHERE id = ?", [ach.reward_xp, userId]);
      }

      // Se conceder título honorífico, desbloquear título
      if (ach.granted_title) {
        await pool.query(
          "INSERT IGNORE INTO user_unlocked_titles (user_id, title_name) VALUES (?, ?)",
          [userId, ach.granted_title]
        );
      }

      // Publicar no feed de atividades
      try {
        await pool.query(
          `INSERT INTO activity_feed (id, user_id, activity_type, title, media_title, comment, created_at)
           VALUES (?, ?, 'achievement_unlocked', ?, ?, ?, NOW())`,
          [
            uuidv4(),
            userId,
            `desbloqueou a conquista "${ach.name}" ${ach.icon}`,
            ach.description,
            ach.is_secret ? 'Uma conquista secreta foi desvendada!' : `Ganhou +${ach.reward_xp} XP e o título "${ach.granted_title || ''}"`
          ]
        );
      } catch (e) {}

      unlockedMap[ach.id] = unlockedAt;
      newlyUnlocked.push(ach);
    }

    achievementsWithProgress.push({
      ...ach,
      unlocked: Boolean(unlockedMap[ach.id]),
      unlocked_at: unlockedMap[ach.id] || null,
      progress: {
        current: Math.min(current, target),
        total: target
      }
    });
  }

  const totalUnlocked = Object.keys(unlockedMap).length;

  return {
    achievements: achievementsWithProgress,
    newlyUnlocked,
    totalUnlocked,
    totalAchievements: allAchievements.length
  };
}
