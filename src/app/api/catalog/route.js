import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { calculateMissionsProgress, checkAndUnlockAchievements, computeCulturalAffinity, getTitleByXp } from "@/lib/gamification";

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

const XP_BY_RATING = { 1: 30, 2: 40, 3: 50, 4: 60, 5: 80 };

export async function GET(req) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Se o pedido for para o catálogo de outro usuário
    if (targetUserId && targetUserId !== user.id) {
      const [targetRows] = await pool.query(
        "SELECT id, name, username, avatar_url, equipped_title, total_xp, is_private FROM users WHERE id = ?",
        [targetUserId]
      );
      if (targetRows.length === 0) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }
      const targetUser = targetRows[0];
      targetUser.equipped_title = getTitleByXp(targetUser.total_xp);

      if (targetUser.is_private) {
        return NextResponse.json({
          user: targetUser,
          isPrivate: true,
          items: [],
          lists: [],
          affinity: { percentage: 50, label: "Perfil Privado" }
        });
      }

      let targetQuery = `
        SELECT m.*,
          GROUP_CONCAT(p.id SEPARATOR ',') as provider_ids,
          GROUP_CONCAT(p.name SEPARATOR ',') as provider_names,
          MAX(cl.started_at) as started_at,
          MAX(cl.finished_at) as finished_at
        FROM media_items m
        LEFT JOIN media_item_providers mip ON mip.media_item_id = m.id
        LEFT JOIN providers p ON p.id = mip.provider_id
        LEFT JOIN consumption_logs cl ON cl.media_item_id = m.id AND cl.user_id = m.user_id
        WHERE m.user_id = ?
      `;
      const targetParams = [targetUserId];

      if (category && category !== "todos") { targetQuery += " AND m.category = ?"; targetParams.push(category); }
      if (status && status !== "todos") { targetQuery += " AND m.status = ?"; targetParams.push(status); }
      if (search) { targetQuery += " AND m.title LIKE ?"; targetParams.push("%" + search + "%"); }

      targetQuery += " GROUP BY m.id ORDER BY m.created_at DESC";

      const [targetItems] = await pool.query(targetQuery, targetParams);
      const itemsFormatted = targetItems.map(item => ({
        ...item,
        providers: item.provider_ids
          ? item.provider_ids.split(",").map((id, i) => ({
              id,
              name: item.provider_names ? item.provider_names.split(",")[i] : id
            }))
          : []
      }));

      // Listas públicas do usuário
      const [publicLists] = await pool.query(`
        SELECT cl.id, cl.title, cl.description, cl.visibility, cl.created_at,
          COUNT(cli.media_item_id) as items_count
        FROM custom_lists cl
        LEFT JOIN custom_list_items cli ON cli.list_id = cl.id
        WHERE cl.user_id = ? AND cl.visibility = 'publica'
        GROUP BY cl.id
        ORDER BY cl.created_at DESC
      `, [targetUserId]);

      // Buscar itens do usuário logado para calcular a afinidade cultural real
      const [myItems] = await pool.query(
        "SELECT id, title, category, rating FROM media_items WHERE user_id = ?",
        [user.id]
      );
      const affinity = computeCulturalAffinity(myItems, targetItems, targetUserId);

      return NextResponse.json({
        user: targetUser,
        isPrivate: false,
        items: itemsFormatted,
        lists: publicLists,
        affinity
      });
    }

    // Comportamento padrão: catálogo do próprio usuário autenticado
    let query = `
      SELECT m.*,
        GROUP_CONCAT(p.id SEPARATOR ',') as provider_ids,
        GROUP_CONCAT(p.name SEPARATOR ',') as provider_names,
        MAX(cl.started_at) as started_at,
        MAX(cl.finished_at) as finished_at
      FROM media_items m
      LEFT JOIN media_item_providers mip ON mip.media_item_id = m.id
      LEFT JOIN providers p ON p.id = mip.provider_id
      LEFT JOIN consumption_logs cl ON cl.media_item_id = m.id AND cl.user_id = m.user_id
      WHERE m.user_id = ?
    `;
    const params = [user.id];

    if (category && category !== "todos") { query += " AND m.category = ?"; params.push(category); }
    if (status && status !== "todos") { query += " AND m.status = ?"; params.push(status); }
    if (search) { query += " AND m.title LIKE ?"; params.push("%" + search + "%"); }

    query += " GROUP BY m.id ORDER BY m.created_at DESC";

    const [items] = await pool.query(query, params);

    const itemsFormatted = items.map(item => ({
      ...item,
      providers: item.provider_ids
        ? item.provider_ids.split(",").map((id, i) => ({
            id,
            name: item.provider_names ? item.provider_names.split(",")[i] : id
          }))
        : []
    }));

    return NextResponse.json({ items: itemsFormatted });
  } catch (error) {
    console.error("Erro ao buscar catalogo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const body = await req.json();
    const {
      title, category, status, rating, comment, is_spoiler,
      cover_image, current_progress, total_progress, season_current,
      hours_spent, is_rewatch, providers = [], date_started, date_finished
    } = body;

    if (!title || !category || !status) {
      return NextResponse.json({ error: "Campos obrigatorios ausentes" }, { status: 400 });
    }

    const id = uuidv4();
    const xp = XP_BY_RATING[rating] || 50;

    await pool.query(
      `INSERT INTO media_items
        (id, user_id, title, category, status, rating, comment, is_spoiler, cover_image,
         current_progress, total_progress, season_current, hours_spent, is_rewatch, xp_gained)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.id, title, category, status, rating || null, comment || null,
       is_spoiler ? 1 : 0, cover_image || null,
       current_progress || 0, total_progress || 0, season_current || 1,
       hours_spent || 0, is_rewatch ? 1 : 0, xp]
    );

    for (const pid of providers) {
      await pool.query("INSERT IGNORE INTO media_item_providers (media_item_id, provider_id) VALUES (?, ?)", [id, pid]);
    }

    if (date_started || date_finished) {
      await pool.query(
        `INSERT INTO consumption_logs (id, media_item_id, user_id, started_at, finished_at, is_rewatch) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, user.id, date_started || null, date_finished || null, is_rewatch ? 1 : 0]
      );
    }

    await pool.query("UPDATE users SET total_xp = total_xp + ? WHERE id = ?", [xp, user.id]);

    try {
      await pool.query(
        `INSERT INTO activity_feed 
          (id, user_id, activity_type, media_item_id, title, media_title, cover_image, rating, comment, is_spoiler, metadata, created_at)
         VALUES (?, ?, 'item', ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          uuidv4(),
          user.id,
          id,
          `registrou uma nova obra`,
          title,
          cover_image || null,
          rating || null,
          comment || null,
          is_spoiler ? 1 : 0,
          JSON.stringify({ category })
        ]
      );
    } catch (e) {
      console.error("Erro ao registrar no activity_feed:", e);
    }

    // Gamification: update missions progress & evaluate achievements
    let newlyUnlocked = [];
    try {
      await calculateMissionsProgress(user.id, pool);
      const resAch = await checkAndUnlockAchievements(user.id, pool);
      newlyUnlocked = resAch.newlyUnlocked;
    } catch (gErr) {
      console.error("Erro ao avaliar gamificação:", gErr);
    }

    return NextResponse.json({ success: true, id, xp_gained: xp, newly_unlocked: newlyUnlocked });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}