import crypto from "crypto";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Temas culturais rotativos para inspirar a IA
const AI_CULTURAL_THEMES = [
  {
    theme: "Explorador Sci-Fi & Futuro",
    vibe: "Ficção científica, futuros distópicos e tecnologia",
    missions: [
      { title: "Odisseia Estelar", desc: "Adicione ou assista a 2 filmes de qualquer gênero nesta quinzena.", cat: "filme", req: "category_count", target: 2, xp: 150, icon: "🚀" },
      { title: "Crítica Cibernética", desc: "Escreva 1 resenha aprofundada com pelo menos 50 caracteres.", cat: null, req: "in_depth_review", minChars: 50, target: 1, xp: 130, icon: "✍️" },
      { title: "Mestre dos Mundos Virtuais", desc: "Avalie ou finalize 1 jogo com nota 4 ou 5 estrelas.", cat: "jogo", req: "high_rating", minRating: 4.0, target: 1, xp: 180, icon: "🎮" },
      { title: "Arquivo Histórico", desc: "Mantenha ou registre 3 obras em seu acervo cultural.", cat: null, req: "total_items", target: 3, xp: 140, icon: "🌌" },
    ]
  },
  {
    theme: "Cinema Cult & Grandes Narrativas",
    vibe: "Obras premiadas, clássicos atemporais e reflexão",
    missions: [
      { title: "Noite de Cinema Clássico", desc: "Registre ou conclua 2 filmes no seu acervo nesta quinzena.", cat: "filme", req: "category_count", target: 2, xp: 160, icon: "🎬" },
      { title: "Maratona Dramática", desc: "Adicione ou acompanhe 1 série no seu acervo.", cat: "serie", req: "category_count", target: 1, xp: 140, icon: "🍿" },
      { title: "Visão do Especialista", desc: "Escreva uma análise rica com 60+ caracteres sobre uma obra.", cat: null, req: "in_depth_review", minChars: 60, target: 1, xp: 150, icon: "🧐" },
      { title: "Obras Impecáveis", desc: "Avalie 2 obras com nota 4.5 ou 5 estrelas.", cat: null, req: "high_rating", minRating: 4.5, target: 2, xp: 200, icon: "⭐" },
    ]
  },
  {
    theme: "Expedição Literária & Sabedoria",
    vibe: "Leituras envolventes, páginas marcantes e aprendizado",
    missions: [
      { title: "Capítulos Inesquecíveis", desc: "Cadastre ou conclua a leitura de 1 livro nesta quinzena.", cat: "livro", req: "category_count", target: 1, xp: 150, icon: "📚" },
      { title: "Pena de Ouro", desc: "Escreva uma resenha com mais de 50 caracteres para uma obra.", cat: null, req: "in_depth_review", minChars: 50, target: 1, xp: 130, icon: "✒️" },
      { title: "Equilíbrio de Formatos", desc: "Assista a 1 filme ou série para diversificar sua quinzena.", cat: "filme", req: "category_count", target: 1, xp: 120, icon: "☕" },
      { title: "Coleção em Expansão", desc: "Alcance ou registre 4 obras de qualquer mídia no seu catálogo.", cat: null, req: "total_items", target: 4, xp: 180, icon: "📖" },
    ]
  },
  {
    theme: "Gamer Imersivo & Conquistas",
    vibe: "Desafios, aventuras interativas e gameplay",
    missions: [
      { title: "Boss Conquistado", desc: "Registre ou marque como zerado/jogado 1 jogo no acervo.", cat: "jogo", req: "category_count", target: 1, xp: 160, icon: "⚔️" },
      { title: "Selo de Qualidade Gamer", desc: "Avalie 1 jogo com nota 4 ou superior.", cat: "jogo", req: "high_rating", minRating: 4.0, target: 1, xp: 150, icon: "🏆" },
      { title: "Pausa Para Pipoca", desc: "Assista a 2 produções (filmes ou séries) nesta quinzena.", cat: "filme", req: "category_count", target: 2, xp: 140, icon: "🍿" },
      { title: "Diário do Jogador", desc: "Escreva uma resenha crítica de 50+ caracteres sobre um jogo ou obra.", cat: null, req: "in_depth_review", minChars: 50, target: 1, xp: 130, icon: "📝" },
    ]
  },
  {
    theme: "Polímata Cultural & Ecletismo",
    vibe: "Exploração de todas as mídias: jogos, livros, filmes e séries",
    missions: [
      { title: "Mente Aberta", desc: "Registre 1 filme e 1 livro nesta quinzena.", cat: null, req: "total_items", target: 2, xp: 160, icon: "🎭" },
      { title: "Veredito Sincero", desc: "Escreva 1 resenha com 50+ caracteres sobre qualquer obra.", cat: null, req: "in_depth_review", minChars: 50, target: 1, xp: 130, icon: "✍️" },
      { title: "Mundo dos Jogos", desc: "Adicione 1 jogo ao seu acervo cultural.", cat: "jogo", req: "category_count", target: 1, xp: 140, icon: "🎮" },
      { title: "Padrão Cinco Estrelas", desc: "Encontre e avalie 1 obra-prima com nota máxima (5 estrelas).", cat: null, req: "high_rating", minRating: 5.0, target: 1, xp: 190, icon: "🌟" },
    ]
  },
  {
    theme: "Noite de Suspense & Mistério",
    vibe: "Enredos imprevisíveis, investigações e reviravoltas",
    missions: [
      { title: "Arquivo Confidencial", desc: "Adicione 2 obras (filmes, séries ou livros) ao acervo nesta quinzena.", cat: null, req: "total_items", target: 2, xp: 150, icon: "🕵️" },
      { title: "Pista Decisiva", desc: "Escreva 1 resenha detalhada com pelo menos 55 caracteres.", cat: null, req: "in_depth_review", minChars: 55, target: 1, xp: 140, icon: "🔍" },
      { title: "Sessão da Meia-Noite", desc: "Registre 1 filme assistido ou planejado.", cat: "filme", req: "category_count", target: 1, xp: 120, icon: "🌙" },
      { title: "Aprovação do Júri", desc: "Avalie 2 obras com nota 4 ou superior.", cat: null, req: "high_rating", minRating: 4.0, target: 2, xp: 180, icon: "⚖️" },
    ]
  }
];

