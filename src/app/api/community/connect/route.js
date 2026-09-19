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

    const body = await req.json();
    const addressee_id = body.addressee_id;
    const auto_accept = Boolean(body.auto_accept);

    if (!addressee_id) return NextResponse.json({ error: "ID necessario" }, { status: 400 });

    const targetStatus = auto_accept ? "accepted" : "pending";

    // Verifica se já existe conexão em qualquer direção
    const [existing] = await pool.query(
      "SELECT id, status FROM user_connections WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
      [user.id, addressee_id, addressee_id, user.id]
    );

    if (existing.length > 0) {
      if (auto_accept && existing[0].status !== "accepted") {
        await pool.query("UPDATE user_connections SET status = 'accepted' WHERE id = ?", [existing[0].id]);
      }
      return NextResponse.json({ success: true, connection_id: existing[0].id, status: auto_accept ? "accepted" : existing[0].status });
    }

    const id = uuidv4();
    await pool.query(
      "INSERT INTO user_connections (id, requester_id, addressee_id, status) VALUES (?, ?, ?, ?)",
      [id, user.id, addressee_id, targetStatus]
    );

    return NextResponse.json({ success: true, connection_id: id, status: targetStatus });
  } catch (error) {
    console.error("Erro ao enviar solicitacao:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}