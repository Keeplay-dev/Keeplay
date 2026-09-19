import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export async function POST(req, { params }) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: activityId } = await params;
    const body = await req.json().catch(() => ({}));
    const reaction = body.reaction || "like";

    if (!["like", "applause", "fire"].includes(reaction)) {
      return NextResponse.json({ error: "Reação inválida" }, { status: 400 });
    }

    // Verifica se já existe essa reação do usuário
    const [existing] = await pool.query(
      "SELECT reaction FROM feed_reactions WHERE activity_id = ? AND user_id = ?",
      [activityId, userAuth.id]
    );

    let userLiked = false;

    if (existing.length > 0) {
      if (existing[0].reaction === reaction) {
        // Descurtir / remover reação
        await pool.query(
          "DELETE FROM feed_reactions WHERE activity_id = ? AND user_id = ?",
          [activityId, userAuth.id]
        );
        userLiked = false;
      } else {
        // Alterar tipo de reação
        await pool.query(
          "UPDATE feed_reactions SET reaction = ?, created_at = NOW() WHERE activity_id = ? AND user_id = ?",
          [reaction, activityId, userAuth.id]
        );
        userLiked = true;
      }
    } else {
      // Inserir nova reação
      await pool.query(
        "INSERT INTO feed_reactions (activity_id, user_id, reaction, created_at) VALUES (?, ?, ?, NOW())",
        [activityId, userAuth.id, reaction]
      );
      userLiked = true;
    }

    // Contar total de curtidas e reações atualizadas
    const [counts] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN reaction = 'like' THEN 1 END) as likes_count,
        COUNT(CASE WHEN reaction = 'applause' THEN 1 END) as applause_count,
        COUNT(CASE WHEN reaction = 'fire' THEN 1 END) as fire_count
       FROM feed_reactions WHERE activity_id = ?`,
      [activityId]
    );

    const stats = counts[0] || { likes_count: 0, applause_count: 0, fire_count: 0 };

    return NextResponse.json({
      success: true,
      user_liked: userLiked,
      reaction: userLiked ? reaction : null,
      likes_count: Number(stats.likes_count),
      applause_count: Number(stats.applause_count),
      fire_count: Number(stats.fire_count)
    });
  } catch (error) {
    console.error("Erro ao reagir ao feed:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
