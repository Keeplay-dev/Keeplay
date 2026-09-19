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

export async function GET(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const userId = userAuth.id;

    const [allAchievements] = await pool.query("SELECT * FROM achievements ORDER BY category");
    const [userAchievements] = await pool.query("SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?", [userId]);

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    const achievements = allAchievements.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlocked_at: userAchievements.find(ua => ua.achievement_id === a.id)?.unlocked_at || null
    }));

    return NextResponse.json({ achievements });

  } catch (error) {
    console.error("Achievements API Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
