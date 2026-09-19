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

    const [rows] = await pool.query(`
      SELECT v.*, u.bio, u.avatar_url, u.is_private
      FROM v_user_stats v
      JOIN users u ON u.id = v.user_id
      WHERE v.user_id = ?
    `, [userAuth.id]);
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

    // Calculate average rating
    const [avgRows] = await pool.query(`
      SELECT ROUND(AVG(rating), 1) as avg_rating
      FROM media_items
      WHERE user_id = ? AND rating IS NOT NULL AND rating > 0
    `, [userAuth.id]);
    const averageRating = avgRows[0]?.avg_rating ? String(avgRows[0].avg_rating) : "0.0";

    return NextResponse.json({
      profile: {
        ...userStats,
        level: currentLevel,
        current_level: currentLevel,
        equipped_title: autoTitle,
        average_rating: averageRating,
        hours_spent: userStats.total_hours_invested ? `${Math.round(Number(userStats.total_hours_invested))}h` : "0h",
        total_items: userStats.total_media_items || 0,
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

    const trimmedUsername = String(username || "").trim();
    const cleanUsername = trimmedUsername.toLowerCase();

    if (trimmedUsername) {
      const usernameRegex = /^[a-zA-Z0-9_.]+$/;
      if (trimmedUsername.length < 3 || trimmedUsername.length > 30 || !usernameRegex.test(trimmedUsername)) {
        return NextResponse.json({
          error: "O nome de usuário deve ter entre 3 e 30 caracteres e conter apenas letras, números, sublinhado (_) ou ponto (.)."
        }, { status: 400 });
      }

      const [existing] = await pool.query(
        "SELECT id FROM users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND id != ?",
        [cleanUsername, cleanUsername + "@keeplay.local", userAuth.id]
      );
      if (existing.length > 0) {
        return NextResponse.json({
          error: "Este nome de usuário já está em uso por outro usuário. Por favor, escolha outro."
        }, { status: 409 });
      }
    }

    if (new_password) {
      const passwordStr = String(new_password || "");
      const missingRequirements = [];
      if (passwordStr.length < 6) {
        missingRequirements.push("no mínimo 6 caracteres");
      }
      if (!/[a-zA-Z]/.test(passwordStr)) {
        missingRequirements.push("pelo menos uma letra");
      }
      if (!/[0-9]/.test(passwordStr)) {
        missingRequirements.push("pelo menos um número");
      }

      if (missingRequirements.length > 0) {
        return NextResponse.json({
          error: `A nova senha é muito fraca. Requisitos necessários: ela deve conter ${missingRequirements.join(", ")}.`
        }, { status: 400 });
      }
    }

    // Título Honorífico sempre é calculado pelo nível real de XP do usuário
    const [userRows] = await pool.query("SELECT total_xp FROM users WHERE id = ?", [userAuth.id]);
    const userTotalXp = userRows[0]?.total_xp || 0;
    const autoTitle = getTitleByXp(userTotalXp);

    let updateQuery = "UPDATE users SET name=?, username=?, bio=?, is_private=?, equipped_title=?, avatar_url=? WHERE id=?";
    let params = [name, trimmedUsername || username, bio, is_private ? 1 : 0, autoTitle, avatar_url || null, userAuth.id];

    if (new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      updateQuery = "UPDATE users SET name=?, username=?, bio=?, is_private=?, equipped_title=?, avatar_url=?, password_hash=? WHERE id=?";
      params = [name, trimmedUsername || username, bio, is_private ? 1 : 0, autoTitle, avatar_url || null, hash, userAuth.id];
    }

    await pool.query(updateQuery, params);

    const [rows] = await pool.query(`
      SELECT v.*, u.bio, u.avatar_url, u.is_private
      FROM v_user_stats v
      JOIN users u ON u.id = v.user_id
      WHERE v.user_id = ?
    `, [userAuth.id]);
    const updatedProfile = rows[0] || null;
    if (updatedProfile) {
      const currentLevel = Math.floor(((updatedProfile.total_xp || 0)) / 500) + 1;
      updatedProfile.equipped_title = autoTitle;
      updatedProfile.level = currentLevel;
      updatedProfile.current_level = currentLevel;
      updatedProfile.hours_spent = updatedProfile.total_hours_invested ? `${Math.round(Number(updatedProfile.total_hours_invested))}h` : "0h";
      updatedProfile.total_items = updatedProfile.total_media_items || 0;
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
