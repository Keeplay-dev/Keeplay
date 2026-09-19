import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

export async function POST(req) {
  try {
    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [username, username + "@keeplay.local"]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Nome de usuário já existe." }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const email = username + "@keeplay.local";

    await pool.query(
      "INSERT INTO users (id, name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)",
      [id, name, username, email, password_hash]
    );

    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "7d" });
    const response = NextResponse.json({ success: true, user: { id, username, name } });
    response.cookies.set({ name: "keeplay_token", value: token, httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}