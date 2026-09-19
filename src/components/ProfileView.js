"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "", username: "", bio: "", is_private: false,
    new_password: "", confirm_password: "",
    avatar_url: "",
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSaving(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, avatar_url: data.url }));
        setSuccessMsg("Avatar atualizado! Clique em Salvar para concluir.");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erro ao fazer upload da imagem.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão ao enviar imagem.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          setProfile(p);
          setForm(f => ({
            ...f,
            name: p.name || "",
            username: p.username || "",
            bio: p.bio || "",
            is_private: !!p.is_private,
            avatar_url: p.avatar_url || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      setErrorMsg("As senhas não conferem.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const body = {
        name: form.name,
        username: form.username,
        bio: form.bio,
        is_private: form.is_private,
        avatar_url: form.avatar_url,
      };
      if (form.new_password) body.new_password = form.new_password;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMsg("Perfil atualizado com sucesso!");
        setTimeout(() => setSuccessMsg(""), 3000);
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Erro ao salvar.");
      }
    } finally {
      setSaving(false);
      setForm(f => ({ ...f, new_password: "", confirm_password: "" }));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e apagará todos os seus dados.")) {
      await fetch("/api/user/profile", { method: "DELETE" });
      router.push("/");
    }
  };

  const getLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>Carregando perfil...</div>;

  return (
    <section id="profileView" className="profile-section fade-in" style={{ display: "block" }}>
      <div className="profile-layout">

        {/* COLUNA 1: CARD DE PRÉ-VISUALIZAÇÃO (Fiel ao HTML) */}
        <div className="profile-preview-card">
          <div className="profile-card-avatar-wrapper">
            <div className="profile-card-avatar" id="cardAvatarPreview">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : profile?.name?.charAt(0).toUpperCase() || "U"
              }
            </div>
          </div>

          <h3 id="cardProfileName">{profile?.name || "Meu Perfil"}</h3>
          <div className="profile-preview-user" id="cardProfileUsername">@{profile?.username || "usuario"}</div>
          <div className="profile-equipped-title" id="cardProfileTitle">⭐ {profile?.equipped_title || "Iniciante Curioso"}</div>

          <p className="profile-preview-bio" id="cardProfileBio">
            {profile?.bio || "Nenhuma biografia disponível."}
          </p>

          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="val">{profile?.total_items || profile?.total_media_items || 0}</div>
              <div className="lbl">Obras</div>
            </div>
            <div className="profile-stat-box">
              <div className="val">Nv. {getLevel(profile?.total_xp)}</div>
              <div className="lbl">Patente</div>
            </div>
            <div className="profile-stat-box">
              <div className="val">{profile?.total_games || 0}</div>
              <div className="lbl">Jogos 🎮</div>
            </div>
            <div className="profile-stat-box">
              <div className="val">{profile?.total_achievements_unlocked || 0}</div>
              <div className="lbl">Troféus 🏆</div>
            </div>
            <div className="profile-stat-box">
              <div className="val">{profile?.total_hours_invested ? `${profile.total_hours_invested}h` : (profile?.hours_spent || "0h")}</div>
              <div className="lbl">Tempo Total</div>
            </div>
            <div className="profile-stat-box">
              <div className="val">{profile?.total_friends || 0}</div>
              <div className="lbl">Amigos 👥</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem", width: "100%" }}>
            <button type="button" className="btn-secondary" onClick={handleLogout} style={{ width: "100%", borderColor: "rgba(239, 68, 68, 0.35)", color: "var(--danger)", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.65rem 1rem" }}>
              <span>🚪</span> Sair da Conta
            </button>
          </div>
        </div>

        {/* COLUNA 2: PAINEL DE EDIÇÃO */}
        <div className="profile-edit-panel">
          <h3>Editar Perfil & Preferências</h3>
          <p className="desc">Atualize sua foto, título honorífico de nível, bio, credenciais e privacidade.</p>

          {successMsg && <div className="alert-success" style={{ marginBottom: "1.25rem" }}>{successMsg}</div>}
          {errorMsg && <div className="alert-error" style={{ marginBottom: "1.25rem", display: "block" }}>{errorMsg}</div>}

          <form onSubmit={handleSave}>

            {/* Upload de Foto (Layout Fiel CSS) */}
            <div className="photo-uploader">
              <div className="photo-preview-mini">
                {form.avatar_url
                  ? <img src={form.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : form.name?.charAt(0).toUpperCase() || "U"
                }
              </div>
              <div>
                <div className="photo-actions">
                  <input type="file" id="avatarFileInput" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                  <button type="button" className="btn-upload-file" onClick={() => document.getElementById('avatarFileInput').click()}>
                    📷 Escolher Foto
                  </button>
                  <button type="button" className="btn-remove-photo" onClick={() => setForm(f => ({ ...f, avatar_url: "" }))}>
                    Remover foto
                  </button>
                </div>
                <small style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.35rem", display: "block" }}>
                  Formatos JPG, PNG ou WEBP.
                </small>
              </div>
            </div>

            {/* Configuração de Perfil Privado */}
            <div className="privacy-toggle-box">
              <div className="privacy-toggle-info">
                <h4>🔒 Perfil Privado</h4>
                <p>Ocultar seu acervo, listas e resenhas de membros que visitarem seu perfil.</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>

            {/* Título Honorífico Baseado no Nível Cultural (Automático) */}
            <div className="form-group" style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              borderRadius: "14px",
              padding: "1.15rem 1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: "#c084fc", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span>🎖️</span> Título Honorífico do Nível Cultural
                </label>
                <span style={{ fontSize: "0.78rem", color: "#facc15", background: "rgba(250, 204, 21, 0.12)", padding: "0.2rem 0.6rem", borderRadius: "10px", fontWeight: 700 }}>
                  ⭐ Nível {getLevel(profile?.total_xp)} • {profile?.total_xp || 0} XP
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.4rem" }}>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span>👑</span>
                  <span>{profile?.equipped_title || "Iniciante Curioso"}</span>
                </div>
              </div>

              {profile?.next_title && (
                <div style={{ marginTop: "0.65rem", fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span>🚀</span>
                  <span>
                    Próximo título: <strong style={{ color: "#a855f7" }}>{profile.next_title.icon} {profile.next_title.title}</strong> no Nível {profile.next_title.minLevel} ({profile.next_title.levelsNeeded} {profile.next_title.levelsNeeded === 1 ? 'nível restante' : 'níveis restantes'})
                  </span>
                </div>
              )}

              <p style={{ margin: "0.65rem 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                💡 <em>O título honorífico é concedido automaticamente de acordo com seu nível cultural e XP acumulado, evoluindo dinamicamente no Keeplay.</em>
              </p>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="input-field" placeholder="Ex: Rafael Silva" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">@Usuário</label>
                <input type="text" className="input-field" placeholder="usuario123..."
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sobre Mim (Biografia)</label>
              <textarea className="input-field" rows="3" placeholder="Conte um pouco sobre suas preferências culturais, franquias favoritas..."
                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} maxLength="300" />
            </div>

            <div className="form-row-2" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nova Senha</label>
                <input type="password" className="input-field" placeholder="Mínimo 6 caracteres..."
                  value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} minLength="6" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Nova Senha</label>
                <input type="password" className="input-field" placeholder="Repita a senha..."
                  value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn-primary" style={{ width: "auto", paddingLeft: "2rem", paddingRight: "2rem" }} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>

          {/* Zona de Perigo / Exclusão de Perfil (Fiel ao CSS Original) */}
          <div className="profile-danger-zone">
            <div className="danger-zone-header">
              <div className="danger-icon">⚠️</div>
              <div className="danger-info">
                <h4>Zona de Perigo</h4>
                <p>A exclusão de perfil é definitiva e irreversível. Todos os seus registros culturais, diário de consumo, listas temáticas, conquistas e conexões serão permanentemente apagados.</p>
              </div>
            </div>
            <div className="danger-zone-action">
              <button type="button" className="btn-delete-profile-trigger" onClick={handleDeleteAccount}>
                <span>🗑️</span> Excluir Perfil
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}