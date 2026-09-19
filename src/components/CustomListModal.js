"use client";
import { useState, useEffect } from "react";

export default function CustomListModal({ onClose, onSave, catalogItems = [], listToEdit = null }) {
  const [form, setForm] = useState({
    title: listToEdit?.title || "",
    description: listToEdit?.description || "",
    visibility: listToEdit?.visibility || "publica",
    itemIds: listToEdit?.itemIds || []
  });
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Se for edição, busca os itens já associados à lista
  useEffect(() => {
    if (listToEdit?.id) {
      setLoadingDetails(true);
      fetch(`/api/lists/${listToEdit.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.itemIds) {
            setForm(f => ({
              ...f,
              title: data.list?.title || f.title,
              description: data.list?.description || f.description,
              visibility: data.list?.visibility || f.visibility,
              itemIds: data.itemIds
            }));
          }
        })
        .catch(err => console.error("Erro ao carregar itens da lista:", err))
        .finally(() => setLoadingDetails(false));
    }
  }, [listToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      setErrorMsg("O título é obrigatório.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
      visibility: form.visibility,
      itemIds: form.itemIds,
      item_ids: form.itemIds
    };

    try {
      setLoading(true);
      setErrorMsg("");

      const isEdit = Boolean(listToEdit?.id);
      const url = isEdit ? `/api/lists/${listToEdit.id}` : "/api/lists";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onSave(data.list || { ...listToEdit, ...payload, item_count: form.itemIds.length });
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || `Erro ao ${isEdit ? "atualizar" : "criar"} lista`);
      }
    } catch (err) {
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="modal-card" style={{ maxWidth: "520px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
            {listToEdit ? "✏️ Editar Lista Personalizada" : "📑 Criar Nova Lista"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {errorMsg && <div className="alert-error" style={{ marginBottom: "1rem", display: "block" }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label">Título da Lista</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Filmes favoritos de 2026"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label">
              Descrição <span style={{ fontWeight: "normal", fontSize: "0.8rem", color: "var(--text-muted)" }}>(Opcional)</span>
            </label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Fale um pouco sobre o tema dessa lista..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Visibilidade</label>
            <select
              className="input-field"
              value={form.visibility}
              onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
            >
              <option value="publica">🌐 Pública (Visível na comunidade)</option>
              <option value="privada">🔒 Privada (Visível apenas para você)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Obras do seu Acervo:</label>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {form.itemIds.length} selecionada(s)
              </span>
            </div>

            <div style={{
              maxHeight: "220px",
              overflowY: "auto",
              background: "rgba(0,0,0,0.3)",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}>
              {loadingDetails ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                  Carregando obras da lista...
                </span>
              ) : catalogItems.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Seu acervo está vazio.</span>
              ) : (
                catalogItems.map(item => {
                  const isSelected = form.itemIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        cursor: "pointer",
                        fontSize: "0.88rem",
                        padding: "0.35rem 0.5rem",
                        borderRadius: "6px",
                        background: isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm(f => ({
                            ...f,
                            itemIds: checked
                              ? [...f.itemIds, item.id]
                              : f.itemIds.filter(id => id !== item.id)
                          }));
                        }}
                      />
                      <span style={{ flex: 1, color: isSelected ? "#fff" : "var(--text-secondary)" }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {item.category?.toUpperCase()}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn-create"
              style={{ flex: 1, justifyContent: "center", padding: "0.75rem" }}
              disabled={loading || loadingDetails}
            >
              {loading
                ? (listToEdit ? "Salvando..." : "Criando...")
                : (listToEdit ? "💾 Salvar Alterações" : "✨ Criar Lista")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontWeight: "700"
              }}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}