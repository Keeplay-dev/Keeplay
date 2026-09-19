import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const [lists] = await pool.query(`
      SELECT cl.*, COUNT(cli.media_item_id) as item_count 
      FROM custom_lists cl
      LEFT JOIN custom_list_items cli ON cl.id = cli.list_id
      WHERE cl.user_id = ?
      GROUP BY cl.id
      ORDER BY cl.created_at DESC
    `, [userAuth.id]);

    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Lists API Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, visibility, itemIds } = body;

    if (!title) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }

    const id = uuidv4();
    await pool.query(
      "INSERT INTO custom_lists (id, user_id, title, description, visibility) VALUES (?, ?, ?, ?, ?)",
      [id, userAuth.id, title, description, visibility || 'publica']
    );

    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      for (const mediaId of itemIds) {
        await pool.query(
          "INSERT INTO custom_list_items (list_id, media_item_id) VALUES (?, ?)",
          [id, mediaId]
        );
      }
    }

    return NextResponse.json({ success: true, list: { id, user_id: userAuth.id, title, description, visibility, item_count: itemIds?.length || 0 } }, { status: 201 });
  } catch (error) {
    console.error("Lists Create API Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
