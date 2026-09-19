"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const CATEGORY_ICONS = { filme: "🎬", serie: "🍿", livro: "📚", jogo: "🎮" };
const CATEGORY_LABELS = { filme: "Filme", serie: "Série", livro: "Livro", jogo: "Jogo" };

const STATUS_BY_CATEGORY = {
  filme: [
    { value: "assistido", label: "Assistido" },
    { value: "quero_assistir", label: "Quero Assistir" },
    { value: "revisto", label: "Revisto" },
  ],
  serie: [
    { value: "assistindo", label: "Assistindo" },
    { value: "finalizada", label: "Finalizada" },
    { value: "em_espera", label: "Em Espera" },
    { value: "quero_assistir", label: "Quero Assistir" },
    { value: "dropada", label: "Dropada" },
  ],
  livro: [
    { value: "lendo", label: "Lendo" },
    { value: "lido", label: "Lido" },
    { value: "quero_ler", label: "Quero Ler" },
    { value: "abandonado", label: "Abandonado" },
  ],
  jogo: [
    { value: "jogando", label: "Jogando" },
    { value: "zerado", label: "Zerado" },
    { value: "platinado", label: "Platinado" },
    { value: "backlog", label: "Backlog" },
    { value: "dropado", label: "Dropado" },
  ],
};

const getStatusClass = (status) => {
  if (!status) return "";
  if (status.includes("quero") || status === "backlog" || status === "em_espera") return "status-quero";
  if (status === "abandonado" || status === "dropada" || status === "dropado") return "status-dropado";
  return `status-${status.replace("_", "")}`;
};

const getStatusLabel = (category, statusValue) => {
  const statuses = STATUS_BY_CATEGORY[category] || STATUS_BY_CATEGORY.filme;
  const found = statuses.find((s) => s.value === statusValue);
  return found ? found.label : statusValue;
};

const getCategoryColor = (category) => {
  switch (category) {
    case "filme": return "var(--cat-filme, #ec4899)";
    case "serie": return "var(--cat-serie, #a855f7)";
    case "livro": return "var(--cat-livro, #06b6d4)";
    case "jogo": return "var(--cat-jogo, #10b981)";
    default: return "var(--accent-primary, #6366f1)";
  }
};

const getLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

const getTitleByXp = (xp) => {
  const lvl = Math.floor((xp || 0) / 500) + 1;
  if (lvl >= 20) return "Patrono Eterno das Artes";
  if (lvl >= 15) return "Lenda Cultural";
  if (lvl >= 12) return "Sábio Multimídia";
  if (lvl >= 10) return "Guardião do Acervo";
  if (lvl >= 9) return "Mestre das Narrativas";
  if (lvl >= 8) return "Conhecedor Ilustre";
  if (lvl >= 7) return "Polímata Cultural";
  if (lvl >= 6) return "Maratonista de Elite";
  if (lvl >= 5) return "Curador Experiente";
  if (lvl >= 4) return "Crítico Cultural";
  if (lvl >= 3) return "Apreciador das Artes";
  if (lvl >= 2) return "Explorador Cultural";
  return "Iniciante Curioso";
};