/**
 * Retorna as informações da quinzena atual (ou de uma data específica)
 */
export function getCurrentPeriod(refDate = new Date()) {
  const d = new Date(refDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()];

  let quinzena = 1;
  let periodKey = "";
  let periodLabel = "";
  let startDate = null;
  let endDate = null;

  if (day <= 15) {
    quinzena = 1;
    periodKey = `${year}-${String(month).padStart(2, "0")}-Q1`;
    periodLabel = `1ª Quinzena de ${monthName} (01 a 15)`;
    startDate = new Date(year, d.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(year, d.getMonth(), 15, 23, 59, 59, 999);
  } else {
    quinzena = 2;
    const lastDay = new Date(year, month, 0).getDate();
    periodKey = `${year}-${String(month).padStart(2, "0")}-Q2`;
    periodLabel = `2ª Quinzena de ${monthName} (16 a ${lastDay})`;
    startDate = new Date(year, d.getMonth(), 16, 0, 0, 0, 0);
    endDate = new Date(year, d.getMonth(), lastDay, 23, 59, 59, 999);
  }

  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    year,
    month,
    quinzena,
    periodKey,
    periodLabel,
    monthName,
    startDate,
    endDate,
    remainingDays
  };
}

/**
 * Tenta gerar missões via Gemini se a API Key estiver configurada
 */
async function tryGenerateWithGemini(periodInfo) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Você é a IA curadora do app Keeplay, um hub de filmes, séries, livros e jogos.
Crie exatamente 4 missões culturais quinzenais divertidas e equilibradas para o período: "${periodInfo.periodLabel}".
Retorne APENAS um JSON válido no seguinte formato:
{
  "theme": "Nome Criativo do Tema Quinzenal",
  "missions": [
    {
      "title": "Título chamativo",
      "description": "Descrição clara do objetivo",
      "category": "filme" | "serie" | "livro" | "jogo" | null,
      "requirement_type": "category_count" | "high_rating" | "in_depth_review" | "total_items",
      "min_rating": 4.0 (ou null),
      "min_chars": 50 (ou null),
      "target_count": 1 ou 2,
      "reward_xp": 120 a 220,
      "icon": "emoji temático"
    }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.missions && parsed.missions.length === 4) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Aviso: Falha ao chamar Gemini, usando gerador procedural de IA:", err.message);
  }
  return null;
}

