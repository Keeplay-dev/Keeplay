import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getTitleByXp } from "@/lib/gamification";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("keeplay_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const userId = userAuth.id;

    // 1. Dados completos do usuário
    const [[user]] = await pool.query(
      "SELECT id, name, username, total_xp, equipped_title, avatar_url FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const currentLevel = Math.floor((Number(user.total_xp) || 0) / 500) + 1;
    const currentTitle = getTitleByXp(user.total_xp);

    // 2. Acervo de obras culturais
    const [items] = await pool.query(`
      SELECT id, title, category, status, rating, comment, cover_image, hours_spent, xp_gained, created_at
      FROM media_items 
      WHERE user_id = ?
      ORDER BY rating DESC, hours_spent DESC, created_at DESC
    `, [userId]);

    // 3. Conquistas desbloqueadas
    const [achievements] = await pool.query(`
      SELECT a.id, a.name, a.icon, a.category, a.is_secret, ua.unlocked_at
      FROM user_achievements ua 
      JOIN achievements a ON a.id = ua.achievement_id 
      WHERE ua.user_id = ?
    `, [userId]);

    // 4. Missões sazonais completadas/resgatadas
    const [[missionsResult]] = await pool.query(
      "SELECT COUNT(*) as claimed_count FROM user_mission_progress WHERE user_id = ? AND is_claimed = 1",
      [userId]
    );
    const claimedMissionsCount = missionsResult?.claimed_count || 0;

    // 5. Conexões e amigos confirmados
    const [[friendsResult]] = await pool.query(
      "SELECT COUNT(*) as friends_count FROM user_connections WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'",
      [userId, userId]
    );
    const friendsCount = friendsResult?.friends_count || 0;

    // Métricas agregadas
    const totalItems = items.length;
    let completedCount = 0;
    const categoryCounts = { filme: 0, serie: 0, livro: 0, jogo: 0 };
    let rawHours = 0;

    items.forEach(item => {
      const cat = item.category || "filme";
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      }
      if (["assistido", "zerado", "platinado", "lido", "finalizada"].includes(item.status)) {
        completedCount++;
      }
      rawHours += Number(item.hours_spent) || 0;
    });

    // Estimativa inteligente de horas caso o usuário não tenha preenchido manualmente
    let totalHours = rawHours;
    if (totalHours <= 0 && totalItems > 0) {
      totalHours = Math.round(
        categoryCounts.filme * 2.2 +
        categoryCounts.serie * 12 +
        categoryCounts.livro * 7.5 +
        categoryCounts.jogo * 24
      );
    } else {
      totalHours = Math.round(totalHours);
    }

    // Porcentagens por categoria
    const categoryPercentages = {
      filme: totalItems > 0 ? Math.round((categoryCounts.filme / totalItems) * 100) : 0,
      serie: totalItems > 0 ? Math.round((categoryCounts.serie / totalItems) * 100) : 0,
      livro: totalItems > 0 ? Math.round((categoryCounts.livro / totalItems) * 100) : 0,
      jogo: totalItems > 0 ? Math.round((categoryCounts.jogo / totalItems) * 100) : 0,
    };

    // Obra-prima suprema (com maior nota e preferencialmente com comentário e capa)
    const topMasterpiece = items.length > 0
      ? items.reduce((prev, curr) => {
          const prevScore = (Number(prev.rating) || 0) * 10 + (prev.comment ? 5 : 0) + (prev.cover_image ? 3 : 0);
          const currScore = (Number(curr.rating) || 0) * 10 + (curr.comment ? 5 : 0) + (curr.cover_image ? 3 : 0);
          return currScore > prevScore ? curr : prev;
        }, items[0])
      : null;

    // Cálculo do Arquétipo Cultural Único do Usuário
    let archetype = {
      name: "Polímata Renascentista",
      icon: "💎",
      badge: "Perfil Lendário & Eclético",
      description: "Raro conhecedor de todas as vertentes culturais. Você transita com maestria entre livros densos, cinema autoral, séries instigantes e jogos grandiosos.",
      superpower: "Visão cultural panorâmica em 360°",
      habitat: "Madrugadas navegando entre mundos imaginados",
      vibe: "Sintonia Multicultural Absoluta"
    };

    if (totalItems === 0) {
      archetype = {
        name: "Explorador Pioneiro",
        icon: "🌱",
        badge: "Iniciando a Jornada",
        description: "Você está no ponto de partida de uma expedição cultural sem limites. Cada obra adicionada esculpirá sua identidade no Keeplay.",
        superpower: "Curiosidade infinita para novos mundos",
        habitat: "Desbravando o acervo pela primeira vez",
        vibe: "Potencial Ilimitado"
      };
    } else {
      const catsWithItems = Object.values(categoryCounts).filter(c => c > 0).length;
      const maxCategoryCount = Math.max(...Object.values(categoryCounts));
      const dominantCategory = Object.keys(categoryCounts).find(k => categoryCounts[k] === maxCategoryCount);

      if (catsWithItems >= 3 && categoryPercentages[dominantCategory] < 55) {
        // Polímata / Equilibrado
        archetype = {
          name: "Polímata Renascentista",
          icon: "💎",
          badge: "Apreciação Eclética",
          description: "Você desafia rótulos. Seu acervo equilibra diferentes linguagens artísticas, transformando seu repertório em uma das experiências mais completas da comunidade.",
          superpower: "Repertório multidisciplinar sem barreiras",
          habitat: "Sempre alternando entre um livro, um episódio e uma gameplay",
          vibe: "Multimídia Visionário"
        };
      } else if (dominantCategory === "jogo") {
        archetype = {
          name: "Mestre dos Mundos Virtuais",
          icon: "🎮",
          badge: "Gamer Estrategista",
          description: "Narrativas interativas, desafios complexos e grandes universos digitais movem o seu espírito. Para você, jogar é viver outra vida com maestria.",
          superpower: "Foco analítico e busca incansável pela platina",
          habitat: "Setup iluminado em sessões épicas de imersão",
          vibe: "Foco & Imersão Gamer"
        };
      } else if (dominantCategory === "filme") {
        archetype = {
          name: "Cinéfilo Noturno Autoral",
          icon: "🎬",
          badge: "Sétima Arte Pura",
          description: "Você enxerga o mundo através de enquadramentos, trilhas sonoras e roteiros memoráveis. Seu apreço pelo cinema transcende o entretenimento casual.",
          superpower: "Sensibilidade para fotografia e narrativa visual",
          habitat: "Sala escura com som envolvente e tela cheia",
          vibe: "Cinefilia Refinada"
        };
      } else if (dominantCategory === "serie") {
        archetype = {
          name: "Devorador de Temporadas",
          icon: "🍿",
          badge: "Maratonista de Elite",
          description: "Você cria laços profundos com arcos de personagens e desenvolvimentos de longo prazo. Maratonar universos inteiros é a sua verdadeira arte.",
          superpower: "Capacidade inabalável de devorar episódios seguidos",
          habitat: "O sofá perfeito em um fim de semana chuvoso",
          vibe: "Vício Saudável em Boas Histórias"
        };
      } else if (dominantCategory === "livro") {
        archetype = {
          name: "Erudito das Grandes Narrativas",
          icon: "📖",
          badge: "Sábio das Letras",
          description: "Para você, as páginas impressas constroem mundos mais vivos do que qualquer tela. Sua imaginação é um universo à parte cheio de filosofia e profundidade.",
          superpower: "Imaginação vívida e pensamento crítico aguçado",
          habitat: "Poltrona silenciosa com uma xícara de café fumegante",
          vibe: "Sabedoria Literária Eterna"
        };
      }
    }

    // Texto de compartilhamento viral e engajador
    const shareSummaryText = `✨ MEU KEEPLAY WRAPPED 2026 ✨
👤 ${user.name} (@${user.username})
⭐ Nível ${currentLevel} • ${currentTitle}
🎭 Arquétipo: ${archetype.name} ${archetype.icon}
📚 ${totalItems} Obras Catalogadas (${completedCount} Concluídas)
⏱️ ${totalHours}h de pura imersão cultural
👑 Obra Marcante: ${topMasterpiece ? topMasterpiece.title : "Acervo em Construção"}
🏆 ${achievements.length} Troféus Desbloqueados

Venha ver seu Wrapped e comparar sua afinidade cultural comigo no Keeplay! 🚀`;

    // Montagem dos 6 Slides Ricos da Retrospectiva
    const slides = [
      // Slide 1: Abertura & Jornada Épica
      {
        id: "intro",
        type: "intro",
        icon: "🚀",
        title: "Sua Odisseia Cultural",
        subtitle: "Retrospectiva Keeplay 2026",
        highlight_number: `+${(user.total_xp || 0).toLocaleString("pt-BR")} XP`,
        highlight_label: "XP Cultural Acumulado",
        current_level: currentLevel,
        current_title: currentTitle,
        total_items: totalItems,
        total_hours: totalHours,
        description: "Em 2026, você transformou cada filme, jogo, livro e série em degraus da sua própria evolução cultural.",
        theme_color: "#6366f1"
      },

      // Slide 2: Arquétipo Cultural Revelado
      {
        id: "archetype",
        type: "archetype",
        icon: archetype.icon,
        title: "Seu Arquétipo Cultural",
        subtitle: "Identidade Única Revelada",
        archetype_name: archetype.name,
        archetype_badge: archetype.badge,
        archetype_desc: archetype.description,
        archetype_superpower: archetype.superpower,
        archetype_habitat: archetype.habitat,
        archetype_vibe: archetype.vibe,
        theme_color: "#ec4899"
      },

      // Slide 3: Obra-Prima Suprema do Ano
      {
        id: "masterpiece",
        type: "masterpiece",
        icon: "👑",
        title: "A Obra-Prima Inesquecível",
        subtitle: "Seu Momento Mais Alto",
        has_media: Boolean(topMasterpiece),
        media: topMasterpiece ? {
          title: topMasterpiece.title,
          category: topMasterpiece.category,
          rating: topMasterpiece.rating,
          status: topMasterpiece.status,
          comment: topMasterpiece.comment,
          cover_image: topMasterpiece.cover_image,
          hours_spent: topMasterpiece.hours_spent ? `${Math.round(Number(topMasterpiece.hours_spent))}h` : null
        } : null,
        description: topMasterpiece?.comment
          ? `"${topMasterpiece.comment}"`
          : "Uma experiência extraordinária que marcou seu repertório de forma definitiva.",
        theme_color: "#f59e0b"
      },

      // Slide 4: Cosmos de Categorias
      {
        id: "cosmos",
        type: "cosmos",
        icon: "🌌",
        title: "O Cosmos das Suas Paixões",
        subtitle: "Distribuição do Seu Acervo",
        total_items: totalItems,
        completed_count: completedCount,
        total_hours: totalHours,
        categories: [
          { key: "filme", label: "Filmes", icon: "🎬", count: categoryCounts.filme, pct: categoryPercentages.filme, color: "#3b82f6" },
          { key: "serie", label: "Séries", icon: "🍿", count: categoryCounts.serie, pct: categoryPercentages.serie, color: "#a855f7" },
          { key: "livro", label: "Livros", icon: "📚", count: categoryCounts.livro, pct: categoryPercentages.livro, color: "#f59e0b" },
          { key: "jogo", label: "Jogos", icon: "🎮", count: categoryCounts.jogo, pct: categoryPercentages.jogo, color: "#10b981" },
        ],
        theme_color: "#8b5cf6"
      },

      // Slide 5: Sala de Troféus & Mérito
      {
        id: "trophies",
        type: "trophies",
        icon: "🏛️",
        title: "Sala de Troféus & Glórias",
        subtitle: "Conquistas do Seu Repertório",
        achievements_count: achievements.length,
        secret_count: achievements.filter(a => a.is_secret).length,
        missions_count: claimedMissionsCount,
        friends_count: friendsCount,
        current_title: currentTitle,
        current_level: currentLevel,
        recent_trophies: achievements.slice(0, 4).map(a => ({ name: a.name, icon: a.icon })),
        theme_color: "#10b981"
      },

      // Slide 6: Cartão Oficial Colecionável & Compartilhamento
      {
        id: "card",
        type: "card",
        icon: "🎴",
        title: "Seu Cartão de Colecionador",
        subtitle: "Pronto para Compartilhar",
        card_data: {
          user_name: user.name,
          username: user.username,
          avatar_url: user.avatar_url,
          current_level: currentLevel,
          equipped_title: currentTitle,
          archetype_name: archetype.name,
          archetype_icon: archetype.icon,
          total_items: totalItems,
          total_hours: totalHours,
          total_xp: user.total_xp || 0,
          trophies_count: achievements.length,
          top_masterpiece: topMasterpiece ? topMasterpiece.title : "Explorador Keeplay"
        },
        theme_color: "#f43f5e"
      }
    ];

    // 6. Verifica se o usuário já compartilhou o Wrapped hoje no Feed (limite de 1 vez ao dia para evitar XP infinito)
    const [todayShares] = await pool.query(
      `SELECT id, created_at 
       FROM activity_feed 
       WHERE user_id = ? 
         AND activity_type = 'wrapped' 
         AND DATE(created_at) = CURDATE()
       LIMIT 1`,
      [userId]
    );
    const hasSharedToday = todayShares.length > 0;

    return NextResponse.json({
      success: true,
      has_shared_today: hasSharedToday,
      can_share_today: !hasSharedToday,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
        current_level: currentLevel,
        equipped_title: currentTitle
      },
      archetype,
      stats: {
        total_items: totalItems,
        completed_count: completedCount,
        total_hours: totalHours,
        total_xp: user.total_xp,
        category_counts: categoryCounts,
        category_percentages: categoryPercentages,
        achievements_count: achievements.length,
        secret_count: achievements.filter(a => a.is_secret).length,
        claimed_missions_count: claimedMissionsCount,
        friends_count: friendsCount
      },
      top_media: topMasterpiece,
      slides,
      share_summary_text: shareSummaryText
    });

  } catch (error) {
    console.error("Wrapped API Error:", error);
    return NextResponse.json({ error: "Erro interno ao gerar o Wrapped." }, { status: 500 });
  }
}