export default function UserCatalogModal({ userId, onClose, onOpenChat }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadCatalog() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/catalog?userId=${userId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Erro ao carregar acervo do usuário");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Erro ao carregar acervo:", err);
        setError(err.message || "Não foi possível carregar o acervo deste usuário.");
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [userId]);

  const toggleSpoiler = (itemId) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!mounted) return null;

  const targetUser = data?.user;
  const isPrivate = data?.isPrivate;
  const items = data?.items || [];
  const lists = data?.lists || [];
  const affinityRaw = data?.affinity;
  let affinityPct = 50;
  if (typeof affinityRaw?.percentage === 'number' && !isNaN(affinityRaw.percentage)) {
    affinityPct = affinityRaw.percentage;
  } else if (affinityRaw?.percentage && !isNaN(Number(affinityRaw.percentage))) {
    affinityPct = Number(affinityRaw.percentage);
  }
  const affinityLabel = affinityRaw?.label || (affinityPct >= 80 ? "Alma Gêmea Cultural" : affinityPct >= 65 ? "Alta Afinidade" : "Conexão em Potencial");
  const affinity = { percentage: affinityPct, label: affinityLabel };

  const filteredItems = items.filter((item) =>
    categoryFilter === "todos" ? true : item.category === categoryFilter
  );

  const modalContent = (
    <div
      className="modal-backdrop open"
      role="dialog"
      aria-modal="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: "880px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-lg, 16px)",
          background: "var(--bg-surface, #141721)",
          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
        }}
      >
        {/* Cabeçalho do Modal */}
        <div
          className="modal-header"
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0 }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#fff",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {targetUser?.avatar_url ? (
                <img
                  src={targetUser.avatar_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                targetUser?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Acervo de {targetUser?.name || "Membro"}
              </h3>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)" }}>
                @{targetUser?.username || "usuario"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              color: "var(--text-secondary, #cbd5e1)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              transition: "all 0.2s ease",
            }}
          >
            ✕
          </button>
        </div>

        {/* Corpo do Modal */}
        <div
          className="modal-body"
          style={{
            padding: "1.5rem",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
              <p>Carregando o acervo cultural...</p>
            </div>
          ) : error ? (
            <div className="blocked-notice-card">
              <div className="blocked-notice-icon">⚠️</div>
              <h3>Ops! Algo deu errado</h3>
              <p>{error}</p>
            </div>
          ) : isPrivate ? (
            <div className="locked-catalog-notice">
              <div className="locked-icon">🔒</div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Perfil Privado</h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.5" }}>
                <strong>{targetUser?.name}</strong> optou por manter seu acervo cultural restrito.
              </p>
            </div>
          ) : (
            <>
              {/* Barra de Estatísticas e Afinidade Cultural */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                  paddingBottom: "1.25rem",
                  borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", color: "#facc15", fontSize: "0.95rem" }}>
                      ⭐ Nível {getLevel(targetUser?.total_xp)}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
                    <span className="equipped-title-badge" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                      🎖️ {targetUser?.equipped_title || getTitleByXp(targetUser?.total_xp)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "0.45rem",
                      fontSize: "0.85rem",
                      color: "#ec4899",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>✨ Afinidade com você:</span>
                    <span style={{ background: "rgba(236, 72, 153, 0.15)", padding: "2px 8px", borderRadius: "12px" }}>
                      {affinity.percentage}% ({affinity.label})
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <strong>{items.length}</strong> obras catalogadas • <strong>{targetUser?.total_xp || 0}</strong> XP
                  </div>

                  <button
                    type="button"
                    className="btn-chat-trigger"
                    title="Conversar no Chat com este membro"
                    onClick={() => {
                      onClose();
                      if (onOpenChat) onOpenChat(targetUser?.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    <span>💬</span> Conversar no Chat
                  </button>
                </div>
              </div>

              {/* Listas Públicas do Usuário (se houver) */}
              {lists.length > 0 && (
                <div style={{ marginBottom: "1.75rem" }}>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      marginBottom: "0.75rem",
                      color: "var(--text-primary, #fff)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span>📑</span> Listas Públicas de {targetUser?.name}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      overflowX: "auto",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    {lists.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                          padding: "0.85rem 1.1rem",
                          borderRadius: "var(--radius-md, 12px)",
                          minWidth: "210px",
                        }}
                      >
                        <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{l.title}</strong>
                        {l.description && (
                          <p
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-secondary)",
                              margin: "0.25rem 0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {l.description}
                          </p>
                        )}
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--accent-primary, #818cf8)",
                            fontWeight: "600",
                            display: "block",
                            marginTop: "0.35rem",
                          }}
                        >
                          📚 {l.items_count || 0} obras incluídas
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros de Categoria */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                  overflowX: "auto",
                  paddingBottom: "0.25rem",
                }}
              >
                {[
                  { id: "todos", label: "Todas as Obras" },
                  { id: "filme", label: "🎬 Filmes" },
                  { id: "serie", label: "🍿 Séries" },
                  { id: "livro", label: "📚 Livros" },
                  { id: "jogo", label: "🎮 Jogos" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "20px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: categoryFilter === cat.id ? "var(--accent-primary, #6366f1)" : "rgba(255, 255, 255, 0.05)",
                      color: categoryFilter === cat.id ? "#fff" : "var(--text-secondary, #94a3b8)",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grade de Itens do Catálogo */}
              {filteredItems.length === 0 ? (
                <div
                  className="empty-state"
                  style={{
                    textAlign: "center",
                    padding: "3.5rem 1.5rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md, 12px)",
                    border: "1px dashed var(--border-subtle, rgba(255, 255, 255, 0.08))",
                  }}
                >
                  <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem", opacity: 0.7 }}>📦</div>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)" }}>
                    Nenhuma obra encontrada nesta categoria.
                  </h4>
                </div>
              ) : (
                <div className="media-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {filteredItems.map((item) => {
                    const cardColorVar = getCategoryColor(item.category);
                    const isSpoilerRevealed = revealedSpoilers[item.id];

                    return (
                      <div
                        key={item.id}
                        className={`media-card ${item.cover_image ? "has-cover" : ""}`}
                        style={{
                          "--card-color": cardColorVar,
                          cursor: "default",
                        }}
                      >
                        {item.cover_image ? (
                          <>
                            <div className="card-cover-container">
                              <img
                                src={item.cover_image}
                                alt={item.title}
                                className="card-cover-img"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div className="card-cover-gradient"></div>
                              <div className="card-cover-top-bar">
                                <span className="category-tag" style={{ color: cardColorVar }}>
                                  {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]?.toUpperCase()}
                                </span>
                                <span className={`status-badge ${getStatusClass(item.status)}`}>
                                  {getStatusLabel(item.category, item.status).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="card-body-content">
                              <h3 className="media-title">{item.title}</h3>
                              {item.rating && (
                                <div className="star-rating-display">
                                  <span className="star-filled">{"★".repeat(item.rating)}</span>
                                  <span className="star-empty">{"★".repeat(5 - item.rating)}</span>
                                  <span className="rating-number">{parseFloat(item.rating).toFixed(1)}</span>
                                </div>
                              )}

                              {item.comment && (
                                <div
                                  style={{ marginTop: "0.4rem", cursor: item.is_spoiler ? "pointer" : "default" }}
                                  onClick={() => item.is_spoiler && toggleSpoiler(item.id)}
                                >
                                  <p
                                    className={`media-comment ${item.is_spoiler && !isSpoilerRevealed ? "spoiler-blur" : ""}`}
                                    title={item.is_spoiler && !isSpoilerRevealed ? "Clique para revelar spoiler" : ""}
                                    style={{ margin: 0 }}
                                  >
                                    {item.comment}
                                  </p>
                                  {item.is_spoiler && !isSpoilerRevealed && (
                                    <small style={{ color: "#f59e0b", fontSize: "0.7rem", display: "block", marginTop: "2px" }}>
                                      ⚠️ Spoiler! Clique para ler.
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="card-footer">
                              <div className="card-footer-info">
                                <span className="card-diary-info">
                                  📅 {item.finished_at ? new Date(item.finished_at).toLocaleDateString("pt-BR") : "Registrado"}
                                </span>
                                <span className="card-xp-badge">+{item.xp_gained || 50} XP</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="card-header">
                              <span className="category-tag" style={{ color: cardColorVar }}>
                                {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]?.toUpperCase()}
                              </span>
                              <span className={`status-badge ${getStatusClass(item.status)}`}>
                                {getStatusLabel(item.category, item.status).toUpperCase()}
                              </span>
                            </div>

                            <div className="card-body-content" style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                              <h3 className="media-title">{item.title}</h3>
                              {item.rating && (
                                <div className="star-rating-display">
                                  <span className="star-filled">{"★".repeat(item.rating)}</span>
                                  <span className="star-empty">{"★".repeat(5 - item.rating)}</span>
                                  <span className="rating-number">{parseFloat(item.rating).toFixed(1)}</span>
                                </div>
                              )}

                              {item.comment && (
                                <div
                                  style={{ marginTop: "0.4rem", cursor: item.is_spoiler ? "pointer" : "default" }}
                                  onClick={() => item.is_spoiler && toggleSpoiler(item.id)}
                                >
                                  <p
                                    className={`media-comment ${item.is_spoiler && !isSpoilerRevealed ? "spoiler-blur" : ""}`}
                                    title={item.is_spoiler && !isSpoilerRevealed ? "Clique para revelar spoiler" : ""}
                                    style={{ margin: 0 }}
                                  >
                                    {item.comment}
                                  </p>
                                  {item.is_spoiler && !isSpoilerRevealed && (
                                    <small style={{ color: "#f59e0b", fontSize: "0.7rem", display: "block", marginTop: "2px" }}>
                                      ⚠️ Spoiler! Clique para ler.
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="card-footer">
                              <div className="card-footer-info">
                                <span className="card-diary-info">
                                  📅 {item.finished_at ? new Date(item.finished_at).toLocaleDateString("pt-BR") : "Registrado"}
                                </span>
                                <span className="card-xp-badge">+{item.xp_gained || 50} XP</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
