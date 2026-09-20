"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import CustomListModal from "./CustomListModal";

// Provedores disponíveis
const PROVIDERS = [
  { id: "netflix", name: "Netflix", cat: "streaming" },
  { id: "prime", name: "Prime Video", cat: "streaming" },
  { id: "disney", name: "Disney+", cat: "streaming" },
  { id: "hbo", name: "Max (HBO)", cat: "streaming" },
  { id: "apple", name: "Apple TV+", cat: "streaming" },
  { id: "paramount", name: "Paramount+", cat: "streaming" },
  { id: "globoplay", name: "Globoplay", cat: "streaming" },
  { id: "crunchyroll", name: "Crunchyroll", cat: "streaming" },
  { id: "pluto", name: "Pluto TV", cat: "streaming" },
  { id: "mubi", name: "MUBI", cat: "streaming" },
  { id: "steam", name: "Steam", cat: "jogo" },
  { id: "ps5", name: "PlayStation 5", cat: "jogo" },
  { id: "xbox", name: "Xbox / Game Pass", cat: "jogo" },
  { id: "nintendo", name: "Nintendo Switch", cat: "jogo" },
  { id: "epicgames", name: "Epic Games", cat: "jogo" },
  { id: "kindle", name: "Kindle", cat: "livro" },
  { id: "kobo", name: "Kobo", cat: "livro" },
  { id: "fisico", name: "Livro Físico", cat: "livro" },
  { id: "youtube", name: "YouTube", cat: "streaming" },
];

const STATUS_BY_CATEGORY = {
  filme: [
    { value: "assistido", label: "✅ Assistido" },
    { value: "quero_assistir", label: "⏳ Quero Assistir" },
    { value: "revisto", label: "🔄 Revisto" },
  ],
  serie: [
    { value: "assistindo", label: "🍿 Assistindo" },
    { value: "finalizada", label: "🎬 Finalizada" },
    { value: "em_espera", label: "⏸️ Em Espera" },
    { value: "quero_assistir", label: "⏳ Quero Assistir" },
    { value: "dropada", label: "💤 Dropada" },
  ],
  livro: [
    { value: "lendo", label: "📖 Lendo" },
    { value: "lido", label: "📚 Lido" },
    { value: "quero_ler", label: "⏳ Quero Ler" },
    { value: "abandonado", label: "💤 Abandonado" },
  ],
  jogo: [
    { value: "jogando", label: "🕹️ Jogando" },
    { value: "zerado", label: "✅ Zerado" },
    { value: "platinado", label: "🏆 Platinado" },
    { value: "backlog", label: "⏳ Backlog" },
    { value: "dropado", label: "💤 Dropado" },
  ],
};

const CATEGORY_ICONS = { filme: "🎬", serie: "🍿", livro: "📚", jogo: "🎮" };
const CATEGORY_LABELS = { filme: "Filme", serie: "Série", livro: "Livro", jogo: "Jogo" };
const XP_BY_RATING = { 1: 30, 2: 40, 3: 50, 4: 60, 5: 80 };

const EMPTY_FORM = {
  title: "", category: "filme", status: "assistido", rating: 5,
  comment: "", is_spoiler: false, cover_image: "", cover_mode: "url",
  current_progress: "", total_progress: "", season_current: 1,
  hours_spent: "", is_rewatch: false, providers: [],
  date_started: "", date_finished: "",
};

// Auxiliares para recuperar cores de status originais do CSS
const getStatusClass = (status) => {
  if (!status) return "";
  if (status.includes("quero") || status === "backlog") return "status-quero";
  if (status === "em_espera") return "status-quero";
  if (status === "abandonado" || status === "dropada" || status === "dropado") return "status-dropado";
  return `status-${status.replace("_", "")}`;
};

const getStatusLabel = (category, statusValue) => {
  const statuses = STATUS_BY_CATEGORY[category] || STATUS_BY_CATEGORY.filme;
  const found = statuses.find(s => s.value === statusValue);
  return found ? found.label.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim() : statusValue;
};

