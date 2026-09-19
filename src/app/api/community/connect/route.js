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

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { addressee_id } = await req.json();
    if (!addressee_id) return NextResponse.json({ error: "ID necessario" }, { status: 400 });

    const id = uuidv4();
    await pool.query(
      "INSERT IGNORE INTO user_connections (id, requester_id, addressee_id, status) VALUES (?, ?, ?, 'pending')",
      [id, user.id, addressee_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar solicitacao:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}