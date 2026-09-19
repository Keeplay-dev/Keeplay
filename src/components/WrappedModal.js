"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function WrappedModal({ onClose }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Confirma que o componente montou no cliente para podermos usar o Portal em segurança
    setMounted(true);

    async function loadWrapped() {
      try {
        const res = await fetch("/api/wrapped");
        if (res.ok) {
          const data = await res.json();
          setSlides(data.slides || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWrapped();
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  // Previne erros de hidratação e só desenha quando o documento (body) existir
  if (!mounted) return null;

  let modalContent;

  if (loading) {
    modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true">
        <div className="modal-card wrapped-card-container" style={{ justifyContent: "center", alignItems: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Carregando sua retrospectiva...</p>
        </div>
      </div>
    );
  } else if (slides.length === 0) {
    modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true">
        <div className="modal-card wrapped-card-container" style={{ justifyContent: "center", alignItems: "center" }}>
          <button className="btn-close-wrapped" onClick={onClose} aria-label="Fechar Retrospectiva">✕</button>
          <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            <p>Não há dados suficientes para o Wrapped.</p>
          </div>
        </div>
      </div>
    );
  } else {
    const slide = slides[currentSlide];

    // Verifica se a API envia HTML injetável ou apenas o texto
    const isHtmlContent = slide.content && typeof slide.content === 'string' && slide.content.includes('<');

    modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true">
        <div className="modal-card wrapped-card-container">

          {/* Barra de Progresso estilo Stories */}
          <div className="wrapped-story-bars">
            {slides.map((_, i) => (
              <div key={i} className={`story-bar ${i <= currentSlide ? "active" : ""}`}>
                <div className="story-fill" style={{ width: i < currentSlide ? "100%" : (i === currentSlide ? "100%" : "0%") }}></div>
              </div>
            ))}
          </div>

          <button className="btn-close-wrapped" onClick={onClose} aria-label="Fechar Retrospectiva">✕</button>

          {/* Slides Interativos */}
          <div className="wrapped-slides-wrapper">
            {isHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: slide.content }} />
            ) : (
              <>
                {/* Fallback caso os slides não venham em HTML pronto, montamos a estrutura do CSS original */}
                <div className="wrapped-slide-icon">{slide.icon || "✨"}</div>
                <h2 className="wrapped-slide-title">{slide.title}</h2>
                {slide.big_number && <div className="wrapped-big-number">{slide.big_number}</div>}
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                  {slide.content}
                </p>
              </>
            )}
          </div>

          {/* Controles Inferiores do Wrapped */}
          <div className="wrapped-controls-bar">
            <button type="button" className="btn-wrapped-nav" onClick={prevSlide} disabled={currentSlide === 0}>
              ← Anterior
            </button>
            <button type="button" className="btn-wrapped-share">
              📋 Compartilhar Resumo
            </button>
            <button type="button" className="btn-wrapped-nav" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
              Próximo →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // O Portal injeta o modal diretamente no <body>, escapando a Navbar e o seu backdrop-filter
  return createPortal(modalContent, document.body);
}