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

// Obter detalhes e obras de uma lista específica
export async function GET(req, { params }) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: listId } = await params;

    const [lists] = await pool.query(
      "SELECT * FROM custom_lists WHERE id = ? AND user_id = ?",
      [listId, userAuth.id]
    );

    if (lists.length === 0) {
      return NextResponse.json({ error: "Lista não encontrada." }, { status: 404 });
    }

    const [items] = await pool.query(
      `SELECT mi.id, mi.title, mi.category, mi.cover_image, mi.rating, mi.status
       FROM custom_list_items cli
       JOIN media_items mi ON mi.id = cli.media_item_id
       WHERE cli.list_id = ?
       ORDER BY cli.display_order ASC, cli.added_at ASC`,
      [listId]
    );

    return NextResponse.json({
      list: lists[0],
      items,
      itemIds: items.map(i => i.id)
    });
  } catch (error) {
    console.error("Erro ao buscar lista:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

// Atualizar uma lista existente
export async function PUT(req, { params }) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: listId } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, description, visibility } = body;
    const itemIds = body.item_ids || body.itemIds;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }

    // Verifica se a lista pertence ao usuário
    const [existing] = await pool.query(
      "SELECT id FROM custom_lists WHERE id = ? AND user_id = ?",
      [listId, userAuth.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Lista não encontrada ou sem permissão." }, { status: 404 });
    }

    // 1. Atualizar informações da lista no TiDB Cloud
    await pool.query(
      `UPDATE custom_lists 
       SET title = ?, description = ?, visibility = ?, updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [title.trim(), description || null, visibility || "publica", listId, userAuth.id]
    );

    // 2. Atualizar obras vinculadas na lista
    if (Array.isArray(itemIds)) {
      // Remove vínculos antigos
      await pool.query("DELETE FROM custom_list_items WHERE list_id = ?", [listId]);

      // Insere novos vínculos
      if (itemIds.length > 0) {
        for (let i = 0; i < itemIds.length; i++) {
          await pool.query(
            "INSERT INTO custom_list_items (list_id, media_item_id, display_order, added_at) VALUES (?, ?, ?, NOW())",
            [listId, itemIds[i], i]
          );
        }
      }
    }

    const updatedList = {
      id: listId,
      user_id: userAuth.id,
      title: title.trim(),
      description: description || null,
      visibility: visibility || "publica",
      item_count: Array.isArray(itemIds) ? itemIds.length : undefined
    };

    return NextResponse.json({
      success: true,
      message: "Lista atualizada com sucesso no TiDB Cloud.",
      list: updatedList
    });
  } catch (error) {
    console.error("Erro ao atualizar lista:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar lista." }, { status: 500 });
  }
}

// Excluir uma lista existente
export async function DELETE(req, { params }) {
  try {
    const userAuth = await getUserFromToken();
    if (!userAuth) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: listId } = await params;

    // Verifica se a lista pertence ao usuário
    const [existing] = await pool.query(
      "SELECT id FROM custom_lists WHERE id = ? AND user_id = ?",
      [listId, userAuth.id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Lista não encontrada ou sem permissão." }, { status: 404 });
    }

    // 1. Remove itens da lista (ON DELETE CASCADE também garante, mas remoção explícita reforça)
    await pool.query("DELETE FROM custom_list_items WHERE list_id = ?", [listId]);

    // 2. Remove a lista no TiDB Cloud
    await pool.query("DELETE FROM custom_lists WHERE id = ? AND user_id = ?", [listId, userAuth.id]);

    return NextResponse.json({
      success: true,
      message: "Lista excluída com sucesso no TiDB Cloud."
    });
  } catch (error) {
    console.error("Erro ao excluir lista:", error);
    return NextResponse.json({ error: "Erro interno ao excluir lista." }, { status: 500 });
  }
}
