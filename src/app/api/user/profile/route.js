import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getTitleByXp, getNextTitleInfo } from "@/lib/gamification";

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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [rows] = await pool.query("SELECT * FROM v_user_stats WHERE user_id = ?", [userAuth.id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const userStats = rows[0];
    const autoTitle = getTitleByXp(userStats.total_xp);
    if (userStats.equipped_title !== autoTitle) {
      await pool.query("UPDATE users SET equipped_title = ? WHERE id = ?", [autoTitle, userAuth.id]);
      userStats.equipped_title = autoTitle;
    }

    const currentLevel = Math.floor((userStats.total_xp || 0) / 500) + 1;
    const nextTitle = getNextTitleInfo(currentLevel);

    // Get Achievements
    const [achievements] = await pool.query(`
      SELECT a.*, ua.unlocked_at 
      FROM user_achievements ua
      JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `, [userAuth.id]);

    const [unlockedTitles] = await pool.query(
      "SELECT title_name FROM user_unlocked_titles WHERE user_id = ?",
      [userAuth.id]
    );

    return NextResponse.json({
      profile: {
        ...userStats,
        equipped_title: autoTitle,
        current_level: currentLevel,
        next_title: nextTitle,
        unlocked_titles: unlockedTitles.map(t => t.title_name)
      },
      achievements
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { name, username, bio, is_private, avatar_url, new_password } = await req.json();

    // Título Honorífico sempre é calculado pelo nível real de XP do usuário
    const [userRows] = await pool.query("SELECT total_xp FROM users WHERE id = ?", [userAuth.id]);
    const userTotalXp = userRows[0]?.total_xp || 0;
    const autoTitle = getTitleByXp(userTotalXp);

    let updateQuery = "UPDATE users SET name=?, username=?, bio=?, is_private=?, equipped_title=?, avatar_url=? WHERE id=?";
    let params = [name, username, bio, is_private ? 1 : 0, autoTitle, avatar_url || null, userAuth.id];

    if (new_password && new_password.length >= 6) {
      const hash = await bcrypt.hash(new_password, 10);
      updateQuery = "UPDATE users SET name=?, username=?, bio=?, is_private=?, equipped_title=?, avatar_url=?, password_hash=? WHERE id=?";
      params = [name, username, bio, is_private ? 1 : 0, autoTitle, avatar_url || null, hash, userAuth.id];
    }

    await pool.query(updateQuery, params);

    const [rows] = await pool.query("SELECT * FROM v_user_stats WHERE user_id = ?", [userAuth.id]);
    const updatedProfile = rows[0] || null;
    if (updatedProfile) {
      updatedProfile.equipped_title = autoTitle;
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await pool.query("DELETE FROM users WHERE id = ?", [userAuth.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
