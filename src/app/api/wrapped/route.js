import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

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

    const userId = userAuth.id;

    // Get user stats for the wrapped
    const [items] = await pool.query(`
      SELECT category, status, xp_gained 
      FROM media_items 
      WHERE user_id = ?
    `, [userId]);

    let totalXp = 0;
    let categoryCounts = { filme: 0, serie: 0, livro: 0, jogo: 0 };
    let completedCount = 0;

    items.forEach(item => {
      totalXp += item.xp_gained || 0;
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category]++;
      }
      if (["assistido", "zerado", "platinado", "lido", "finalizada"].includes(item.status)) {
        completedCount++;
      }
    });

    const slideData = [
      {
        title: "Sua Jornada Keeplay",
        content: `Você acumulou ${totalXp} XP explorando obras incríveis!`,
        theme: "var(--primary)"
      },
      {
        title: "Maratona Concluída",
        content: `Você finalizou ${completedCount} obras em sua trajetória.`,
        theme: "var(--cat-serie)"
      },
      {
        title: "Seu Universo",
        content: `Filmes: ${categoryCounts.filme} | Séries: ${categoryCounts.serie} | Livros: ${categoryCounts.livro} | Jogos: ${categoryCounts.jogo}`,
        theme: "var(--cat-filme)"
      }
    ];

    return NextResponse.json({ slides: slideData });

  } catch (error) {
    console.error("Wrapped API Error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
