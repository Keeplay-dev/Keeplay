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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    // 1. Query do Feed de Atividades
    let feedWhere = "";
    let feedParams = [userAuth.id, userAuth.id];

    if (filter === "friends") {
      feedWhere = `WHERE af.user_id = ? 
        OR af.user_id IN (
          SELECT addressee_id FROM user_connections WHERE requester_id = ? AND status = 'accepted'
          UNION
          SELECT requester_id FROM user_connections WHERE addressee_id = ? AND status = 'accepted'
        )`;
      feedParams = [userAuth.id, userAuth.id, userAuth.id, userAuth.id];
    } else {
      // Feed global da comunidade (usuários públicos + o próprio usuário)
      feedWhere = `WHERE u.is_private = 0 OR af.user_id = ?`;
      feedParams = [userAuth.id, userAuth.id];
    }

    const [feed] = await pool.query(`
      SELECT 
        af.id,
        af.user_id,
        af.activity_type,
        af.media_item_id,
        af.title,
        af.media_title,
        af.cover_image,
        af.rating,
        af.comment,
        af.is_spoiler,
        af.metadata,
        af.created_at,
        u.name as user_name, 
        u.username as user_username, 
        u.avatar_url,
        u.equipped_title as user_equipped_title,
        m.category as media_category,
        COALESCE(r.likes_count, 0) as likes_count,
        COALESCE(r.applause_count, 0) as applause_count,
        COALESCE(r.fire_count, 0) as fire_count,
        CASE WHEN my_r.activity_id IS NOT NULL THEN 1 ELSE 0 END as user_liked,
        my_r.reaction as user_reaction
      FROM activity_feed af
      JOIN users u ON u.id = af.user_id
      LEFT JOIN media_items m ON m.id = af.media_item_id
      LEFT JOIN (
        SELECT 
          activity_id,
          COUNT(CASE WHEN reaction = 'like' THEN 1 END) as likes_count,
          COUNT(CASE WHEN reaction = 'applause' THEN 1 END) as applause_count,
          COUNT(CASE WHEN reaction = 'fire' THEN 1 END) as fire_count
        FROM feed_reactions
        GROUP BY activity_id
      ) r ON r.activity_id = af.id
      LEFT JOIN feed_reactions my_r ON my_r.activity_id = af.id AND my_r.user_id = ?
      ${feedWhere}
      ORDER BY af.created_at DESC
      LIMIT 50
    `, feedParams);

    // 2. Amigos confirmados
    const [friends] = await pool.query(`
      SELECT u.id, u.name, u.username, u.avatar_url, u.equipped_title, u.total_xp
      FROM user_connections c
      JOIN users u ON u.id = CASE WHEN c.requester_id = ? THEN c.addressee_id ELSE c.requester_id END
      WHERE (c.requester_id = ? OR c.addressee_id = ?) AND c.status = 'accepted'
    `, [userAuth.id, userAuth.id, userAuth.id]);

    // 3. Solicitações recebidas pendentes
    const [requests] = await pool.query(`
      SELECT c.id as connection_id, u.id, u.name, u.username, u.avatar_url
      FROM user_connections c
      JOIN users u ON u.id = c.requester_id
      WHERE c.addressee_id = ? AND c.status = 'pending'
    `, [userAuth.id]);

    // 4. Solicitações enviadas pendentes
    const [sentRequests] = await pool.query(`
      SELECT c.id as connection_id, u.id, u.name, u.username, u.avatar_url
      FROM user_connections c
      JOIN users u ON u.id = c.addressee_id
      WHERE c.requester_id = ? AND c.status = 'pending'
    `, [userAuth.id]);

    return NextResponse.json({ feed, friends, requests, sentRequests });
  } catch (error) {
    console.error("Erro na comunidade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
