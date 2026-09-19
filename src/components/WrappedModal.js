"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export default function WrappedModal({ onClose }) {
  const [data, setData] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const timerRef = useRef(null);

  // Carrega os dados ricos da API do Wrapped
  useEffect(() => {
    setMounted(true);

    async function loadWrapped() {
      try {
        const res = await fetch("/api/wrapped");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setSlides(json.slides || []);
        }
      } catch (err) {
        console.error("Erro ao carregar o Wrapped:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWrapped();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(curr => (curr < slides.length - 1 ? curr + 1 : curr));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(curr => (curr > 0 ? curr - 1 : curr));
  }, []);

  // Timer automático de avanço estilo Stories (7 segundos por slide)
  useEffect(() => {
    if (loading || slides.length === 0 || isPaused) return;

    // Se estiver no último slide (o cartão de compartilhar), não avança automaticamente
    if (currentSlide === slides.length - 1) return;

    timerRef.current = setTimeout(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slides.length, isPaused, loading, nextSlide]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
      if (e.key === " ") setIsPaused(p => !p);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // Função para exibir mensagem toast temporária
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // 1. Ação de Copiar Resumo para a Área de Transferência
  const handleCopySummary = async () => {
    const textToCopy = data?.share_summary_text || `Confira meu Keeplay Wrapped 2026!`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      showToast("✓ Resumo copiado! Cole nas redes sociais ou com amigos!");
      setTimeout(() => setCopied(false), 3500);
    } catch (e) {
      showToast("Não foi possível copiar automaticamente.");
    }
  };

  // 2. Ação de Publicar no Feed da Comunidade (Grava no TiDB Cloud)
  const handleShareToFeed = async () => {
    if (sharedToFeed || sharingLoading) return;
    setSharingLoading(true);

    try {
      const res = await fetch("/api/wrapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareText: data?.share_summary_text,
          archetype: data?.archetype,
          topMedia: data?.top_media
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setSharedToFeed(true);
        showToast("🎉 Publicado no Feed da Comunidade! (+50 XP bônus)");

        // Notifica o app para atualizar o feed em tempo real
        window.dispatchEvent(new CustomEvent("keeplay:feed-updated"));
        window.dispatchEvent(new CustomEvent("keeplay:gamification-updated"));
      } else {
        const err = await res.json();
        showToast(err.error || "Erro ao publicar no feed.");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão ao publicar no feed.");
    } finally {
      setSharingLoading(false);
    }
  };

  // 3. Ação de Compartilhar Nativo (se suportado no celular / navegador moderno)
  const handleNativeShare = async () => {
    const text = data?.share_summary_text || "Veja meu Keeplay Wrapped 2026!";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu Keeplay Wrapped 2026",
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        // Usuário cancelou o modal nativo
      }
    } else {
      handleCopySummary();
    }
  };

  if (!mounted) return null;

  let modalContent;

  if (loading) {
    modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true">
        <div className="modal-card wrapped-card-container" style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: "spinSlow 3s infinite linear" }}>✨</div>
          <h3 style={{ color: "#c084fc", margin: 0 }}>Gerando sua Retrospectiva...</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Calculando seu arquétipo cultural e obras marcantes...
          </p>
        </div>
      </div>
    );
  } else if (slides.length === 0) {
    modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true">
        <div className="modal-card wrapped-card-container" style={{ justifyContent: "center", alignItems: "center" }}>
          <button className="btn-close-wrapped" onClick={onClose} aria-label="Fechar Retrospectiva">✕</button>
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
            <h3>Nenhum registro encontrado ainda</h3>
            <p>Cadastre suas primeiras obras no catálogo para desbloquear sua retrospectiva personalizada!</p>
          </div>
        </div>
      </div>
    );
  } else {
    const slide = slides[currentSlide];

    modalContent = (
      <div
        className="modal-backdrop open"
        role="dialog"
        aria-modal="true"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ zIndex: 9999 }}
      >
        <div className="modal-card wrapped-card-container" style={{ position: "relative" }}>

          {/* Notificação Toast Flutuante */}
          {toastMessage && (
            <div className="wrapped-toast">
              <span>✨</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Cabeçalho com Barra de Progresso Stories */}
          <div>
            <div className="wrapped-story-bars">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`story-bar ${i <= currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(i)}
                  title={`Ir para o slide ${i + 1}`}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="story-fill"
                    style={{
                      width: i < currentSlide ? "100%" : (i === currentSlide ? "100%" : "0%"),
                      background: i === currentSlide ? (slide.theme_color || "#facc15") : undefined
                    }}
                  ></div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em" }}>
                  WRAPPED 2026 • {currentSlide + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPaused(p => !p)}
                  title={isPaused ? "Retomar reprodução automática" : "Pausar reprodução"}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {isPaused ? "▶️" : "⏸️"}
                </button>
              </div>

              <button className="btn-close-wrapped" onClick={onClose} aria-label="Fechar Retrospectiva" style={{ position: "static" }}>
                ✕
              </button>
            </div>
          </div>

          {/* ÁREA CENTRAL DO SLIDE DINÂMICO */}
          <div className="wrapped-slides-wrapper" style={{ margin: "1rem 0" }}>

            {/* SLIDE 1: INTRO / JORNADA */}
            {slide.type === "intro" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", border: "1px solid rgba(99, 102, 241, 0.4)" }}>
                  {slide.icon} {slide.subtitle}
                </span>

                <h2 className="wrapped-slide-title" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
                  {slide.title}
                </h2>

                <div className="wrapped-big-number" style={{ color: "#a855f7", textShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}>
                  {slide.highlight_number}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#c084fc", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {slide.highlight_label}
                </div>

                <div className="wrapped-stat-grid">
                  <div className="wrapped-stat-item">
                    <div className="val">{slide.total_items}</div>
                    <div className="lbl">Obras Exploradas</div>
                  </div>
                  <div className="wrapped-stat-item">
                    <div className="val">Nv. {slide.current_level}</div>
                    <div className="lbl">{slide.current_title}</div>
                  </div>
                  <div className="wrapped-stat-item">
                    <div className="val">{slide.total_hours}h</div>
                    <div className="lbl">Horas de Imersão</div>
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5", marginTop: "1rem", maxWidth: "480px" }}>
                  {slide.description}
                </p>
              </div>
            )}

            {/* SLIDE 2: ARQUÉTIPO CULTURAL */}
            {slide.type === "archetype" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(236, 72, 153, 0.2)", color: "#f472b6", border: "1px solid rgba(236, 72, 153, 0.4)" }}>
                  🔮 {slide.subtitle}
                </span>

                <div style={{ fontSize: "4.2rem", margin: "0.2rem 0", filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))" }}>
                  {slide.icon}
                </div>

                <h2 className="wrapped-slide-title" style={{ fontSize: "1.85rem", color: "#fff", marginBottom: "0.3rem" }}>
                  {slide.archetype_name}
                </h2>

                <div style={{ display: "inline-block", background: "rgba(236, 72, 153, 0.25)", color: "#fbcfe8", padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                  ✨ {slide.archetype_badge}
                </div>

                <div className="wrapped-archetype-box">
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#f1f5f9", lineHeight: "1.5" }}>
                    {slide.archetype_desc}
                  </p>

                  <div className="wrapped-trait-row">
                    <span>⚡</span>
                    <span><strong>Superpoder:</strong> {slide.archetype_superpower}</span>
                  </div>
                  <div className="wrapped-trait-row">
                    <span>📍</span>
                    <span><strong>Habitat:</strong> {slide.archetype_habitat}</span>
                  </div>
                  <div className="wrapped-trait-row">
                    <span>🎯</span>
                    <span><strong>Vibe Cultural:</strong> {slide.archetype_vibe}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: OBRA-PRIMA SUPREMA */}
            {slide.type === "masterpiece" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
                  👑 {slide.subtitle}
                </span>

                <h2 className="wrapped-slide-title" style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                  {slide.title}
                </h2>

                {slide.has_media && slide.media ? (
                  <div className="wrapped-masterpiece-showcase">
                    {slide.media.cover_image ? (
                      <img
                        src={slide.media.cover_image}
                        alt={slide.media.title}
                        className="wrapped-masterpiece-cover"
                      />
                    ) : (
                      <div className="wrapped-masterpiece-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)", fontSize: "2.5rem" }}>
                        🎬
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                        <span style={{ fontSize: "0.72rem", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase" }}>
                          {slide.media.category}
                        </span>
                        {slide.media.status && (
                          <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 700 }}>
                            ✓ {slide.media.status}
                          </span>
                        )}
                      </div>

                      <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.25rem", color: "#fff", fontWeight: 800 }}>
                        {slide.media.title}
                      </h3>

                      <div style={{ color: "#fbbf24", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                        {"★".repeat(Math.min(5, Math.max(1, Number(slide.media.rating) || 5)))}
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "0.4rem" }}>
                          {Number(slide.media.rating) || 5}.0 / 5.0
                        </span>
                      </div>

                      {slide.media.hours_spent && (
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                          ⏱️ {slide.media.hours_spent} de imersão total
                        </div>
                      )}

                      {slide.media.comment && (
                        <div style={{ fontSize: "0.82rem", fontStyle: "italic", color: "#e2e8f0", background: "rgba(0,0,0,0.3)", padding: "0.6rem 0.75rem", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
                          &ldquo;{slide.media.comment.length > 120 ? `${slide.media.comment.slice(0, 120)}...` : slide.media.comment}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="wrapped-quote-box">
                    <p>{slide.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 4: COSMOS DE CATEGORIAS */}
            {slide.type === "cosmos" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#c4b5fd", border: "1px solid rgba(139, 92, 246, 0.4)" }}>
                  🌌 {slide.subtitle}
                </span>

                <h2 className="wrapped-slide-title" style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
                  {slide.title}
                </h2>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 0.8rem 0" }}>
                  Você explorou <strong>{slide.total_items}</strong> obras culturais somando <strong>{slide.total_hours} horas</strong> de imersão!
                </p>

                <div className="wrapped-cosmos-list">
                  {slide.categories.map(c => (
                    <div key={c.key} className="wrapped-cosmos-row">
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", fontWeight: 700 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#fff" }}>
                          <span>{c.icon}</span> {c.label}
                        </span>
                        <span style={{ color: c.color }}>
                          {c.count} {c.count === 1 ? "obra" : "obras"} ({c.pct}%)
                        </span>
                      </div>
                      <div className="wrapped-cosmos-bar-track">
                        <div className="wrapped-cosmos-bar-fill" style={{ width: `${Math.max(4, c.pct)}%`, background: c.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "0.5rem 1rem", borderRadius: "12px", color: "#6ee7b7", fontSize: "0.82rem", fontWeight: 700, marginTop: "0.3rem" }}>
                  ✓ {slide.completed_count} obras concluídas até o final
                </div>
              </div>
            )}

            {/* SLIDE 5: SALA DE TROFÉUS & GLÓRIAS */}
            {slide.type === "trophies" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                  🏛️ {slide.subtitle}
                </span>

                <h2 className="wrapped-slide-title" style={{ fontSize: "1.8rem", marginBottom: "0.2rem" }}>
                  {slide.title}
                </h2>

                <div className="wrapped-big-number" style={{ color: "#10b981", textShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}>
                  {slide.achievements_count}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6ee7b7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                  Troféus e Medalhas Conquistadas
                </div>

                <div className="wrapped-stat-grid" style={{ maxWidth: "480px" }}>
                  <div className="wrapped-stat-item">
                    <div className="val">{slide.secret_count}</div>
                    <div className="lbl">🤫 Segredos Revelados</div>
                  </div>
                  <div className="wrapped-stat-item">
                    <div className="val">{slide.missions_count}</div>
                    <div className="lbl">🎯 Missões Resgatadas</div>
                  </div>
                  <div className="wrapped-stat-item">
                    <div className="val">{slide.friends_count}</div>
                    <div className="lbl">👥 Conexões Ativas</div>
                  </div>
                </div>

                {slide.recent_trophies && slide.recent_trophies.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
                    {slide.recent_trophies.map((t, idx) => (
                      <span key={idx} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.25rem 0.65rem", borderRadius: "10px", fontSize: "0.78rem", color: "#fff" }}>
                        {t.icon} {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 6: CARTÃO COLECIONÁVEL & COMPARTILHAMENTO */}
            {slide.type === "card" && (
              <div className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span className="wrapped-slide-badge" style={{ background: "rgba(250, 204, 21, 0.2)", color: "#facc15", border: "1px solid rgba(250, 204, 21, 0.4)" }}>
                  🎴 {slide.subtitle}
                </span>

                {/* O Cartão Colecionável Dourado Oficial */}
                <div className="wrapped-golden-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid rgba(250, 204, 21, 0.25)", paddingBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#facc15", letterSpacing: "0.08em" }}>
                      ✨ KEEPLAY WRAPPED 2026
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      CARTÃO OFICIAL
                    </span>
                  </div>

                  <div className="wrapped-card-user-row">
                    <div className="wrapped-card-avatar">
                      {slide.card_data.avatar_url ? (
                        <img src={slide.card_data.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        slide.card_data.user_name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
                        {slide.card_data.user_name}
                      </h4>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        @{slide.card_data.username} • <strong style={{ color: "#facc15" }}>Nv. {slide.card_data.current_level}</strong>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: 700, marginTop: "0.15rem" }}>
                        ⭐ {slide.card_data.equipped_title}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "rgba(236, 72, 153, 0.15)", border: "1px solid rgba(236, 72, 153, 0.35)", borderRadius: "10px", padding: "0.45rem 0.75rem", display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{slide.card_data.archetype_icon}</span>
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "#f472b6", fontWeight: 700, textTransform: "uppercase" }}>Arquétipo Cultural</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{slide.card_data.archetype_name}</div>
                    </div>
                  </div>

                  <div className="wrapped-card-stats-strip">
                    <div className="item">
                      <div className="v">{slide.card_data.total_items}</div>
                      <div className="k">Obras</div>
                    </div>
                    <div className="item">
                      <div className="v">{slide.card_data.total_hours}h</div>
                      <div className="k">Imersão</div>
                    </div>
                    <div className="item">
                      <div className="v">+{slide.card_data.total_xp}</div>
                      <div className="k">XP Total</div>
                    </div>
                    <div className="item">
                      <div className="v">{slide.card_data.trophies_count}</div>
                      <div className="k">Troféus</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                    👑 Obra Marcante: <strong style={{ color: "#fff" }}>{slide.card_data.top_masterpiece}</strong>
                  </div>

                  <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    <span>keeplay.app</span>
                    <span>Sua Jornada Cultural Gamificada</span>
                  </div>
                </div>

                {/* BOTÕES DE COMPARTILHAMENTO ATIVOS */}
                <div style={{ display: "flex", gap: "0.6rem", width: "100%", maxWidth: "460px", marginTop: "1rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-wrapped-share"
                    onClick={handleCopySummary}
                    title="Copiar resumo formatado para colar nas redes sociais ou WhatsApp"
                    style={{ flex: 1, minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", background: copied ? "rgba(16, 185, 129, 0.9)" : undefined }}
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? "Copiado!" : "Copiar Resumo"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-wrapped-share"
                    onClick={handleShareToFeed}
                    disabled={sharedToFeed || sharingLoading}
                    title="Publicar este cartão diretamente no feed social da comunidade Keeplay"
                    style={{
                      flex: 1,
                      minWidth: "150px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      background: sharedToFeed ? "rgba(99, 102, 241, 0.85)" : "linear-gradient(135deg, #10b981, #059669)",
                      cursor: sharedToFeed ? "default" : "pointer"
                    }}
                  >
                    <span>{sharedToFeed ? "✓" : sharingLoading ? "⏳" : "🌐"}</span>
                    <span>{sharedToFeed ? "Publicado no Feed!" : sharingLoading ? "Publicando..." : "Publicar no Feed (+50 XP)"}</span>
                  </button>

                  {typeof navigator !== "undefined" && navigator.share && (
                    <button
                      type="button"
                      className="btn-wrapped-nav"
                      onClick={handleNativeShare}
                      title="Compartilhar via aplicativo do dispositivo"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                    >
                      <span>📲</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* CONTROLES INFERIORES DE NAVEGAÇÃO */}
          <div className="wrapped-controls-bar">
            <button
              type="button"
              className="btn-wrapped-nav"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              style={{ opacity: currentSlide === 0 ? 0.35 : 1, cursor: currentSlide === 0 ? "default" : "pointer" }}
            >
              ← Anterior
            </button>

            {currentSlide < slides.length - 1 ? (
              <button
                type="button"
                className="btn-wrapped-share"
                onClick={handleCopySummary}
                style={{ fontSize: "0.82rem", padding: "0.55rem 1rem" }}
              >
                {copied ? "✓ Resumo Copiado!" : "📋 Copiar Resumo"}
              </button>
            ) : (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Role o feed para ver as reações!
              </span>
            )}

            <button
              type="button"
              className="btn-wrapped-nav"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              style={{ opacity: currentSlide === slides.length - 1 ? 0.35 : 1, cursor: currentSlide === slides.length - 1 ? "default" : "pointer" }}
            >
              Próximo →
            </button>
          </div>

        </div>
      </div>
    );
  }

  return createPortal(modalContent, document.body);
}