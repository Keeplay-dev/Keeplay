import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("keeplay_token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id: otherUserId } = await params;

    await pool.query(
      `DELETE FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      [user.id, otherUserId, otherUserId, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao apagar chat:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}