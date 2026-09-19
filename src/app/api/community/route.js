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
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get the activity feed
    const [feed] = await pool.query(`
      SELECT af.*, u.name as user_name, u.username as user_username, u.avatar_url 
      FROM activity_feed af
      JOIN users u ON u.id = af.user_id
      WHERE af.user_id = ? 
         OR af.user_id IN (
            SELECT addressee_id FROM user_connections WHERE requester_id = ? AND status = 'accepted'
            UNION
            SELECT requester_id FROM user_connections WHERE addressee_id = ? AND status = 'accepted'
         )
      ORDER BY af.created_at DESC
      LIMIT 30
    `, [userAuth.id, userAuth.id, userAuth.id]);

    // Get Friends
    const [friends] = await pool.query(`
      SELECT u.id, u.name, u.username, u.avatar_url, u.equipped_title, u.total_xp
      FROM user_connections c
      JOIN users u ON u.id = CASE WHEN c.requester_id = ? THEN c.addressee_id ELSE c.requester_id END
      WHERE (c.requester_id = ? OR c.addressee_id = ?) AND c.status = 'accepted'
    `, [userAuth.id, userAuth.id, userAuth.id]);

    // Get Pending Requests
    const [requests] = await pool.query(`
      SELECT c.id as connection_id, u.id, u.name, u.username, u.avatar_url
      FROM user_connections c
      JOIN users u ON u.id = c.requester_id
      WHERE c.addressee_id = ? AND c.status = 'pending'
    `, [userAuth.id]);

    return NextResponse.json({ feed, friends, requests });
  } catch (error) {
    console.error("Erro na comunidade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
