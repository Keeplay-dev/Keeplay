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
    const { action } = await req.json();
    const newStatus = action === "accept" ? "accepted" : "rejected";

    await pool.query(
      "UPDATE user_connections SET status = ? WHERE id = ? AND addressee_id = ?",
      [newStatus, id, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao responder solicitacao:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

    const { id } = await params;

    const [result] = await pool.query(
      `DELETE FROM user_connections 
       WHERE (id = ? AND (requester_id = ? OR addressee_id = ?))
          OR ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))`,
      [id, user.id, user.id, user.id, id, id, user.id]
    );

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error("Erro ao cancelar/remover conexao:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}