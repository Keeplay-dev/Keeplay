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

export async function GET(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [rows] = await pool.query(`
      WITH ranked_messages AS (
          SELECT 
              m.*,
              ROW_NUMBER() OVER (
                  PARTITION BY 
                      LEAST(m.sender_id, m.receiver_id), 
                      GREATEST(m.sender_id, m.receiver_id)
                  ORDER BY m.created_at DESC
              ) AS rn
          FROM chat_messages m
          WHERE m.sender_id = ? OR m.receiver_id = ?
      )
      SELECT 
          rm.id AS last_message_id,
          rm.sender_id,
          rm.receiver_id,
          rm.message_text AS last_message_text,
          rm.is_read AS last_message_is_read,
          rm.created_at AS last_message_time,
          u_other.id AS other_user_id,
          u_other.name AS other_user_name,
          u_other.username AS other_user_username,
          u_other.avatar_url AS other_user_avatar
      FROM ranked_messages rm
      JOIN users u_other ON u_other.id = CASE WHEN rm.sender_id = ? THEN rm.receiver_id ELSE rm.sender_id END
      WHERE rm.rn = 1
      ORDER BY rm.created_at DESC
    `, [user.id, user.id, user.id]);

    return NextResponse.json({ chats: rows });
  } catch (error) {
    console.error("Erro ao buscar chats:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