/**
 * Gerador de IA Autônomo e Estocástico do Keeplay
 * Seleciona e customiza missões aleatórias a cada quinzena
 */
function generateProceduralMissions(periodInfo) {
  // Sorteia um tema cultural
  const themeIndex = Math.floor(Math.random() * AI_CULTURAL_THEMES.length);
  const selectedTheme = AI_CULTURAL_THEMES[themeIndex];

  // Adiciona variabilidade aos XP e metas
  const missions = selectedTheme.missions.map(m => {
    // Leve variação estocástica (+- 10 a 20 XP)
    const xpVariation = (Math.floor(Math.random() * 5) - 2) * 10;
    const finalXp = Math.max(100, Math.min(250, m.xp + xpVariation));

    return {
      title: m.title,
      description: m.desc,
      category: m.cat,
      requirement_type: m.req,
      min_rating: m.minRating || null,
      min_chars: m.minChars || null,
      target_count: m.target,
      reward_xp: finalXp,
      icon: m.icon
    };
  });

  return {
    theme: selectedTheme.theme,
    missions
  };
}

/**
 * Função principal: Gera e persiste as 4 missões quinzenais com IA no TiDB Cloud
 */
export async function generateAndSaveBiweeklyMissions(pool, forceNew = false) {
  const periodInfo = getCurrentPeriod();

  // 1. Se não for forçado, verifica se já existem missões para a quinzena atual
  if (!forceNew) {
    const [existing] = await pool.query(
      "SELECT * FROM monthly_missions WHERE month_year = ?",
      [periodInfo.periodKey]
    );
    if (existing.length >= 4) {
      return {
        periodInfo,
        theme: existing[0].ai_theme || "Quinzena Cultural Keeplay",
        missions: existing,
        created: false
      };
    }
  }

  // 2. Se for forçado (botão "Sortear Novas com IA"), limpa as anteriores desta quinzena
  if (forceNew) {
    // Obtém IDs desta quinzena para limpar progresso associado se necessário
    const [oldMissions] = await pool.query(
      "SELECT id FROM monthly_missions WHERE month_year = ?",
      [periodInfo.periodKey]
    );
    if (oldMissions.length > 0) {
      const oldIds = oldMissions.map(m => m.id);
      await pool.query("DELETE FROM user_mission_progress WHERE mission_id IN (?)", [oldIds]);
      await pool.query("DELETE FROM monthly_missions WHERE month_year = ?", [periodInfo.periodKey]);
    }
  }

  // 3. Executa a IA (Gemini com fallback autônomo procedural)
  let aiResult = await tryGenerateWithGemini(periodInfo);
  if (!aiResult) {
    aiResult = generateProceduralMissions(periodInfo);
  }

  const { theme, missions } = aiResult;
  const createdMissions = [];

  for (const m of missions) {
    const missionId = `mis_${periodInfo.periodKey.toLowerCase()}_${crypto.randomBytes(4).toString("hex")}`;
    
    await pool.query(
      `INSERT INTO monthly_missions 
        (id, month_year, title, description, category, target_count, reward_xp, icon, expires_at, period_label, ai_generated, ai_theme, requirement_type, min_rating, min_chars)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        missionId,
        periodInfo.periodKey,
        m.title,
        m.description,
        m.category,
        m.target_count,
        m.reward_xp,
        m.icon,
        periodInfo.endDate,
        periodInfo.periodLabel,
        theme,
        m.requirement_type || "category_count",
        m.min_rating || null,
        m.min_chars || null
      ]
    );

    createdMissions.push({
      id: missionId,
      month_year: periodInfo.periodKey,
      title: m.title,
      description: m.description,
      category: m.category,
      target_count: m.target_count,
      reward_xp: m.reward_xp,
      icon: m.icon,
      expires_at: periodInfo.endDate,
      period_label: periodInfo.periodLabel,
      ai_generated: 1,
      ai_theme: theme,
      requirement_type: m.requirement_type,
      min_rating: m.min_rating,
      min_chars: m.min_chars
    });
  }

  return {
    periodInfo,
    theme,
    missions: createdMissions,
    created: true
  };
}
