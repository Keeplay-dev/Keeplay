import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { computeCulturalAffinity, getTitleByXp } from "@/lib/gamification";

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

    // Buscar itens culturais do usuário autenticado para cálculo de afinidade
    const [myItems] = await pool.query(
      "SELECT id, category, title, rating FROM media_items WHERE user_id = ?",
      [user.id]
    );

    // Buscar itens dos usuários da comunidade em lote para desempenho
    const userIds = users.map(u => u.id);
    let itemsByUser = {};
    if (userIds.length > 0) {
      const [allItems] = await pool.query(
        "SELECT user_id, id, category, title, rating FROM media_items WHERE user_id IN (?)",
        [userIds]
      );
      itemsByUser = allItems.reduce((acc, item) => {
        if (!acc[item.user_id]) acc[item.user_id] = [];
        acc[item.user_id].push(item);
        return acc;
      }, {});
    }

    // Processar afinidade cultural real e garantir título correspondente ao nível de XP
    const enrichedUsers = users.map(u => {
      const userItems = itemsByUser[u.id] || [];
      const affinity = computeCulturalAffinity(myItems, userItems, u.id);
      const titleByLevel = getTitleByXp(u.total_xp);

      return {
        ...u,
        equipped_title: titleByLevel,
        affinity_score: affinity.percentage,
        affinity_label: affinity.label,
        affinity: affinity
      };
    });

    return NextResponse.json({ users: enrichedUsers, currentUserId: user.id });
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}