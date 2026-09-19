import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";

export async function POST(req) {
  try {
    const { name, username, password } = await req.json();

    const trimmedName = String(name || "").trim();
    const trimmedUsername = String(username || "").trim();
    const cleanUsername = trimmedUsername.toLowerCase();
    const passwordStr = String(password || "");

    if (!trimmedName || !trimmedUsername || !passwordStr) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // 1. Validação do formato do nome de usuário
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    let formatError = null;
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30 || !usernameRegex.test(trimmedUsername)) {
      formatError = "O nome de usuário deve ter entre 3 e 30 caracteres e conter apenas letras, números, sublinhado (_) ou ponto (.).";
    }

    // 2. Validação de Unicidade Rigorosa (Case-Insensitive no TiDB Cloud)
    let usernameTaken = false;
    if (!formatError) {
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE LOWER(TRIM(username)) = ? OR LOWER(TRIM(email)) = ? OR LOWER(TRIM(email)) = ?",
        [cleanUsername, cleanUsername, cleanUsername + "@keeplay.local"]
      );
      if (existing.length > 0) {
        usernameTaken = true;
      }
    }

    // 3. Validação de Força da Senha e Indicação dos Requisitos Necessários
    const missingRequirements = [];
    if (passwordStr.length < 6) {
      missingRequirements.push("no mínimo 6 caracteres");
    }
    if (!/[a-zA-Z]/.test(passwordStr)) {
      missingRequirements.push("pelo menos uma letra");
    }
    if (!/[0-9]/.test(passwordStr)) {
      missingRequirements.push("pelo menos um número");
    }
    const passwordWeak = missingRequirements.length > 0;

    // Se houver pendências de validação, reportar de forma explícita e detalhada
    if (formatError || usernameTaken || passwordWeak) {
      let mainError = "";
      const fieldErrors = {};

      if (usernameTaken) {
        fieldErrors.username = "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário.";
        mainError = "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário.";
      } else if (formatError) {
        fieldErrors.username = formatError;
        mainError = formatError;
      }

      if (passwordWeak) {
        const pwdMsg = `A senha é muito fraca. Requisitos necessários: ela deve conter ${missingRequirements.join(", ")}.`;
        fieldErrors.password = pwdMsg;
        if (mainError) {
          mainError += ` Além disso: ${pwdMsg}`;
        } else {
          mainError = pwdMsg;
        }
      }

      const status = usernameTaken ? 409 : 400;
      return NextResponse.json({
        error: mainError,
        fieldErrors
      }, { status });
    }

    const password_hash = await bcrypt.hash(passwordStr, 10);
    const id = "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const email = cleanUsername + "@keeplay.local";

    await pool.query(
      "INSERT INTO users (id, name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)",
      [id, trimmedName, trimmedUsername, email, password_hash]
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