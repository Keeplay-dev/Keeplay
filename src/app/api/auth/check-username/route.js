import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "";
    const trimmedUsername = String(username).trim();
    const cleanUsername = trimmedUsername.toLowerCase();

    if (!trimmedUsername) {
      return NextResponse.json({
        available: false,
        message: "O nome de usuário não pode ficar em branco."
      }, { status: 400 });
    }

    if (trimmedUsername.length < 3) {
      return NextResponse.json({
        available: false,
        message: "O nome de usuário deve ter no mínimo 3 caracteres."
      }, { status: 400 });
    }

    if (trimmedUsername.length > 30) {
      return NextResponse.json({
        available: false,
        message: "O nome de usuário deve ter no máximo 30 caracteres."
      }, { status: 400 });
    }

    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return NextResponse.json({
        available: false,
        message: "Use apenas letras, números, sublinhado (_) ou ponto (.)."
      }, { status: 400 });
    }

    // Consulta case-insensitive no TiDB Cloud
    const [existing] = await pool.query(
      "SELECT id, username FROM users WHERE LOWER(TRIM(username)) = ? OR LOWER(TRIM(email)) = ? OR LOWER(TRIM(email)) = ?",
      [cleanUsername, cleanUsername, cleanUsername + "@keeplay.local"]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        available: false,
        message: "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário."
      }, { status: 200 });
    }

    return NextResponse.json({
      available: true,
      message: "Nome de usuário disponível!"
    }, { status: 200 });
  } catch (error) {
    console.error("Check Username Error:", error);
    return NextResponse.json({ error: "Erro ao verificar disponibilidade do nome de usuário." }, { status: 500 });
  }
}
