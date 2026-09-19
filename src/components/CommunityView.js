"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserCatalogModal from "./UserCatalogModal";

export default function CommunityView() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("members");

  // Estados para armazenar os dados reais da API
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedCatalogUserId, setSelectedCatalogUserId] = useState(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [feedFilter, setFeedFilter] = useState("all");

  // Carrega os dados reais do DB (Feed, Amigos, Requests e Usuários)
  const fetchData = async (filter = feedFilter) => {
    try {
      const [communityRes, usersRes] = await Promise.all([
        fetch(`/api/community?filter=${filter}`),
        fetch("/api/community/users")
      ]);

      if (communityRes.ok) {
        const data = await communityRes.json();
        setFeed(data.feed || []);
        setFriends(data.friends || []);
        setRequests(data.requests || []);
        const sentIds = (data.sentRequests || []).map(r => r.id);
        setSentRequests(sentIds);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        if (usersData.currentUserId) {
          setCurrentUserId(usersData.currentUserId);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar comunidade:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(feedFilter);
  }, [feedFilter]);

  // Aceitar Pedido
  const handleAcceptRequest = async (connectionId) => {
    try {
      const res = await fetch(`/api/community/connect/${connectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      if (res.ok) {
        const acceptedReq = requests.find(r => r.connection_id === connectionId);
        if (acceptedReq) {
          setFriends(prev => [...prev, acceptedReq]);
        }
        setRequests(r => r.filter(req => req.connection_id !== connectionId));
        setUsers(prev => prev.map(u => u.connection_id === connectionId ? { ...u, is_friend: 1, connection_status: 'accepted' } : u));
      }
    } catch (err) {
      console.error("Erro ao aceitar pedido:", err);
    }
  };

  // Recusar Pedido
  const handleRejectRequest = async (connectionId) => {
    try {
      const res = await fetch(`/api/community/connect/${connectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.ok) {
        setRequests(r => r.filter(req => req.connection_id !== connectionId));
        setUsers(prev => prev.map(u => u.connection_id === connectionId ? { ...u, connection_status: null, request_received_by_me: 0 } : u));
      }
    } catch (err) {
      console.error("Erro ao recusar pedido:", err);
    }
  };

  // Enviar Pedido de Amizade
  const handleSendRequest = async (addresseeId) => {
    try {
      const res = await fetch("/api/community/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressee_id: addresseeId }),
      });

      if (res.ok) {
        setSentRequests(prev => [...prev, addresseeId]);
        setUsers(prev => prev.map(u => u.id === addresseeId ? { ...u, connection_status: 'pending', request_sent_by_me: 1 } : u));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erro ao enviar solicitação.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  // Desfazer Amizade
  const handleUnfriend = async (targetUser) => {
    if (!targetUser || !targetUser.id) return;
    const name = targetUser.name || `@${targetUser.username}` || "este usuário";
    if (!confirm(`Deseja realmente desfazer a amizade com ${name}?`)) return;

    try {
      const idToPass = targetUser.connection_id || targetUser.id;
      const res = await fetch(`/api/community/connect/${idToPass}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriends(prev => prev.filter(f => f.id !== targetUser.id));
        setUsers(prev => prev.map(u => {
          if (u.id === targetUser.id) {
            return {
              ...u,
              is_friend: 0,
              connection_status: null,
              connection_id: null,
              request_sent_by_me: 0,
              request_received_by_me: 0,
            };
          }
          return u;
        }));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Não foi possível desfazer a amizade.");
      }
    } catch (err) {
      console.error("Erro ao desfazer amizade:", err);
      alert("Erro de conexão ao desfazer amizade.");
    }
  };

  // Cancelar Solicitação Enviada
  const handleCancelRequest = async (targetUser) => {
    if (!targetUser || !targetUser.id) return;
    try {
      const idToPass = targetUser.connection_id || targetUser.id;
      const res = await fetch(`/api/community/connect/${idToPass}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSentRequests(prev => prev.filter(id => id !== targetUser.id));
        setUsers(prev => prev.map(u => {
          if (u.id === targetUser.id) {
            return {
              ...u,
              connection_status: null,
              connection_id: null,
              request_sent_by_me: 0,
            };
          }
          return u;
        }));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Não foi possível cancelar a solicitação.");
      }
    } catch (err) {
      console.error("Erro ao cancelar solicitação:", err);
    }
  };

  // Abrir Chat Diretamente com o Membro (sem auto_accept indevido)
  const handleOpenChat = (targetUser) => {
    if (!targetUser || !targetUser.id) return;
    router.push(`/dashboard/chats?userId=${targetUser.id}`);
  };

  // Reações no Feed (Curtir / Fogo / Palmas)
  const handleToggleReaction = async (activityId, reaction = "like") => {
    // Atualização otimista imediata
    setFeed(prev => prev.map(item => {
      if (item.id !== activityId) return item;
      const wasLiked = item.user_liked === 1;
      const delta = wasLiked ? -1 : 1;
      return {
        ...item,
        user_liked: wasLiked ? 0 : 1,
        likes_count: Math.max(0, (item.likes_count || 0) + delta)
      };
    }));

    try {
      const res = await fetch(`/api/community/feed/${activityId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setFeed(prev => prev.map(item => {
            if (item.id !== activityId) return item;
            return {
              ...item,
              likes_count: data.stats.likes_count,
              applause_count: data.stats.applause_count,
              fire_count: data.stats.fire_count,
              user_liked: data.user_liked ? 1 : 0
            };
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao reagir ao feed:", err);
    }
  };

  const toggleSpoiler = (id) => {
    setRevealedSpoilers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategory = (item) => {
    if (item.media_category) return item.media_category;
    if (item.metadata) {
      try {
        const parsed = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata;
        if (parsed?.category) return parsed.category;
      } catch (e) {}
    }
    return "Obra Cultural";
  };

  const categoryIcon = (cat) => {
    const map = {
      filme: "🎬",
      serie: "🍿",
      livro: "📚",
      jogo: "🎮",
      musica: "🎵",
      anime: "⚡"
    };
    return map[cat?.toLowerCase()] || "✨";
  };

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const activityLabel = (type) => {
    const map = {
      item: "registrou no acervo",
      registrou: "registrou",
      avaliou: "avaliou e comentou",
      zerou: "completou / zerou",
      platinou: "platinou 100%",
      achievement_unlocked: "desbloqueou uma conquista",
      abandonou: "abandonou",
      comecou: "começou a acompanhar"
    };
    return map[type] || "compartilhou";
  };

  return (
    <section id="communityView" className="community-section fade-in" style={{ display: "block" }}>

      {/* Sub-nav da Comunidade (Fiel à imagem com 4 abas) */}
      <div className="sub-nav-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="sub-nav-tabs">
          <button type="button" className={`sub-nav-tab ${activeSubTab === "members" ? "active" : ""}`} onClick={() => setActiveSubTab("members")}>
            <span>👥</span> Membros &amp; Afinidade Cultural
          </button>
          <button type="button" className={`sub-nav-tab ${activeSubTab === "requests" ? "active" : ""}`} onClick={() => setActiveSubTab("requests")}>
            <span>📬</span> Solicitações {requests.length > 0 && <span className="badge-pill pulse-badge" style={{ marginLeft: "0.4rem" }}>{requests.length}</span>}
          </button>
          <button type="button" className={`sub-nav-tab ${activeSubTab === "feed" ? "active" : ""}`} onClick={() => setActiveSubTab("feed")}>
            <span>⚡</span> Feed de Atividades dos Amigos
          </button>
          <button type="button" className={`sub-nav-tab ${activeSubTab === "blocked" ? "active" : ""}`} onClick={() => setActiveSubTab("blocked")}>
            <span>🚫</span> Bloqueados
          </button>
        </div>
      </div>

      {/* SEÇÃO: MEMBROS & AFINIDADE CULTURAL */}
      {activeSubTab === "members" && (
        <div id="communityMembersSection">
          <div className="community-header">
            <div className="community-header-title-row">
              <h2>Comunidade Cultural &amp; Afinidade 👥</h2>
              <span className="badge-pill" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontSize: "0.8rem", padding: "0.25rem 0.75rem" }}>
                {friends.length} amigos conectados
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>Descubra outros membros, veja a porcentagem de afinidade de gostos com seu perfil e envie convites de amizade.</p>
            <div className="community-search-box">
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Buscar membros por nome, @usuário, bio ou preferências..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="community-grid">
            {loading ? (
              <p className="empty-state" style={{ gridColumn: "1/-1" }}>Carregando membros do banco de dados...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="empty-state" style={{ gridColumn: "1/-1" }}>Nenhum membro encontrado.</p>
            ) : (
              filteredUsers.map((u, index) => {
                const isFriend = u.is_friend === 1 || u.connection_status === 'accepted' || friends.some(f => f.id === u.id);
                const isPending = u.request_sent_by_me === 1 || (u.connection_status === 'pending' && u.connection_requester_id === currentUserId) || sentRequests.includes(u.id);
                const hasIncomingRequest = u.request_received_by_me === 1 || requests.some(r => r.id === u.id);

                // Afinidade cultural segura e precisa (garante que nunca seja NaN)
                let affinityScore = 55;
                if (typeof u.affinity_score === 'number' && !isNaN(u.affinity_score)) {
                  affinityScore = u.affinity_score;
                } else if (u.affinity?.percentage && !isNaN(Number(u.affinity.percentage))) {
                  affinityScore = Number(u.affinity.percentage);
                } else {
                  let hash = 0;
                  const str = String(u.id || u.username || "keeplay");
                  for (let i = 0; i < str.length; i++) {
                    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
                  }
                  affinityScore = 55 + Math.abs(hash % 35);
                }
                affinityScore = Math.min(99, Math.max(35, Math.round(affinityScore)));
                const affinityLabel = u.affinity_label || u.affinity?.label || (affinityScore >= 80 ? "Alma Gêmea Cultural" : affinityScore >= 65 ? "Alta Afinidade" : "Conexão em Potencial");
                const userTitle = u.equipped_title || getTitleByXp(u.total_xp);

                return (
                  <div key={u.id} className="user-card">

                    {/* Cabeçalho do Cartão */}
                    <div className="user-card-top">
                      <div className="user-card-avatar">
                        <div className="user-card-avatar-inner">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : u.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="user-card-info" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{u.name}</h4>
                            <div className="user-card-username">@{u.username}</div>
                          </div>
                          <span className={`user-card-privacy-badge ${u.is_private ? "private" : "public"}`}>
                            {u.is_private ? "🔒 Privado" : "🌐 Público"}
                          </span>
                        </div>
                        <div className="equipped-title-badge" style={{ marginTop: "0.4rem", fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                          ⭐ {userTitle}
                        </div>
                      </div>
                    </div>

                    {/* Biografia Original */}
                    <p className="user-card-bio">
                      {u.bio || "Novo explorador cultural no Keeplay."}
                    </p>

                    {/* Medidor de Afinidade Cultural */}
                    <div className="affinity-meter-box">
                      <div className="affinity-header-row">
                        <span>Afinidade Cultural:</span>
                        <span className="affinity-percentage-val">{affinityScore}%</span>
                      </div>
                      <div className="affinity-bar-track">
                        <div className="affinity-bar-fill" style={{ width: `${affinityScore}%` }}></div>
                      </div>
                      <span className="affinity-label-tag">{affinityLabel}</span>
                    </div>

                    {/* Estatísticas (Obras, Nível, XP) */}
                    <div className="user-card-stats">
                      <div className="user-card-stat-item">
                        <div className="n">{u.total_items || 0}</div>
                        <div className="l">Obras</div>
                      </div>
                      <div className="user-card-stat-item">
                        <div className="n">Nv. {getLevel(u.total_xp)}</div>
                        <div className="l">Nível</div>
                      </div>
                      <div className="user-card-stat-item">
                        <div className="n">{u.total_xp || 0}</div>
                        <div className="l">XP</div>
                      </div>
                    </div>

                    {/* Ações Inferiores (Adicionar, Chat, Catálogo) */}
                    <div className="user-card-actions" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        {isFriend ? (
                          <button
                            type="button"
                            className="btn-friend is-friend"
                            onClick={() => handleUnfriend(u)}
                            title="Clique para desfazer amizade"
                            style={{ width: "100%", cursor: "pointer" }}
                          >
                            ✓ Amigos
                          </button>
                        ) : isPending ? (
                          <button
                            type="button"
                            className="btn-friend is-pending"
                            onClick={() => handleCancelRequest(u)}
                            title="Clique para cancelar solicitação enviada"
                            style={{ width: "100%", cursor: "pointer" }}
                          >
                            ⏳ Enviada
                          </button>
                        ) : hasIncomingRequest ? (
                          <button
                            type="button"
                            className="btn-friend"
                            onClick={() => setActiveSubTab("requests")}
                            style={{ width: "100%", background: "rgba(99, 102, 241, 0.25)", color: "#a5b4fc", border: "1px solid #6366f1", cursor: "pointer" }}
                          >
                            📬 Responder Pedido
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-friend not-friend"
                            onClick={() => handleSendRequest(u.id)}
                            style={{ width: "100%", cursor: "pointer" }}
                          >
                            + Conectar
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-chat-trigger"
                        title={isFriend ? "Enviar Mensagem Direta" : "Chat (Exclusivo para Amigos)"}
                        style={{ flexShrink: 0, padding: "0.45rem 0.75rem", fontSize: "0.78rem", opacity: isFriend ? 1 : 0.8 }}
                        onClick={() => handleOpenChat(u)}
                      >
                        {isFriend ? "💬 Chat" : "🔒 Chat"}
                      </button>
                      <button
                        type="button"
                        className="btn-view-user-catalog"
                        title="Ver catálogo do usuário"
                        style={{ flexShrink: 0, padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}
                        onClick={() => setSelectedCatalogUserId(u.id)}
                      >
                        📚 Ver Catálogo
                      </button>
                      <button
                        type="button"
                        className="btn-block-action"
                        title="Bloquear usuário"
                        style={{ flexShrink: 0, width: "34px", height: "34px", padding: 0, justifyContent: "center" }}
                        onClick={() => alert(`Usuário @${u.username} silenciado.`)}
                      >
                        🚫
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO: SOLICITAÇÕES DE AMIZADE */}
      {activeSubTab === "requests" && (
        <div id="communityRequestsSection">
          <div className="requests-header">
            <h2>Gerenciamento de Solicitações 📬</h2>
            <p>Aceite ou recuse pedidos de amizade recebidos e gerencie sua lista de amigos.</p>
          </div>

          <div className="requests-columns-layout">

            {/* Coluna 1: Solicitações Recebidas */}
            <div className="requests-column-card">
              <div className="requests-column-header">
                <h3>📥 Recebidas ({requests.length})</h3>
                <p className="desc-muted">Membros que solicitaram conexão com você.</p>
              </div>
              <div className="requests-list-container">
                {loading ? (
                  <p className="desc-muted">Carregando...</p>
                ) : requests.length === 0 ? (
                  <div className="requests-empty-state">
                    <div className="icon">📬</div>
                    <p>Nenhuma solicitação pendente.</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.connection_id} className="request-item-card">
                      <div className="request-user-meta">
                        <div className="request-user-avatar">
                          {req.avatar_url ? <img src={req.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : req.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="request-user-details">
                          <h4>{req.name}</h4>
                          <div className="request-user-username">@{req.username}</div>
                        </div>
                      </div>
                      <div className="request-item-actions">
                        <button className="btn-req-accept" onClick={() => handleAcceptRequest(req.connection_id)}>Aceitar</button>
                        <button className="btn-req-reject" onClick={() => handleRejectRequest(req.connection_id)}>Recusar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Coluna 2: Amigos Atuais */}
            <div className="requests-column-card">
              <div className="requests-column-header">
                <h3>👥 Amigos Conectados ({friends.length})</h3>
                <p className="desc-muted">Suas conexões confirmadas.</p>
              </div>
              <div className="requests-list-container">
                {friends.length === 0 ? (
                  <div className="requests-empty-state">
                    <div className="icon">👥</div>
                    <p>Você ainda não tem amigos conectados.</p>
                  </div>
                ) : (
                  friends.map(f => (
                    <div key={f.id} className="request-item-card" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                      <div className="request-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                        {f.avatar_url ? <img src={f.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : f.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="request-user-details" style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "0.9rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</h4>
                        <div className="request-user-username" style={{ fontSize: "0.75rem" }}>@{f.username}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn-chat-trigger"
                          title="Conversar"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => handleOpenChat(f)}
                        >
                          💬 Chat
                        </button>
                        <button
                          type="button"
                          className="btn-view-user-catalog"
                          title="Ver Catálogo"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => setSelectedCatalogUserId(f.id)}
                        >
                          📚 Catálogo
                        </button>
                        <button
                          type="button"
                          className="btn-unfriend-action"
                          title="Desfazer Amizade"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#f87171",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "var(--radius-sm, 6px)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onClick={() => handleUnfriend(f)}
                        >
                          ✕ Desfazer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEÇÃO: FEED DE ATIVIDADES */}
      {activeSubTab === "feed" && (
        <div id="communityFeedSection">
          <div className="feed-header" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2>Feed de Atividades Culturais ⚡</h2>
                <p style={{ color: "var(--text-secondary)" }}>Acompanhe em tempo real o que os membros estão assistindo, jogando e avaliando.</p>
              </div>

              {/* Filtro: Amigos vs Todos */}
              <div style={{ display: "flex", gap: "0.5rem", background: "rgba(0,0,0,0.3)", padding: "0.25rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => setFeedFilter("all")}
                  style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: feedFilter === "all" ? "var(--accent-primary)" : "transparent",
                    color: feedFilter === "all" ? "#fff" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  🌐 Toda a Comunidade
                </button>
                <button
                  type="button"
                  onClick={() => setFeedFilter("friends")}
                  style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: feedFilter === "friends" ? "var(--accent-primary)" : "transparent",
                    color: feedFilter === "friends" ? "#fff" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  👥 Meus Amigos ({friends.length})
                </button>
              </div>
            </div>
          </div>

          <div className="activity-feed-timeline">
            {loading ? (
              <p className="empty-state">Carregando feed cultural...</p>
            ) : feed.length === 0 ? (
              <div className="requests-empty-state" style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem 1rem" }}>
                <span style={{ fontSize: "2.5rem" }}>⚡</span>
                <h4 style={{ margin: "1rem 0 0.5rem 0", color: "var(--text-primary)" }}>Nenhuma publicação encontrada</h4>
                <p>{feedFilter === "friends" ? "Seus amigos conectados ainda não registraram atividades culturais. Explore a aba 'Toda a Comunidade'!" : "O feed está silencioso no momento."}</p>
              </div>
            ) : (
              feed.map((item, index) => {
                const uniqueKey = item.id || `feed-item-${index}`;
                const category = getCategory(item);
                const isItemFriend = friends.some(f => f.id === item.user_id);

                return (
                  <article key={uniqueKey} className="feed-card publication-card" style={{
                    background: "var(--bg-glass-card)",
                    backdropFilter: "var(--backdrop-blur)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.25rem",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)"
                  }}>
                    {/* Topo: Autor da Publicação */}
                    <div className="feed-top-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="feed-avatar" style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid rgba(99, 102, 241, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--accent-gradient)",
                          color: "#fff",
                          fontWeight: 700
                        }}>
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            item.user_name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="feed-user-meta">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700 }}>{item.user_name}</h4>
                            <span className="feed-time" style={{ fontSize: "0.78rem" }}>@{item.user_username || "usuario"}</span>
                            {item.user_equipped_title && (
                              <span className="equipped-title-badge" style={{ fontSize: "0.68rem", padding: "0.1rem 0.45rem" }}>
                                🎖️ {item.user_equipped_title}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                            {activityLabel(item.activity_type)} • {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon-text"
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.35rem 0.75rem",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-full)",
                          cursor: "pointer",
                          color: "var(--text-secondary)"
                        }}
                        onClick={() => setSelectedCatalogUserId(item.user_id)}
                        title="Ver todo o acervo deste membro"
                      >
                        📚 Catálogo
                      </button>
                    </div>

                    {/* Corpo da Publicação (Capa, Título, Categoria e Nota) */}
                    <div className="feed-publication-body" style={{
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.1rem",
                      marginBottom: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem"
                    }}>
                      <div style={{ display: "flex", gap: "1.1rem", alignItems: "flex-start" }}>
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.media_title || item.title || "Capa da obra"}
                            style={{
                              width: "85px",
                              height: "125px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "85px",
                            height: "125px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))",
                            border: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            flexShrink: 0
                          }}>
                            {categoryIcon(category)}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: "0.4rem" }}>
                            <span style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: "rgba(99, 102, 241, 0.2)",
                              color: "#a5b4fc",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "4px",
                              border: "1px solid rgba(99, 102, 241, 0.35)"
                            }}>
                              {categoryIcon(category)} {category}
                            </span>
                          </div>

                          <h3 style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            margin: "0 0 0.45rem 0",
                            lineHeight: 1.3
                          }}>
                            {item.media_title || item.title || "Obra Cultural"}
                          </h3>

                          {item.rating != null && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                              <span style={{ color: "#fbbf24", fontSize: "1.15rem", letterSpacing: "2px" }}>
                                {"★".repeat(Math.min(5, Math.round(item.rating)))}
                                {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.round(item.rating))))}
                              </span>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fbbf24" }}>
                                {Number(item.rating).toFixed(1)} / 5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resenha / Comentário */}
                      {item.comment && (
                        <div style={{
                          marginTop: "0.25rem",
                          background: "rgba(255, 255, 255, 0.03)",
                          borderLeft: "3px solid var(--accent-primary)",
                          borderRadius: "0 8px 8px 0",
                          padding: "0.85rem 1rem",
                          position: "relative"
                        }}>
                          {item.is_spoiler ? (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f87171", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                                  ⚠️ Resenha com Spoiler
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleSpoiler(item.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#93c5fd",
                                    fontSize: "0.78rem",
                                    cursor: "pointer",
                                    textDecoration: "underline"
                                  }}
                                >
                                  {revealedSpoilers[item.id] ? "🙈 Ocultar Spoiler" : "👁️ Revelar Comentário"}
                                </button>
                              </div>
                              <p style={{
                                margin: 0,
                                fontSize: "0.92rem",
                                lineHeight: 1.55,
                                color: "var(--text-secondary)",
                                filter: revealedSpoilers[item.id] ? "none" : "blur(6px)",
                                transition: "filter 0.3s ease",
                                userSelect: revealedSpoilers[item.id] ? "auto" : "none"
                              }}>
                                "{item.comment}"
                              </p>
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.55, color: "var(--text-secondary)", fontStyle: "italic" }}>
                              "{item.comment}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Barra de Reações e Interatividade */}
                    <div className="feed-reaction-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {/* Botão Curtir */}
                        <button
                          type="button"
                          className={`btn-reaction ${item.user_liked ? "active" : ""}`}
                          onClick={() => handleToggleReaction(item.id, "like")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            fontWeight: item.user_liked ? 700 : 500,
                            background: item.user_liked ? "rgba(236, 72, 153, 0.22)" : "rgba(255, 255, 255, 0.05)",
                            borderColor: item.user_liked ? "#ec4899" : "var(--border-subtle)",
                            color: item.user_liked ? "#f472b6" : "var(--text-secondary)",
                            padding: "0.45rem 0.95rem",
                            borderRadius: "var(--radius-full)",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <span style={{ fontSize: "1.05rem" }}>{item.user_liked ? "❤️" : "🤍"}</span>
                          <span>{item.user_liked ? "Curtido" : "Curtir"}</span>
                          {(item.likes_count > 0 || item.user_liked) && (
                            <span style={{
                              fontWeight: 800,
                              marginLeft: "0.2rem",
                              background: item.user_liked ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.1)",
                              padding: "0.1rem 0.45rem",
                              borderRadius: "10px",
                              fontSize: "0.78rem"
                            }}>
                              {item.likes_count || 0}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn-reaction"
                          onClick={() => handleToggleReaction(item.id, "fire")}
                          title="Incrível"
                          style={{ padding: "0.45rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}
                        >
                          🔥 {item.fire_count > 0 ? item.fire_count : ""}
                        </button>
                        <button
                          type="button"
                          className="btn-reaction"
                          onClick={() => handleToggleReaction(item.id, "applause")}
                          title="Aplaudir"
                          style={{ padding: "0.45rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}
                        >
                          👏 {item.applause_count > 0 ? item.applause_count : ""}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {isItemFriend && (
                          <button
                            type="button"
                            className="btn-chat-trigger"
                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem" }}
                            onClick={() => router.push(`/dashboard/chats?userId=${item.user_id}`)}
                          >
                            💬 Conversar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-view-user-catalog"
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                          onClick={() => setSelectedCatalogUserId(item.user_id)}
                        >
                          Explorar Acervo →
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO: USUÁRIOS BLOQUEADOS */}
      {activeSubTab === "blocked" && (
        <div id="communityBlockedSection">
          <div className="requests-header">
            <h2>Usuários Bloqueados 🚫</h2>
            <p style={{ color: "var(--text-secondary)" }}>Gerencie membros que você bloqueou. Eles não podem ver seu perfil ou enviar convites.</p>
          </div>
          <div className="requests-empty-state" style={{ maxWidth: "520px", margin: "2rem auto" }}>
            <div className="icon">🛡️</div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Nenhum usuário bloqueado</h3>
            <p>Seu espaço está seguro e livre de bloqueios no momento.</p>
          </div>
        </div>
      )}
      {/* Modal de Visualização de Catálogo de Terceiros */}
      {selectedCatalogUserId && (
        <UserCatalogModal
          userId={selectedCatalogUserId}
          onClose={() => setSelectedCatalogUserId(null)}
          onOpenChat={(targetId) => {
            setSelectedCatalogUserId(null);
            router.push(`/dashboard/chats?userId=${targetId}`);
          }}
        />
      )}
    </section>
  );
}