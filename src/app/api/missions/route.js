import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getCurrentPeriod, generateAndSaveBiweeklyMissions } from "@/lib/missionAi";
import { calculateMissionsProgress, claimMissionReward } from "@/lib/gamification";

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
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const periodInfo = getCurrentPeriod();

    // 1. Garantir que existem missões geradas por IA para a quinzena atual
    const [existingMissions] = await pool.query(
      "SELECT * FROM monthly_missions WHERE month_year = ?",
      [periodInfo.periodKey]
    );

    let activeTheme = existingMissions[0]?.ai_theme || "Exploração Cultural Keeplay";

    if (existingMissions.length === 0) {
      const generated = await generateAndSaveBiweeklyMissions(pool, false);
      activeTheme = generated.theme;
    }

    // 2. Calcula progresso dinâmico baseado nas obras reais do usuário
    const missionsWithProgress = await calculateMissionsProgress(user.id, pool);

    return NextResponse.json({
      missions: missionsWithProgress,
      periodInfo,
      theme: activeTheme
    });
  } catch (error) {
    console.error("Erro nas missões quinzenais:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { mission_id } = body;

    if (!mission_id) {
      return NextResponse.json({ error: "ID da missão é obrigatório" }, { status: 400 });
    }

    // Resgata recompensa, adiciona XP e verifica conquistas
    const result = await claimMissionReward(user.id, mission_id, pool);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na API de missões:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar requisição" }, { status: 400 });
  }
}