// Helpers de Nível e Título Honorífico
const getLevel = (xp) => Math.floor((Math.max(0, Number(xp) || 0)) / 500) + 1;
const getTitleByXp = (xp) => {
  const lvl = getLevel(xp);
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

export default function CatalogView() {
  const [activeSubTab, setActiveSubTab] = useState("catalog");
  const [profile, setProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [items, setItems] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [xpToast, setXpToast] = useState(null);
  const [missionsMeta, setMissionsMeta] = useState(null);
  const [editingList, setEditingList] = useState(null);

  const searchTimeout = useRef(null);

  useEffect(() => {
    setMounted(true);
    const handleGamificationUpdated = () => {
      fetch("/api/user/profile")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.profile) setProfile(data.profile);
        })
        .catch(err => console.error("Erro ao sincronizar perfil:", err));
    };

    window.addEventListener("keeplay:gamification-updated", handleGamificationUpdated);
    return () => {
      window.removeEventListener("keeplay:gamification-updated", handleGamificationUpdated);
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "todos") params.set("category", categoryFilter);
      if (statusFilter !== "todos") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const [profileRes, missionsRes, catalogRes, listsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/missions"),
        fetch("/api/catalog?" + params.toString()),
        fetch("/api/lists"),
      ]);

      if (profileRes.ok) setProfile((await profileRes.json()).profile);
      if (missionsRes.ok) {
        const mData = await missionsRes.json();
        setMissions(mData.missions || []);
        if (mData.periodInfo) {
          setMissionsMeta({
            periodInfo: mData.periodInfo,
            theme: mData.theme
          });
        }
      }
      if (catalogRes.ok) setItems((await catalogRes.json()).items || []);
      if (listsRes.ok) setLists((await listsRes.json()).lists || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchQuery]);

  const handleDeleteList = async (list) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${list.title}"?`)) return;
    try {
      const res = await fetch(`/api/lists/${list.id}`, { method: "DELETE" });
      if (res.ok) {
        setLists(prev => prev.filter(l => l.id !== list.id));
        setXpToast("✓ Lista excluída com sucesso.");
        setTimeout(() => setXpToast(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Não foi possível excluir a lista.");
      }
    } catch (e) {
      console.error("Erro ao excluir lista:", e);
      alert("Erro de conexão ao excluir lista.");
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "filme",
      status: item.status || "assistido",
      rating: item.rating || 5,
      comment: item.comment || "",
      is_spoiler: !!item.is_spoiler,
      cover_image: item.cover_image || "",
      cover_mode: "url",
      current_progress: item.current_progress || "",
      total_progress: item.total_progress || "",
      season_current: item.season_current || 1,
      hours_spent: item.hours_spent || "",
      is_rewatch: !!item.is_rewatch,
      providers: item.providers?.map(p => p.id) || [],
      date_started: item.started_at ? item.started_at.split("T")[0] : "",
      date_finished: item.finished_at ? item.finished_at.split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/catalog/${editingId}` : "/api/catalog";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setModalOpen(false);
        if (!editingId && data.xp_gained) {
          setXpToast(`+${data.xp_gained} XP ganhos na sua jornada!`);
          setTimeout(() => setXpToast(null), 3500);
        }
        if (data.newly_unlocked && data.newly_unlocked.length > 0) {
          const names = data.newly_unlocked.map(a => a.name).join(", ");
          setTimeout(() => {
            setXpToast(`🏆 Conquista Desbloqueada: ${names}!`);
            setTimeout(() => setXpToast(null), 4000);
          }, 3600);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("keeplay:gamification-updated"));
        }
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar o registro.");
    } finally {
      setSaving(false);
    }
  };

  const handleClaimMission = async (missionId) => {
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission_id: missionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setXpToast(`🎁 Recompensa resgatada! +${data.reward_xp || ""} XP`);
        setTimeout(() => setXpToast(null), 3500);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("keeplay:gamification-updated"));
        }
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Não foi possível resgatar a recompensa.");
      }
    } catch (err) {
      console.error("Erro ao resgatar missão:", err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");

    try {
      setUploadingCover(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, cover_image: data.url }));
      } else {
        alert("Erro ao fazer upload da capa.");
      }
    } catch (err) {
      console.error("Erro de upload:", err);
      alert("Erro de conexão ao fazer upload.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDelete = async (targetId) => {
    const id = targetId || editingId;
    if (!id || !confirm("Descartar este registro definitivamente?")) return;
    await fetch(`/api/catalog/${id}`, { method: "DELETE" });
    setModalOpen(false);
    fetchData();
  };

  const toggleProvider = (pid) => {
    setForm(f => ({
      ...f,
      providers: f.providers.includes(pid)
        ? f.providers.filter(p => p !== pid)
        : [...f.providers, pid],
    }));
  };

  const currentStatuses = STATUS_BY_CATEGORY[form.category] || STATUS_BY_CATEGORY.filme;
  const relevantProviders = PROVIDERS.filter(p =>
    form.category === "jogo" ? p.cat === "jogo" || p.cat === "streaming" :
      form.category === "livro" ? p.cat === "livro" || p.cat === "streaming" :
        p.cat === "streaming"
  );

  const starRatingLabels = { 1: "😐 Ruim", 2: "🙂 Regular", 3: "😊 Bom", 4: "🤩 Ótimo", 5: "🌟 Obra-Prima" };

  const renderModal = () => {
    if (!mounted || !modalOpen) return null;

    const modalContent = (
      <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal-card">
          <div className="modal-header">
            <h3>{editingId ? "Editar Registro" : "Novo Registro Cultural"}</h3>
            <button className="btn-close-modal" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <form className="modal-body" onSubmit={handleSave}>
            <div className="form-row-2">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Título da Obra</label>
                <input type="text" className="input-field" placeholder="Ex: Interestelar, The Witcher 3, Duna..." required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Categoria</label>
                <select className="input-field" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value, status: STATUS_BY_CATEGORY[e.target.value][0].value }))}>
                  <option value="filme">🎬 Filme</option>
                  <option value="serie">🍿 Série</option>
                  <option value="livro">📚 Livro</option>
                  <option value="jogo">🎮 Jogo</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Status de Consumo</label>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {currentStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  {form.category === "serie" ? "Episódio Atual / Total" :
                    form.category === "livro" ? "Página Atual / Total" :
                      form.category === "jogo" ? "% Conclusão / Total" : "Progresso"}
                </label>
                <div className="progress-inputs-row">
                  <input type="number" className="input-field" placeholder="Atual" min="0" value={form.current_progress}
                    onChange={e => setForm(f => ({ ...f, current_progress: e.target.value }))} />
                  <span className="sep-slash">/</span>
                  <input type="number" className="input-field" placeholder="Total" min="0" value={form.total_progress}
                    onChange={e => setForm(f => ({ ...f, total_progress: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              {form.category === "serie" && (
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Temporada Atual</label>
                  <input type="number" className="input-field" placeholder="Ex: 2" min="1" value={form.season_current}
                    onChange={e => setForm(f => ({ ...f, season_current: e.target.value }))} />
                </div>
              )}
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Horas Dedicadas (Est.)</label>
                <input type="number" className="input-field" placeholder="Ex: 35.5" min="0" step="0.5" value={form.hours_spent}
                  onChange={e => setForm(f => ({ ...f, hours_spent: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Onde Assistir / Onde Jogar / Plataforma</label>
              <div className="providers-chip-group">
                {relevantProviders.map(p => (
                  <button key={p.id} type="button"
                    className={`provider-chip ${form.providers.includes(p.id) ? "selected" : ""}`}
                    onClick={() => toggleProvider(p.id)}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Data de Início</label>
                <input type="date" className="input-field" value={form.date_started}
                  onChange={e => setForm(f => ({ ...f, date_started: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Conclusão</label>
                <input type="date" className="input-field" value={form.date_finished}
                  onChange={e => setForm(f => ({ ...f, date_finished: e.target.value }))} />
              </div>
            </div>

            <div className="checkbox-inline-row">
              <label className="custom-checkbox-label">
                <input type="checkbox" checked={form.is_rewatch} onChange={e => setForm(f => ({ ...f, is_rewatch: e.target.checked }))} />
                <span className="chk-custom"></span>
                <span>🔄 Esta experiência foi uma revisitação (Re-watch / Re-play / Releitura)</span>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label className="form-label">Capa da Obra <span style={{ fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem" }}>(Opcional)</span></label>
              <div className="cover-input-tabs">
                <button type="button" className={`cover-tab-btn ${form.cover_mode === 'url' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, cover_mode: 'url' }))}>🔗 Link da Imagem</button>
                <button type="button" className={`cover-tab-btn ${form.cover_mode === 'file' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, cover_mode: 'file' }))}>📁 Fazer Upload</button>
              </div>

              {form.cover_mode === 'url' ? (
                <input type="url" className="input-field" placeholder="Cole o link da capa (ex: https://...)"
                  value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} />
              ) : (
                <div className="cover-mode-container">
                  <input type="file" accept="image/*" id="hiddenFileInput" onChange={handleCoverUpload} style={{ display: "none" }} />
                  <button type="button" className="btn-cover-upload" onClick={() => document.getElementById('hiddenFileInput').click()}>
                    <span>🖼️ {uploadingCover ? "Enviando..." : "Escolher imagem do dispositivo"}</span>
                  </button>
                </div>
              )}

              {form.cover_image && (
                <div className="cover-preview-wrap" style={{ marginTop: "0.75rem", background: "transparent", border: "none" }}>
                  <img src={form.cover_image} alt="Preview" style={{ height: "140px", borderRadius: "8px", objectFit: "cover" }}
                    onError={e => e.target.style.display = "none"} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Sua Avaliação — {starRatingLabels[form.rating]}</label>
              <div className="star-input-group" id="starPicker">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" className={`star-btn ${n <= form.rating ? "active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}>★</button>
                ))}
                <span className="star-xp-hint">+{XP_BY_RATING[form.rating] || 50} XP</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comentário ou Crítica</label>
              <textarea className="input-field" rows="3" placeholder="O que você achou? Detalhes marcantes da narrativa, jogabilidade ou reflexões..."
                value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
            </div>

            <div className="checkbox-inline-row" style={{ marginTop: "-0.25rem", marginBottom: "0.75rem" }}>
              <label className="custom-checkbox-label">
                <input type="checkbox" checked={form.is_spoiler} onChange={e => setForm(f => ({ ...f, is_spoiler: e.target.checked }))} />
                <span className="chk-custom"></span>
                <span>🤫 <strong>Contém Spoiler</strong> (ocultar texto com blur até que cliquem para ver)</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              {editingId && (
                <button type="button" className="btn-danger-outline" onClick={() => handleDelete()}>🗑️ Descartar</button>
              )}
              <button type="button" className="btn-icon-text" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ flex: 2, marginTop: 0 }} disabled={saving}>
                {saving ? "Salvando..." : "Salvar e Ganhar XP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    return createPortal(modalContent, document.body);
  };

  const userXp = Number(profile?.total_xp) || 0;
  const userLevel = profile?.current_level || profile?.level || getLevel(userXp);
  const userTitle = profile?.equipped_title || getTitleByXp(userXp);

  return (
    <div id="catalogView">

      {/* XP Toast Portaled */}
      {mounted && xpToast && createPortal(
        <div className="toast-container" style={{ pointerEvents: "auto" }}>
          <div className="toast toast-achievement">
            <span className="toast-icon">⭐</span>
            <div className="toast-content">
              <h4>Experiência Adquirida</h4>
              <p>{xpToast}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hero Section Fiel ao HTML */}
      <section className="dashboard-hero">
        <div className="hero-profile-summary">
          <div className="hero-avatar-wrapper">
            <div className="hero-avatar-img">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.name || "Avatar"}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                profile?.name ? profile.name.charAt(0).toUpperCase() : "U"
              )}
            </div>
          </div>
          <div className="hero-welcome">
            <h2>Olá, <span>{profile?.name || "Usuário"}</span>! 👋</h2>
            <div className="hero-title-badge-wrap">
              <span className="equipped-title-badge">👑 {userTitle}</span>
              <span className="hero-level-desc">Nível {userLevel} • Registre para subir de patente</span>
            </div>
            <p className="hero-bio">{profile?.bio || "Nenhuma biografia disponível."}</p>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-pill"><div className="stat-value">{profile?.total_items ?? profile?.total_media_items ?? items.length}</div><div className="stat-label">Registros</div></div>
          <div className="stat-pill"><div className="stat-value">{profile?.average_rating || (items.filter(i => Number(i.rating) > 0).length > 0 ? (items.filter(i => Number(i.rating) > 0).reduce((a, b) => a + Number(b.rating), 0) / items.filter(i => Number(i.rating) > 0).length).toFixed(1) : "0.0")}</div><div className="stat-label">Média ⭐</div></div>
          <div className="stat-pill"><div className="stat-value">{profile?.hours_spent || (profile?.total_hours_invested ? (Number.isInteger(Number(profile.total_hours_invested)) ? `${Number(profile.total_hours_invested)}h` : `${parseFloat(Number(profile.total_hours_invested).toFixed(1))}h`) : (items.length > 0 ? (items.reduce((acc, i) => acc + (Number(i.hours_spent) || 0), 0) % 1 === 0 ? `${items.reduce((acc, i) => acc + (Number(i.hours_spent) || 0), 0)}h` : `${parseFloat(items.reduce((acc, i) => acc + (Number(i.hours_spent) || 0), 0).toFixed(1))}h`) : "0h"))}</div><div className="stat-label">Tempo Dedicado</div></div>
          <div className="stat-pill"><div className="stat-value">{userXp}</div><div className="stat-label">XP Total</div></div>
        </div>
      </section>

      {/* Sub-nav Bar */}
      <div className="sub-nav-bar">
        <div className="sub-nav-tabs">
          <button type="button" className={`sub-nav-tab ${activeSubTab === "catalog" ? "active" : ""}`} onClick={() => setActiveSubTab("catalog")}>
            <span>📚</span> Meu Acervo <span className="badge-pill">{items.length}</span>
          </button>
          <button type="button" className={`sub-nav-tab ${activeSubTab === "lists" ? "active" : ""}`} onClick={() => setActiveSubTab("lists")}>
            <span>📑</span> Minhas Listas <span className="badge-pill">{lists.length}</span>
          </button>
          <button type="button" className={`sub-nav-tab ${activeSubTab === "missions" ? "active" : ""}`} onClick={() => setActiveSubTab("missions")}>
            <span>🎯</span> Missões Quinzenais <span className="badge-pill pulse-badge">{missions.length || 0} Ativas</span>
          </button>
        </div>
      </div>

      {/* MEU ACERVO */}
      {activeSubTab === "catalog" && (
        <div id="catalogAcervoSection">

          <section className="controls-bar">
            <div className="category-tabs" role="tablist">
              <button className={`tab-btn ${categoryFilter === "todos" ? "active" : ""}`} onClick={() => setCategoryFilter("todos")}>✨ Todos</button>
              <button className={`tab-btn ${categoryFilter === "filme" ? "active" : ""}`} onClick={() => setCategoryFilter("filme")}>🎬 Filmes</button>
              <button className={`tab-btn ${categoryFilter === "serie" ? "active" : ""}`} onClick={() => setCategoryFilter("serie")}>🍿 Séries</button>
              <button className={`tab-btn ${categoryFilter === "livro" ? "active" : ""}`} onClick={() => setCategoryFilter("livro")}>📚 Livros</button>
              <button className={`tab-btn ${categoryFilter === "jogo" ? "active" : ""}`} onClick={() => setCategoryFilter("jogo")}>🎮 Jogos</button>
            </div>

            <div className="status-filter-wrapper">
              <select className="select-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="todos">⚡ Todos os Status</option>
                <option value="platinado">🏆 Platinados</option>
                <option value="zerado">✅ Zerados</option>
                <option value="jogando">🕹️ Jogando</option>
                <option value="assistindo">🍿 Assistindo</option>
                <option value="finalizada">🎬 Finalizadas</option>
                <option value="lendo">📖 Lendo</option>
                <option value="lido">📚 Concluídos</option>
                <option value="quero_assistir">⏳ Quero Consumir</option>
                <option value="dropado">💤 Dropados</option>
              </select>
            </div>

            <div className="search-and-action">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input type="text" className="search-input" placeholder="Buscar por título..." onChange={handleSearchChange} />
              </div>
              <button className="btn-create" onClick={openNewModal}>
                <span>+</span> Novo Registro
              </button>
            </div>
          </section>

          <section className="media-grid" aria-live="polite">
            {loading ? (
              <div className="empty-state" style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem" }}>
                <span style={{ fontSize: "2rem" }}>⏳</span>
                <h3 style={{ marginTop: "1rem" }}>Carregando acervo...</h3>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", background: "var(--bg-glass-card)", borderRadius: "var(--radius-lg)" }}>
                <span style={{ fontSize: "3rem" }}>🍿</span>
                <h3 style={{ marginTop: "1rem" }}>Seu acervo está vazio</h3>
                <p style={{ color: "var(--text-muted)" }}>Comece a registrar seus filmes, séries, livros e jogos favoritos.</p>
                <button className="btn-create" style={{ marginTop: "1.5rem" }} onClick={openNewModal}>+ Novo Registro</button>
              </div>
            ) : (
              items.map(item => {
                const cardColorVar = `var(--cat-${item.category})`;

                return (
                  <div
                    key={item.id}
                    className={`media-card ${item.cover_image ? "has-cover" : ""}`}
                    style={{ "--card-color": cardColorVar, cursor: "pointer" }}
                    onClick={() => openEditModal(item)}
                  >
                    {item.cover_image ? (
                      <>
                        {/* Layout com Capa */}
                        <div className="card-cover-container">
                          <img src={item.cover_image} alt={item.title} className="card-cover-img" onError={e => { e.target.style.display = "none"; }} />
                          <div className="card-cover-gradient"></div>
                          <div className="card-cover-top-bar">
                            <span className="category-tag" style={{ color: cardColorVar }}>
                              {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category].toUpperCase()}
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
                            <p className={`media-comment ${item.is_spoiler ? "spoiler-blur" : ""}`}>
                              {item.comment}
                            </p>
                          )}
                        </div>

                        <div className="card-footer">
                          <div className="card-footer-info">
                            <span className="card-diary-info">📅 {item.finished_at ? new Date(item.finished_at).toLocaleDateString("pt-BR") : "Sem data"}</span>
                            <span className="card-xp-badge">+{item.xp_gained || XP_BY_RATING[item.rating] || 50} XP</span>
                          </div>
                          <div className="card-footer-actions" style={{ marginTop: '0.85rem' }}>
                            <button className="btn-item-edit" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>✏️ Editar</button>
                            <button className="btn-item-delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>🗑️</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Layout Sem Capa (Fiel à imagem testesset) */}
                        <div className="card-header">
                          <span className="category-tag" style={{ color: cardColorVar }}>
                            {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category].toUpperCase()}
                          </span>
                          <span className={`status-badge ${getStatusClass(item.status)}`}>
                            {getStatusLabel(item.category, item.status).toUpperCase()}
                          </span>
                        </div>

                        <div className="card-body-content" style={{ padding: 0, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                          <h3 className="media-title">{item.title}</h3>
                          {item.rating && (
                            <div className="star-rating-display">
                              <span className="star-filled">{"★".repeat(item.rating)}</span>
                              <span className="star-empty">{"★".repeat(5 - item.rating)}</span>
                              <span className="rating-number">{parseFloat(item.rating).toFixed(1)}</span>
                            </div>
                          )}
                          {item.comment && (
                            <p className={`media-comment ${item.is_spoiler ? "spoiler-blur" : ""}`}>
                              {item.comment}
                            </p>
                          )}
                        </div>

                        <div className="card-footer">
                          <div className="card-footer-info">
                            <span className="card-diary-info">📅 {item.finished_at ? new Date(item.finished_at).toLocaleDateString("pt-BR") : "Sem data"}</span>
                            <span className="card-xp-badge">+{item.xp_gained || XP_BY_RATING[item.rating] || 50} XP</span>
                          </div>
                          <div className="card-footer-actions" style={{ marginTop: '0.85rem' }}>
                            <button className="btn-item-edit" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>✏️ Editar</button>
                            <button className="btn-item-delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>🗑️</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

      {/* LISTAS */}
      {activeSubTab === "lists" && (
        <div id="catalogListsSection">
          <div className="lists-header-row">
            <div>
              <h3>Listas Temáticas Personalizadas</h3>
              <p className="desc-muted" style={{ margin: 0 }}>Crie coleções de obras</p>
            </div>
            <button
              className="btn-create"
              onClick={() => {
                setEditingList(null);
                setShowListModal(true);
              }}
            >
              <span>+</span> Nova Lista
            </button>
          </div>

          <div className="custom-lists-grid">
            {lists.length > 0 ? lists.map(list => (
              <div key={list.id} className="custom-list-card">
                <div className="custom-list-top">
                  <h4 className="custom-list-title">{list.title}</h4>
                  <span className={`custom-list-visibility ${list.visibility === 'publica' ? 'public' : 'private'}`}>
                    {list.visibility === 'publica' ? 'Pública' : 'Privada'}
                  </span>
                </div>
                <p className="custom-list-desc">{list.description || "Sem descrição"}</p>
                <div
                  className="custom-list-footer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.75rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {list.item_count || 0} {list.item_count === 1 ? "obra" : "obras"}
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      type="button"
                      className="btn-item-edit"
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                      onClick={() => {
                        setEditingList(list);
                        setShowListModal(true);
                      }}
                      title="Editar lista"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      className="btn-item-delete"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => handleDeleteList(list)}
                      title="Excluir lista"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ gridColumn: "1/-1", padding: "2rem", background: "var(--bg-glass-card)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <p>Nenhuma lista criada ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MISSÕES */}
      {activeSubTab === "missions" && (
        <div id="catalogMissionsSection">
          <div className="missions-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}>
            <div className="missions-banner-info" style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                <span className="missions-tag" style={{ background: "linear-gradient(90deg, #6366f1, #ec4899)", color: "#fff" }}>
                  🤖 Curadoria por IA
                </span>
                {missionsMeta?.theme && (
                  <span className="equipped-title-badge" style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem", background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-subtle)" }}>
                    ✨ Tema: {missionsMeta.theme}
                  </span>
                )}
              </div>
              <h3 style={{ margin: "0.25rem 0", fontSize: "1.25rem" }}>
                {missionsMeta?.periodInfo?.periodLabel || `Missões Quinzenais de ${new Date().toLocaleString("pt-BR", { month: "long" })}`}
              </h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Desafios culturais selecionados pela IA renovados automaticamente a cada quinzena. Conclua as metas antes do prazo expirar para resgatar XP!
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div className="missions-timer-box">
                <span className="timer-icon">⏳</span>
                <div>
                  <div className="timer-val">
                    {missionsMeta?.periodInfo?.remainingDays != null
                      ? `${missionsMeta.periodInfo.remainingDays} dias`
                      : `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} dias`}
                  </div>
                  <div className="timer-lbl">nesta quinzena</div>
                </div>
              </div>
            </div>
          </div>

          <div className="missions-grid">
            {loading ? (
              <p style={{ gridColumn: "1/-1" }}>Carregando missões...</p>
            ) : missions.length === 0 ? (
              <p style={{ gridColumn: "1/-1" }}>Não há missões ativas no momento.</p>
            ) : (
              missions.map(m => {
                const current = m.progress?.current_count || 0;
                const target = m.target_count || 1;
                const pct = Math.min(100, Math.round((current / target) * 100));
                const isCompleted = Boolean(m.progress?.is_completed || current >= target);
                const isClaimed = Boolean(m.progress?.is_claimed);

                return (
                  <div key={m.id} className={`mission-card ${isClaimed ? "completed" : ""}`}>
                    <div>
                      <div className="mission-header">
                        <div className="mission-icon">{m.icon || "🎯"}</div>
                        <div className="mission-info">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                            <h4 style={{ margin: 0 }}>{m.title}</h4>
                            {m.ai_generated && (
                              <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                                🤖 IA
                              </span>
                            )}
                          </div>
                          <p>{m.description}</p>
                        </div>
                      </div>

                      <div style={{ marginTop: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.35rem" }}>
                          <span style={{ color: "var(--text-muted)" }}>Progresso: {current}/{target}</span>
                          <span className="mission-reward-badge">+{m.reward_xp} XP</span>
                        </div>
                        <div className="achievement-progress-bar-wrap">
                          <div className="ach-prog-track">
                            <div className="ach-prog-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      {isClaimed ? (
                        <div style={{ textAlign: "center", color: "var(--success)", fontWeight: 700, fontSize: "0.85rem", padding: "0.4rem" }}>
                          ✓ Recompensa Resgatada
                        </div>
                      ) : isCompleted ? (
                        <button
                          type="button"
                          className="btn-claim-mission"
                          onClick={() => handleClaimMission(m.id)}
                        >
                          🎁 Resgatar +{m.reward_xp} XP
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-icon-text"
                          style={{ width: "100%", justifyContent: "center", opacity: 0.6, cursor: "not-allowed" }}
                          disabled
                        >
                          Em Andamento ({pct}%)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {renderModal()}

      {showListModal && mounted && createPortal(
        <CustomListModal
          listToEdit={editingList}
          catalogItems={items}
          onClose={() => {
            setShowListModal(false);
            setEditingList(null);
          }}
          onSave={(savedList) => {
            fetchData();
            setShowListModal(false);
            setEditingList(null);
            setXpToast(editingList ? "✓ Lista atualizada com sucesso!" : "✓ Lista criada com sucesso!");
            setTimeout(() => setXpToast(null), 3000);
          }}
        />,
        document.body
      )}
    </div>
  );
}