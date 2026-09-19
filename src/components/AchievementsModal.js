"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AchievementsModal({ onClose }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    // Garante que o componente está no client-side para o Portal funcionar corretamente
    setMounted(true);

    async function loadAchievements() {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (!mounted) return null;

  // Filtragem básica caso as suas conquistas tenham a propriedade 'category'
  const filteredAchievements = achievements.filter(a =>
    activeTab === "todos" || a.category === activeTab
  );

  const modalContent = (
    <div className="modal-backdrop open" role="dialog" aria-modal="true">
      <div className="modal-card">

        {/* Header do Modal com as classes corretas */}
        <div className="modal-header">
          <h3>Galeria de Conquistas & Medalhas</h3>
          <button className="btn-close-modal" onClick={onClose} aria-label="Fechar modal">✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: "0.88rem", marginBottom: "1rem" }}>
            Desbloqueie medalhas exclusivas completando marcos de consumo e desvendando conquistas secretas!
          </p>

          {/* Abas de Filtro Restauradas do HTML Original */}
          <div className="category-tabs" style={{ marginBottom: "1.25rem", overflowX: "auto" }}>
            <button type="button" className={`tab-btn ${activeTab === "todos" ? "active" : ""}`} onClick={() => setActiveTab("todos")}>✨ Todas</button>
            <button type="button" className={`tab-btn ${activeTab === "filme" ? "active" : ""}`} onClick={() => setActiveTab("filme")}>🎬 Filmes</button>
            <button type="button" className={`tab-btn ${activeTab === "serie" ? "active" : ""}`} onClick={() => setActiveTab("serie")}>🍿 Séries</button>
            <button type="button" className={`tab-btn ${activeTab === "livro" ? "active" : ""}`} onClick={() => setActiveTab("livro")}>📚 Livros</button>
            <button type="button" className={`tab-btn ${activeTab === "jogo" ? "active" : ""}`} onClick={() => setActiveTab("jogo")}>🎮 Jogos</button>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Carregando conquistas...</p>
          ) : (
            /* Layout da Grelha Horizontal Restaurado (Removido o flex column inline antigo) */
            <div className="achievements-grid">
              {filteredAchievements.length > 0 ? filteredAchievements.map(a => (
                <div key={a.id} className={`achievement-card ${a.unlocked ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">{a.icon}</div>

                  <div className="achievement-details">
                    <div className="achievement-title-row">
                      <span className="achievement-name">{a.name}</span>
                      <span className="achievement-status">
                        {a.unlocked ? "Desbloqueado" : "Bloqueado"}
                      </span>
                    </div>
                    <div className="achievement-desc">{a.description}</div>

                    {/* Caso a sua API retorne dados de progresso (ex: 3/5), a barra também é renderizada */}
                    {a.progress && (
                      <div className="achievement-progress-bar-wrap">
                        <div className="ach-prog-track">
                          <div className="ach-prog-fill" style={{ width: `${(a.progress.current / a.progress.total) * 100}%` }}></div>
                        </div>
                        <span className="ach-prog-text">{a.progress.current} / {a.progress.total}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Nenhuma conquista encontrada.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // Injeta o modal no body da página usando createPortal
  return createPortal(modalContent, document.body);
}