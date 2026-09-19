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
      WITH all_contacts AS (
        -- Apenas amigos confirmados (status = 'accepted')
        SELECT 
          CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END as contact_id,
          MAX(created_at) as connected_at
        FROM user_connections
        WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
        GROUP BY contact_id
      ),
      unique_contacts AS (
        SELECT contact_id, MAX(connected_at) as connected_at
        FROM all_contacts
        GROUP BY contact_id
      ),
      ranked_messages AS (
        SELECT 
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
            ORDER BY m.created_at DESC
          ) AS rn
        FROM chat_messages m
        WHERE m.sender_id = ? OR m.receiver_id = ?
      )
      SELECT 
        u.id AS other_user_id,
        u.name AS other_user_name,
        u.username AS other_user_username,
        u.avatar_url AS other_user_avatar,
        u.equipped_title AS other_user_title,
        rm.id AS last_message_id,
        rm.sender_id,
        rm.receiver_id,
        rm.message_text AS last_message_text,
        rm.is_read AS last_message_is_read,
        rm.created_at AS last_message_time,
        c.connected_at
      FROM unique_contacts c
      JOIN users u ON u.id = c.contact_id
      LEFT JOIN ranked_messages rm ON rm.rn = 1 AND (rm.sender_id = u.id OR rm.receiver_id = u.id)
      ORDER BY COALESCE(rm.created_at, c.connected_at) DESC
    `, [user.id, user.id, user.id, user.id, user.id]);

    return NextResponse.json({ chats: rows });
  } catch (error) {
    console.error("Erro ao buscar chats:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
