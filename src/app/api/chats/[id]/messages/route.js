import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("keeplay_token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export async function GET(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id: otherId } = await params;

    const [messages] = await pool.query(
      `SELECT id, sender_id, receiver_id, message_text, is_read, created_at
       FROM chat_messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC
       LIMIT 100`,
      [user.id, otherId, otherId, user.id]
    );

    // Mark received messages as read
    await pool.query(
      "UPDATE chat_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0",
      [otherId, user.id]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id: receiverId } = await params;
    const { message_text } = await req.json();

    if (!message_text?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

    const id = uuidv4();
    await pool.query(
      "INSERT INTO chat_messages (id, sender_id, receiver_id, message_text) VALUES (?, ?, ?, ?)",
      [id, user.id, receiverId, message_text.trim()]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}