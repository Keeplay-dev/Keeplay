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

export async function PUT(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const {
      title, category, status, rating, comment, is_spoiler,
      cover_image, current_progress, total_progress, season_current,
      hours_spent, is_rewatch, providers = [], date_started, date_finished
    } = body;

    await pool.query(
      `UPDATE media_items SET
        title=?, category=?, status=?, rating=?, comment=?, is_spoiler=?,
        cover_image=?, current_progress=?, total_progress=?, season_current=?,
        hours_spent=?, is_rewatch=?
       WHERE id=? AND user_id=?`,
      [title, category, status, rating || null, comment || null, is_spoiler ? 1 : 0,
       cover_image || null, current_progress || 0, total_progress || 0,
       season_current || 1, hours_spent || 0, is_rewatch ? 1 : 0, id, user.id]
    );

    // Update providers: delete existing then re-insert
    await pool.query("DELETE FROM media_item_providers WHERE media_item_id = ?", [id]);
    for (const pid of providers) {
      await pool.query("INSERT IGNORE INTO media_item_providers (media_item_id, provider_id) VALUES (?, ?)", [id, pid]);
    }

    // Update consumption log
    if (date_started || date_finished) {
      const [existing] = await pool.query("SELECT id FROM consumption_logs WHERE media_item_id=? AND user_id=? LIMIT 1", [id, user.id]);
      if (existing.length > 0) {
        await pool.query("UPDATE consumption_logs SET started_at=?, finished_at=? WHERE media_item_id=? AND user_id=?",
          [date_started || null, date_finished || null, id, user.id]);
      } else {
        const { v4: uuidv4 } = await import("uuid");
        await pool.query("INSERT INTO consumption_logs (id, media_item_id, user_id, started_at, finished_at, is_rewatch) VALUES (?, ?, ?, ?, ?, ?)",
          [uuidv4(), id, user.id, date_started || null, date_finished || null, is_rewatch ? 1 : 0]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await params;
    await pool.query("DELETE FROM media_items WHERE id = ? AND user_id = ?", [id, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}