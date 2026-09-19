import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

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

import { checkAndUnlockAchievements } from "@/lib/gamification";

export async function GET(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const userId = userAuth.id;

    // Avalia conquistas e calcula progresso real
    const result = await checkAndUnlockAchievements(userId, pool);

    return NextResponse.json({
      achievements: result.achievements,
      total_unlocked: result.totalUnlocked,
      total_count: result.totalAchievements,
      newly_unlocked: result.newlyUnlocked
    });

  } catch (error) {
    console.error("Achievements API Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
