"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AchievementsModal({ onClose }) {
  const [achievements, setAchievements] = useState([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    setMounted(true);

    async function loadAchievements() {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements || []);
          setTotalUnlocked(data.total_unlocked || 0);
        }
      } catch (err) {
        console.error("Erro ao carregar conquistas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (!mounted) return null;

  const filteredAchievements = achievements.filter(a => {
    if (activeTab === "todos") return true;
    if (activeTab === "secreta") return Boolean(a.is_secret);
    if (activeTab === "missoes" || activeTab === "missao") return a.category === "missao" || a.category === "missoes";
    return a.category === activeTab;
  });

  const modalContent = (
    <div className="modal-backdrop open" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: "760px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        <div className="modal-header">
          <div>
            <h3>Galeria de Conquistas & Medalhas</h3>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {totalUnlocked} de {achievements.length} desbloqueadas
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Fechar modal">✕</button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: "0.88rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>
            Desbloqueie medalhas exclusivas completando marcos de consumo, participando de missões e desvendando segredos!
          </p>

          {/* Abas de Filtro Fiel ao Projeto Original */}
          <div className="category-tabs" style={{ marginBottom: "1.25rem", overflowX: "auto", display: "flex", gap: "0.5rem" }}>
            <button type="button" className={`tab-btn ${activeTab === "todos" ? "active" : ""}`} onClick={() => setActiveTab("todos")}>✨ Todas</button>
            <button type="button" className={`tab-btn ${activeTab === "filme" ? "active" : ""}`} onClick={() => setActiveTab("filme")}>🎬 Filmes</button>
            <button type="button" className={`tab-btn ${activeTab === "serie" ? "active" : ""}`} onClick={() => setActiveTab("serie")}>🍿 Séries</button>
            <button type="button" className={`tab-btn ${activeTab === "livro" ? "active" : ""}`} onClick={() => setActiveTab("livro")}>📚 Livros</button>
            <button type="button" className={`tab-btn ${activeTab === "jogo" ? "active" : ""}`} onClick={() => setActiveTab("jogo")}>🎮 Jogos</button>
            <button type="button" className={`tab-btn ${activeTab === "especial" ? "active" : ""}`} onClick={() => setActiveTab("especial")}>🏆 Especiais</button>
            <button type="button" className={`tab-btn ${activeTab === "missoes" ? "active" : ""}`} onClick={() => setActiveTab("missoes")}>🎯 Missões</button>
            <button type="button" className={`tab-btn ${activeTab === "secreta" ? "active" : ""}`} onClick={() => setActiveTab("secreta")}>🤫 Secretas</button>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Carregando conquistas...</p>
          ) : (
            <div className="achievements-grid">
              {filteredAchievements.length > 0 ? filteredAchievements.map(a => {
                const isSecret = Boolean(a.is_secret);
                const isUnlocked = Boolean(a.unlocked);

                const displayName = (isSecret && !isUnlocked) ? "Conquista Secreta" : a.name;
                const displayDesc = (isSecret && !isUnlocked)
                  ? "??? Esta conquista é um enigma. Continue registrando e explorando para desvendá-la."
                  : a.description;
                const displayIcon = (isSecret && !isUnlocked) ? "❓" : (a.icon || "🏆");

                const current = a.progress?.current ?? (isUnlocked ? 1 : 0);
                const target = a.progress?.total ?? (a.target_count || 1);
                const pct = isUnlocked ? 100 : Math.min(100, Math.round((current / target) * 100));

                const cardClass = isSecret
                  ? (isUnlocked ? "achievement-card secret-unlocked unlocked" : "achievement-card secret-locked locked")
                  : (isUnlocked ? "achievement-card unlocked" : "achievement-card locked");

                return (
                  <div key={a.id} className={cardClass}>
                    <div className="achievement-icon">{displayIcon}</div>

                    <div className="achievement-details">
                      <div className="achievement-title-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span className="achievement-name">{displayName}</span>
                          {a.reward_xp > 0 && (
                            <span style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "0.1rem 0.45rem", borderRadius: "10px", fontWeight: 700 }}>
                              +{a.reward_xp} XP
                            </span>
                          )}
                          {a.granted_title && (
                            <span style={{ fontSize: "0.72rem", background: "rgba(234, 179, 8, 0.15)", color: "#eab308", padding: "0.1rem 0.45rem", borderRadius: "10px", fontWeight: 700 }}>
                              🎖️ {a.granted_title}
                            </span>
                          )}
                        </div>
                        <span className="achievement-status">
                          {isUnlocked ? "✓ Desbloqueada" : (isSecret ? "🔒 Bloqueada" : "Em Progresso")}
                        </span>
                      </div>
                      <div className="achievement-desc">{displayDesc}</div>

                      <div className="achievement-progress-bar-wrap">
                        <div className="ach-prog-track">
                          <div className="ach-prog-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="ach-prog-text">
                          {isUnlocked ? "Concluída (100%)" : (isSecret ? "??? / ???" : `${current} / ${target} (${pct}%)`)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Nenhuma conquista encontrada nesta categoria.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}