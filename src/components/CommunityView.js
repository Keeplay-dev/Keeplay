"use client";

import { useState, useEffect } from "react";

export default function CommunityView() {
  const [activeSubTab, setActiveSubTab] = useState("members");

  // Estados para armazenar os dados reais da API
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);

  // Carrega os dados reais do DB (Feed, Amigos, Requests e Usuários)
  useEffect(() => {
    async function fetchData() {
      try {
        const [communityRes, usersRes] = await Promise.all([
          fetch("/api/community"),
          fetch("/api/community/users")
        ]);

        if (communityRes.ok) {
          const data = await communityRes.json();
          setFeed(data.feed || []);
          setFriends(data.friends || []);
          setRequests(data.requests || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }
      } catch (err) {
        console.error("Erro ao carregar comunidade:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      } else {
        alert("Erro ao enviar solicitação.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevel = (xp) => Math.floor((xp || 0) / 500) + 1;

  const activityLabel = (type) => {
    const map = {
      registrou: "registrou",
      avaliou: "avaliou",
      zerou: "zerou",
      platinou: "platinou",
      achievement_unlocked: "desbloqueou a conquista",
      abandonou: "abandonou",
      comecou: "começou a consumir"
    };
    return map[type] || type || "interagiu com";
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
                const isFriend = friends.some(f => f.id === u.id);
                const isPending = sentRequests.includes(u.id);
                // Mock visual para afinidade gerado de forma baseada no ID para variar
                const affinityScore = 50 + ((u.id * 13) % 45);
                const affinityLabel = affinityScore > 80 ? "Alma Gêmea Cultural" : affinityScore > 65 ? "Alta Afinidade" : "Conexão em Potencial";

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
                          ⭐ {u.equipped_title || "Iniciante Curioso"}
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
                          <button className="btn-friend is-friend" disabled style={{ width: "100%" }}>✓ Amigos</button>
                        ) : isPending ? (
                          <button className="btn-friend is-pending" disabled style={{ width: "100%" }}>⏳ Solicitação enviada</button>
                        ) : (
                          <button className="btn-friend not-friend" onClick={() => handleSendRequest(u.id)} style={{ width: "100%" }}>+ Adicionar</button>
                        )}
                      </div>
                      <button className="btn-chat-trigger" title="Enviar Mensagem" style={{ flexShrink: 0, padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}>💬 Chat</button>
                      <button className="btn-view-user-catalog" title="Ver catálogo do usuário" style={{ flexShrink: 0, padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}>📚 Ver Catálogo</button>
                      <button className="btn-block-action" title="Bloquear usuário" style={{ flexShrink: 0, width: "34px", height: "34px", padding: 0, justifyContent: "center" }}>🚫</button>
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
                    <div key={f.id} className="request-item-card" style={{ flexDirection: "row", alignItems: "center" }}>
                      <div className="request-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                        {f.avatar_url ? <img src={f.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : f.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="request-user-details" style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "0.9rem", margin: 0 }}>{f.name}</h4>
                        <div className="request-user-username" style={{ fontSize: "0.75rem" }}>@{f.username}</div>
                      </div>
                      {f.equipped_title && <span className="equipped-title-badge" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", margin: 0 }}>⭐ {f.equipped_title}</span>}
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
          <div className="feed-header" style={{ marginBottom: "2rem" }}>
            <h2>Feed de Atividades dos Amigos ⚡</h2>
            <p style={{ color: "var(--text-secondary)" }}>Acompanhe em tempo real o que seus amigos conectados estão assistindo, jogando e lendo.</p>
          </div>

          <div className="activity-feed-timeline">
            {loading ? (
              <p className="empty-state">Carregando feed real...</p>
            ) : feed.length === 0 ? (
              <div className="requests-empty-state" style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem 1rem" }}>
                <span style={{ fontSize: "2.5rem" }}>⚡</span>
                <h4 style={{ margin: "1rem 0 0.5rem 0", color: "var(--text-primary)" }}>Seu feed está silencioso</h4>
                <p>Adicione amigos para ver as atividades culturais deles aqui!</p>
              </div>
            ) : (
              feed.map((item, index) => (
                <div key={item.id || index} className="feed-card">
                  <div className="feed-top-row">
                    <div className="feed-avatar">
                      {item.avatar_url ? <img src={item.avatar_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : item.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="feed-user-meta">
                      <h4>{item.user_name}</h4>
                      <span className="feed-time">@{item.user_username || "usuario"} • {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <div className="feed-content-box" style={{ flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.9rem" }}>
                      <strong>{item.user_name}</strong> {activityLabel(item.activity_type)}{" "}
                      <span style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>{item.item_title}</span>
                    </div>
                    {item.item_rating && (
                      <div className="star-rating-display" style={{ margin: 0 }}>
                        <span className="star-filled">{"★".repeat(Math.round(item.item_rating))}</span>
                      </div>
                    )}
                  </div>

                  <div className="feed-reaction-bar">
                    <button className="btn-reaction" title="Filme Épico">🎬</button>
                    <button className="btn-reaction" title="Obra-prima 5 Estrelas">⭐</button>
                    <button className="btn-reaction" title="Incrível!">🔥</button>
                  </div>
                </div>
              ))
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
    </section>
  );
}