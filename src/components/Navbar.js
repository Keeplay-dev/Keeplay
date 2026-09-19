"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import WrappedModal from "./WrappedModal";
import AchievementsModal from "./AchievementsModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, chatsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/chats")
        ]);
        
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.profile);
        }
        
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json();
          const unread = (chatsData.chats || []).reduce((acc, c) => acc + (c.unread_count || 0), 0);
          setUnreadChats(unread);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da navbar:", err);
      }
    }
    loadData();
    // Poll for unread chats every 15s
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error("Erro ao sair", err);
    }
  }

  const getLevel = (xp) => Math.floor((xp || 0) / 500) + 1;
  const getXpProgress = (xp) => (xp || 0) % 500;
  const getXpToNext = () => 500;

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="brand-wrapper" id="brandHomeBtn" onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>
          <div
            className="brand-icon"
            style={{
              width: "38px",
              height: "38px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="/keeplay_icon.jpg"
              alt="Keeplay"
              className="brand-icon-img"
              width="38"
              height="38"
              style={{
                width: "38px",
                height: "38px",
                objectFit: "cover",
                borderRadius: "10px",
                display: "block",
              }}
            />
          </div>
          <span className="brand-title">Keeplay</span>
        </div>

        <nav className="nav-views-switcher" aria-label="Navegação Principal">
          <Link href="/dashboard" className={`nav-view-btn ${pathname === "/dashboard" ? "active" : ""}`}>
            <span>📚</span> Catálogo
          </Link>
          <Link href="/dashboard/community" className={`nav-view-btn ${pathname === "/dashboard/community" ? "active" : ""}`}>
            <span>👥</span> Comunidade
          </Link>
          <Link href="/dashboard/chats" className={`nav-view-btn ${pathname === "/dashboard/chats" ? "active" : ""}`} style={{ position: "relative" }}>
            <span>💬</span> Chats
            {unreadChats > 0 && (
              <span style={{
                position: "absolute", top: "-5px", right: "-5px",
                background: "var(--danger)", color: "white", fontSize: "0.65rem",
                padding: "2px 6px", borderRadius: "10px", fontWeight: "bold"
              }}>
                {unreadChats}
              </span>
            )}
          </Link>
          <Link href="/dashboard/profile" className={`nav-view-btn ${pathname === "/dashboard/profile" ? "active" : ""}`}>
            <span>👤</span> Meu Perfil
          </Link>
        </nav>

        <div className="gamification-bar" title="Seu progresso atual no Keeplay">
          <div className="level-badge" id="userLevelBadge">
            <span>⭐</span> <span id="levelNumber">Nível {getLevel(profile?.total_xp)}</span>
          </div>

          <div className="xp-progress-wrapper">
            <div className="xp-text-info">
              <span id="xpCurrentText">{getXpProgress(profile?.total_xp)} XP</span>
              <span id="xpNextText">/ {getXpToNext()} XP</span>
            </div>
            <div className="xp-progress-track">
              <div className="xp-progress-fill" id="xpProgressBar" style={{ width: `${(getXpProgress(profile?.total_xp) / getXpToNext()) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <button id="btnOpenWrapped" className="btn-icon-text btn-wrapped-pulse" title="Ver sua Retrospectiva Cultural Interativa" onClick={() => setShowWrapped(true)}>
            <span>🎁 Wrapped</span>
          </button>

          <button id="btnOpenAchievements" className="btn-icon-text" title="Ver medalhas e conquistas secretas" onClick={() => setShowAchievements(true)}>
            <span>🏆 Conquistas</span>
            <span className="badge-count" id="unlockedBadgesCount">0/31</span>
          </button>

          <button id="btnOpenCsvModal" className="btn-icon-text" title="Importar/Exportar dados em CSV ou JSON">
            <span>📥 Dados</span>
          </button>
          
          <Link href="/dashboard/profile" id="navProfileShortcut" className="nav-profile-btn" title="Ir para Meu Perfil">
            <div className="nav-avatar-mini" id="navAvatarMini" style={{ overflow: "hidden" }}>
              {profile?.avatar_url 
                ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "👤"
              }
            </div>
            <span id="navUsernameText">{profile?.name || "Perfil"}</span>
          </Link>

          <button id="btnLogout" className="btn-logout" title="Sair da sua conta" onClick={handleLogout}>
            <span>🚪</span> Sair
          </button>
        </div>
      </div>

      {showWrapped && <WrappedModal onClose={() => setShowWrapped(false)} />}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
    </header>
  );
}
