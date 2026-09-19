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

import { calculateMissionsProgress, claimMissionReward } from "@/lib/gamification";

export async function GET(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Garantir que existem missões no mês atual
    const [existingMissions] = await pool.query(
      "SELECT * FROM monthly_missions WHERE month_year = ?",
      [currentMonthYear]
    );

    if (existingMissions.length === 0) {
      const shuffled = [...MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);

      for (const tmpl of selected) {
        const id = 'mis_' + crypto.randomBytes(8).toString('hex');
        await pool.query(
          `INSERT INTO monthly_missions (id, month_year, title, description, category, target_count, reward_xp, icon, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, currentMonthYear, tmpl.title, tmpl.description, tmpl.category, tmpl.target_count, tmpl.reward_xp, tmpl.icon, endOfMonth]
        );
      }
    }

    // 2. Calcula progresso dinâmico baseado nas obras reais do usuário
    const missionsWithProgress = await calculateMissionsProgress(user.id, pool);

    return NextResponse.json({ missions: missionsWithProgress });
  } catch (error) {
    console.error("Erro nas missões mensais:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { mission_id } = await req.json();
    if (!mission_id) {
      return NextResponse.json({ error: "ID da missão é obrigatório" }, { status: 400 });
    }

    // Resgata recompensa, adiciona XP e verifica conquistas
    const result = await claimMissionReward(user.id, mission_id, pool);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao resgatar missão:", error);
    return NextResponse.json({ error: error.message || "Erro ao resgatar missão" }, { status: 400 });
  }
}