// Endpoint para publicar o Wrapped diretamente no Feed da Comunidade (TiDB Cloud)
export async function POST(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const userId = userAuth.id;

    // 1. Validação estrita: Permitido publicar apenas UMA vez ao dia para evitar XP infinito
    const [todayShares] = await pool.query(
      `SELECT id, created_at 
       FROM activity_feed 
       WHERE user_id = ? 
         AND activity_type = 'wrapped' 
         AND DATE(created_at) = CURDATE()
       LIMIT 1`,
      [userId]
    );

    if (todayShares.length > 0) {
      return NextResponse.json({
        error: "Você já compartilhou seu Wrapped hoje! Para evitar abusos de XP, o compartilhamento é permitido apenas uma vez por dia.",
        already_shared_today: true,
        can_share_today: false
      }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { shareText, archetype, topMedia } = body;

    const [[user]] = await pool.query(
      "SELECT id, name, username, total_xp, equipped_title FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const feedId = uuidv4();
    const archetypeName = archetype?.name || "Retrospectiva Cultural";
    const postTitle = `celebrou sua Retrospectiva Cultural Keeplay Wrapped! 🎁`;
    const commentText = shareText || `Confira meus destaques culturais e meu arquétipo no Keeplay Wrapped!`;
    const coverImage = topMedia?.cover_image || null;
    const metadata = JSON.stringify({
      archetype: archetype || {},
      top_media: topMedia ? { title: topMedia.title, category: topMedia.category, rating: topMedia.rating } : null,
      shared_at: new Date().toISOString()
    });

    // Inserir a publicação do Wrapped na tabela activity_feed do TiDB Cloud
    await pool.query(
      `INSERT INTO activity_feed (id, user_id, activity_type, title, media_title, cover_image, comment, metadata, created_at)
       VALUES (?, ?, 'wrapped', ?, ?, ?, ?, ?, NOW())`,
      [feedId, userId, postTitle, archetypeName, coverImage, commentText, metadata]
    );

    // Bônus de +50 XP por engajar e compartilhar na comunidade
    const BONUS_XP = 50;
    await pool.query("UPDATE users SET total_xp = total_xp + ? WHERE id = ?", [BONUS_XP, userId]);

    // Recalcula o título de acordo com o novo XP
    const [[updatedUser]] = await pool.query("SELECT total_xp FROM users WHERE id = ?", [userId]);
    const newTitle = getTitleByXp(updatedUser.total_xp);
    await pool.query("UPDATE users SET equipped_title = ? WHERE id = ?", [newTitle, userId]);

    return NextResponse.json({
      success: true,
      message: "Wrapped compartilhado no feed da comunidade com sucesso! Você ganhou +50 XP de bônus!",
      bonus_xp: BONUS_XP,
      total_xp: updatedUser.total_xp,
      equipped_title: newTitle,
      feed_id: feedId
    });

  } catch (error) {
    console.error("Erro ao compartilhar Wrapped no feed:", error);
    return NextResponse.json({ error: "Erro ao compartilhar no feed da comunidade." }, { status: 500 });
  }
}
