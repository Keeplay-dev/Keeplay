import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("keeplay_token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.equipped_title, 
        u.avatar_url, 
        u.is_private, 
        u.bio, 
        u.total_xp,
        (SELECT COUNT(*) FROM media_items WHERE user_id = u.id) as total_items,
        c.id as connection_id,
        c.status as connection_status,
        c.requester_id as connection_requester_id,
        CASE WHEN c.status = 'accepted' THEN 1 ELSE 0 END as is_friend,
        CASE WHEN c.status = 'pending' AND c.requester_id = ? THEN 1 ELSE 0 END as request_sent_by_me,
        CASE WHEN c.status = 'pending' AND c.addressee_id = ? THEN 1 ELSE 0 END as request_received_by_me
      FROM users u
      LEFT JOIN user_connections c ON 
        ((c.requester_id = ? AND c.addressee_id = u.id) OR (c.requester_id = u.id AND c.addressee_id = ?))
      WHERE u.id != ? AND u.is_private = 0 
      ORDER BY u.created_at DESC 
      LIMIT 50`,
      [user.id, user.id, user.id, user.id, user.id]
    );

    return NextResponse.json({ users, currentUserId: user.id });
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}