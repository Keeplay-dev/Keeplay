"use client";
import { useState } from "react";

export default function CustomListModal({ onClose, onSave, catalogItems = [] }) {
  const [form, setForm] = useState({ title: "", description: "", visibility: "publica", itemIds: [] });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      setErrorMsg("O título é obrigatório.");
      return;
    }

    // Prepara os dados convertendo para snake_case garantindo que a API não ignore as obras
    const payload = {
      title: form.title,
      description: form.description,
      visibility: form.visibility,
      item_ids: form.itemIds, // API backend standard
      itemIds: form.itemIds   // Fallback case-sensitive
    };

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onSave(data.list);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erro ao criar lista");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="modal-card">
        <h3 style={{ marginBottom: "1rem" }}>Criar Nova Lista</h3>

        {errorMsg && <div className="alert-error" style={{ marginBottom: "1rem", display: "block" }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label">Título da Lista</label>
            <input type="text" className="input-field" placeholder="Ex: Filmes favoritos de 2026"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label">Descrição <span style={{ fontWeight: "normal", fontSize: "0.8rem", color: "var(--text-muted)" }}>(Opcional)</span></label>
            <textarea className="input-field" rows="3" placeholder="Fale um pouco sobre o tema dessa lista..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Privacidade</label>
            <select className="input-field" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
              <option value="publica">Pública (Todos podem ver)</option>
              <option value="privada">Privada (Apenas eu e amigos)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Selecione as Obras do seu Acervo para incluir:</label>
            <div style={{ maxHeight: "200px", overflowY: "auto", background: "var(--background)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {catalogItems.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Seu acervo está vazio.</span>
              ) : (
                catalogItems.map(item => (
                  <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input
                      type="checkbox"
                      checked={form.itemIds.includes(item.id)}
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
                    {item.title}
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Criando..." : "Criar Lista"}
            </button>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: "0.85rem 1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", color: "var(--text-primary)", fontWeight: "700" }} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}