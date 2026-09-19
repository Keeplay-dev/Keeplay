import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";

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

// Missões padrão
const MISSION_TEMPLATES = [
  { title: 'Sessão Dupla', description: 'Cadastre ou assista a 2 filmes neste mês.', category: 'filme', target_count: 2, reward_xp: 150, icon: '🎬' },
  { title: 'Gamer Determinado', description: 'Avalie ou finalize 2 jogos com 4 ou 5 estrelas.', category: 'jogo', target_count: 2, reward_xp: 180, icon: '🎮' },
  { title: 'Crítico Detalhista', description: 'Escreva 1 resenha aprofundada com mais de 50 caracteres.', category: null, target_count: 1, reward_xp: 120, icon: '✍️' },
  { title: 'Páginas em Foco', description: 'Registre ou conclua 1 livro no seu acervo.', category: 'livro', target_count: 1, reward_xp: 140, icon: '📚' },
  { title: 'Maratonista', description: 'Adicione 3 novas séries ao seu catálogo.', category: 'serie', target_count: 3, reward_xp: 200, icon: '📺' },
  { title: 'Explorador', description: 'Registre 5 obras de qualquer tipo no acervo.', category: null, target_count: 5, reward_xp: 250, icon: '🗺️' }
];

export async function GET(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calculate last day of month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Check if missions exist for current month
    const [existingMissions] = await pool.query(
      "SELECT * FROM monthly_missions WHERE month_year = ?",
      [currentMonthYear]
    );

    let missions = existingMissions;

    // 2. If not, generate random missions for this month
    if (missions.length === 0) {
      // Pick 3 random missions
      const shuffled = [...MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      const insertPromises = selected.map(async (tmpl) => {
        const id = 'mis_' + crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO monthly_missions (id, month_year, title, description, category, target_count, reward_xp, icon, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, currentMonthYear, tmpl.title, tmpl.description, tmpl.category, tmpl.target_count, tmpl.reward_xp, tmpl.icon, endOfMonth]
        );
        return { ...tmpl, id, month_year: currentMonthYear, expires_at: endOfMonth };
      });

      missions = await Promise.all(insertPromises);
    }

    // 3. Fetch user progress for these missions
    const [progress] = await pool.query(
      "SELECT * FROM user_mission_progress WHERE user_id = ? AND mission_id IN (?)",
      [user.id, missions.map(m => m.id)]
    );

    const progressMap = progress.reduce((acc, p) => {
      acc[p.mission_id] = p;
      return acc;
    }, {});

    const missionsWithProgress = missions.map(m => ({
      ...m,
      progress: progressMap[m.id] || { current_count: 0, is_completed: 0, is_claimed: 0 }
    }));

    return NextResponse.json({ missions: missionsWithProgress });
  } catch (error) {
    console.error("Erro nas missões mensais:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
