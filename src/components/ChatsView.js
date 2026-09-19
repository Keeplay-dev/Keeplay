"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import UserCatalogModal from "./UserCatalogModal";

const QUICK_REACTIONS = ["🍿", "🎬", "🎮", "📚", "⭐", "🔥", "❤️", "😱"];

export default function ChatsView() {
  const searchParams = useSearchParams();
  const paramUserId = searchParams ? (searchParams.get("userId") || searchParams.get("friendId")) : null;

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedCatalogUserId, setSelectedCatalogUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // 1. Carrega o utilizador logado e a lista de conversas ativas da API real
  useEffect(() => {
    async function loadData() {
      try {
        let loggedUserId = null;

        // Obter ID do utilizador atual
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const data = await profileRes.json();
          loggedUserId = data.profile?.user_id || data.profile?.id;
          setCurrentUserId(loggedUserId);
        }

        // Buscar as conversas da API real (/api/chats)
        const chatsRes = await fetch("/api/chats");
        let chatList = [];
        if (chatsRes.ok) {
          const data = await chatsRes.json();

          chatList = (data.chats || []).map(chat => {
            const isUnread = chat.last_message_is_read === 0 && chat.sender_id !== loggedUserId;

            return {
              id: chat.other_user_id,
              name: chat.other_user_name,
              username: chat.other_user_username,
              avatar_url: chat.other_user_avatar,
              equipped_title: chat.other_user_title,
              last_message: chat.last_message_text,
              last_message_time: chat.last_message_time,
              unread_count: isUnread ? 1 : 0
            };
          });
        }

        // Se veio um userId na URL, seleciona automaticamente ou busca o contato
        if (paramUserId) {
          let found = chatList.find(c => c.id === paramUserId);
          if (!found) {
            try {
              const uRes = await fetch(`/api/catalog?userId=${paramUserId}`);
              if (uRes.ok) {
                const uData = await uRes.json();
                if (uData.user) {
                  found = {
                    id: uData.user.id,
                    name: uData.user.name,
                    username: uData.user.username,
                    avatar_url: uData.user.avatar_url,
                    equipped_title: uData.user.equipped_title,
                    last_message: null,
                    last_message_time: new Date().toISOString(),
                    unread_count: 0
                  };
                  chatList = [found, ...chatList];
                }
              }
            } catch (e) {
              console.error("Erro ao carregar usuário selecionado:", e);
            }
          }
          if (found) {
            setSelectedFriend(found);
            setShowSidebarMobile(false);
          }
        }

        setFriends(chatList);
      } catch (err) {
        console.error("Erro ao carregar chats:", err);
      } finally {
        setLoadingFriends(false);
      }
    }
    loadData();
  }, [paramUserId]);

  // 2. Busca o histórico de mensagens com um amigo específico
  const fetchMessages = useCallback(async (friendId) => {
    if (!friendId) return;

    // Só mostramos "Carregando" na primeira vez que abre o chat
    setLoadingMessages(prev => messages.length === 0 ? true : false);

    try {
      const res = await fetch(`/api/chats/${friendId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoadingMessages(false);
    }
  }, [messages.length]);

  // 3. Efeito de sincronização em tempo real (Polling a cada 5s)
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
      pollRef.current = setInterval(() => fetchMessages(selectedFriend.id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedFriend, fetchMessages]);

  // Rolar para a última mensagem automaticamente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Enviar nova mensagem
  const sendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputMsg;
    if (!textToSend.trim() || !selectedFriend) return;

    const content = textToSend.trim();
    if (!textOverride) setInputMsg("");

    const friendId = selectedFriend.id;

    // Atualização Otimista: coloca a mensagem na tela antes mesmo da API responder
    const tempMessage = {
      id: "temp-" + Date.now(),
      sender_id: currentUserId,
      message_text: content,
      created_at: new Date().toISOString(),
      is_read: 0,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      await fetch(`/api/chats/${friendId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: content }),
      });
      // Ao enviar, atualiza também a prévia na sidebar localmente
      setFriends(prev => prev.map(f =>
        f.id === friendId
          ? { ...f, last_message: content, last_message_time: new Date().toISOString() }
          : f
      ));
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // 5. Excluir o histórico de conversa com o amigo
  const handleDeleteChat = async (friend) => {
    if (!friend || !friend.id) return;
    if (!confirm(`Tem certeza de que deseja excluir o histórico de conversa com ${friend.name}?`)) return;

    try {
      await fetch(`/api/chats/${friend.id}`, { method: "DELETE" });

      // Limpa a tela localmente
      if (selectedFriend && selectedFriend.id === friend.id) {
        setMessages([]);
        setSelectedFriend(null);
        setShowSidebarMobile(true);
      }
      setFriends(prev => prev.filter(f => f.id !== friend.id));
    } catch (err) {
      console.error("Erro ao excluir chat:", err);
    }
  };

  const filteredFriends = friends.filter(f =>
    !searchQuery || f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <section id="chatsView" className="chats-section fade-in" style={{ display: "block" }}>
      <div className={`chats-layout-wrapper ${!showSidebarMobile ? 'mobile-chat-open' : ''}`}>

        {/* SIDEBAR DE AMIGOS */}
        <aside className="chats-sidebar">
          <div className="chats-sidebar-header">
            <div className="chats-sidebar-title-row">
              <div className="chats-header-title">
                <span className="chats-icon-badge">💬</span>
                <h3>Mensagens Diretas</h3>
              </div>
              <span className="chats-friends-count-pill">{friends.length} conversas</span>
            </div>
            <p className="desc-muted" style={{ fontSize: "0.78rem", marginTop: "0.35rem" }}>
              Converse em tempo real com quem você tem amizade conectada.
            </p>

            <div className="chats-search-box">
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Buscar conversas..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="chats-friends-list">
            {loadingFriends ? (
              <div className="chats-empty-friends">Carregando conversas...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="chats-empty-friends">
                <div className="chats-empty-friends-icon">👥</div>
                <h4>Nenhuma conversa encontrada</h4>
                <p>O seu chat está silencioso. Visite um perfil na aba Comunidade e clique em 'Chat' para iniciar.</p>
              </div>
            ) : (
              filteredFriends.map((f, index) => {
                // A chave e comparação agora usam f.id limpo gerado no mapeamento do Fetch
                const uniqueId = f.id || `friend-${index}`;
                const isSelected = selectedFriend && selectedFriend.id === uniqueId;

                return (
                  <div key={uniqueId}
                    className={`chat-friend-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedFriend(f);
                      setShowSidebarMobile(false);
                    }}>

                    <div className="chat-avatar-container">
                      <div className="chat-friend-avatar">
                        {f.avatar_url ? <img src={f.avatar_url} alt="" /> : f.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="chat-online-dot"></span>
                    </div>

                    <div className="chat-friend-details">
                      <div className="chat-friend-top-row">
                        <span className="chat-friend-name">{f.name}</span>
                        <span className="chat-friend-time">{formatTime(f.last_message_time || new Date())}</span>
                      </div>
                      <div className="chat-friend-sub-row">
                        <span className="chat-last-snippet">{f.last_message || "Inicie uma conversa..."}</span>
                        {f.unread_count > 0 && <span className="chat-unread-badge">{f.unread_count}</span>}
                      </div>
                    </div>

                    <button className="btn-chat-item-delete" onClick={(e) => { e.stopPropagation(); handleDeleteChat(f); }} title="Excluir Histórico">✕</button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ÁREA DE CONVERSA */}
        <div className="chat-conversation-area">

          {!selectedFriend ? (
            /* PLACEHOLDER QUANDO NÃO HÁ CHAT SELECIONADO */
            <div className="chat-empty-placeholder">
              <div className="chat-placeholder-visual">
                <div className="chat-placeholder-icon">💬</div>
                <div className="chat-placeholder-glow"></div>
              </div>
              <h3>Suas Conversas Culturais</h3>
              <p>Selecione um amigo na lista ao lado para trocar impressões, debater finais de séries, resenhar filmes e comparar conquistas!</p>

              {friends.length > 0 ? (
                <div style={{ marginTop: "1.5rem", width: "100%", maxWidth: "560px" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", fontWeight: "600" }}>
                    Escolha um amigo para conversar agora:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.65rem" }}>
                    {friends.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFriend(f);
                          setShowSidebarMobile(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.65rem 0.85rem",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))",
                          borderRadius: "var(--radius-md, 12px)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: "bold", overflow: "hidden", flexShrink: 0
                        }}>
                          {f.avatar_url ? <img src={f.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : f.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {f.name}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            @{f.username || "usuario"}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--accent-primary, #818cf8)", fontWeight: "600" }}>💬 Abrir</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chat-placeholder-tips">
                  <div className="chat-tip-pill">✨ Exclusivo para amigos confirmados</div>
                  <div className="chat-tip-pill">🍿 Compartilhe recomendações</div>
                  <div className="chat-tip-pill">⚡ Respostas em tempo real</div>
                </div>
              )}
            </div>
          ) : (
            /* CHAT ATIVO */
            <div className="active-chat-container">

              {/* Cabeçalho do Chat */}
              <div className="active-chat-header">
                <div className="active-chat-user-info">
                  <button type="button" className="btn-chat-mobile-back" title="Voltar para a lista" onClick={() => setShowSidebarMobile(true)}>
                    ←
                  </button>
                  <div className="chat-header-avatar-wrap">
                    <div className="active-chat-avatar">
                      {selectedFriend.avatar_url ? <img src={selectedFriend.avatar_url} alt="" /> : selectedFriend.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="chat-status-indicator online"></span>
                  </div>
                  <div>
                    <div className="chat-header-name-row">
                      <h3>{selectedFriend.name}</h3>
                      <span className="chat-header-username">@{selectedFriend.username || "usuario"}</span>
                    </div>
                    <div className="chat-header-meta">
                      {selectedFriend.equipped_title && (
                        <span className="equipped-title-badge chat-title-mini">🎖️ {selectedFriend.equipped_title}</span>
                      )}
                      <span className="chat-affinity-pill">✨ Conexão Cultural</span>
                    </div>
                  </div>
                </div>

                <div className="active-chat-actions" style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-icon-text chat-btn-profile"
                    title="Ver catálogo"
                    onClick={() => setSelectedCatalogUserId(selectedFriend.id)}
                  >
                    <span>📚</span> <span className="hide-on-mobile">Ver Catálogo</span>
                  </button>
                  <button type="button" className="chat-btn-delete" title="Excluir histórico" onClick={() => handleDeleteChat(selectedFriend)}>
                    <span>🗑️</span> <span className="hide-on-mobile">Excluir</span>
                  </button>
                </div>
              </div>

              {/* Feed de Mensagens */}
              <div className="chat-messages-stream" aria-live="polite">
                {loadingMessages && messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Carregando histórico...</div>
                ) : messages.length === 0 ? (
                  <div className="chat-date-separator">Início da Conversa</div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.sender_id === currentUserId;
                    const msgUniqueId = msg.id || `msg-${index}`;

                    return (
                      <div key={msgUniqueId} className={`chat-message-row ${isMine ? "mine" : "theirs"}`}>
                        {!isMine && (
                          <div className="chat-msg-avatar">
                            {selectedFriend.avatar_url ? <img src={selectedFriend.avatar_url} alt="" /> : selectedFriend.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="chat-msg-content-wrapper">
                          <div className="chat-message-bubble">
                            <span className="chat-bubble-text">{msg.message_text}</span>
                          </div>
                          <div className="chat-message-meta">
                            {formatTime(msg.created_at || new Date().toISOString())}
                            {isMine && <span className="chat-check-read">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reações Rápidas */}
              <div className="chat-quick-reactions-bar">
                <span className="quick-reactions-label">Reações rápidas:</span>
                <div className="quick-reactions-buttons">
                  {QUICK_REACTIONS.map((r, i) => (
                    <button key={`reaction-${i}`} type="button" className="quick-reaction-btn" title="Reação Rápida" onClick={() => sendMessage(null, r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário de Input */}
              <form className="chat-input-form" onSubmit={sendMessage} autoComplete="off">
                <div className="chat-input-wrapper">
                  <input type="text" className="chat-text-input" placeholder="Escreva uma mensagem..."
                    value={inputMsg} onChange={e => setInputMsg(e.target.value)} required />
                  <button type="submit" className="btn-send-message" title="Enviar mensagem" disabled={!inputMsg.trim()}>
                    <span>Enviar</span>
                    <span className="send-icon">➤</span>
                  </button>
                </div>
                <small className="chat-form-tip">Pressione Enter para enviar. Troca de mensagens restrita a amigos conectados.</small>
              </form>

            </div>
          )}
        </div>

      </div>

      {/* Modal de Catálogo do Usuário */}
      {selectedCatalogUserId && (
        <UserCatalogModal
          userId={selectedCatalogUserId}
          onClose={() => setSelectedCatalogUserId(null)}
          onOpenChat={() => setSelectedCatalogUserId(null)}
        />
      )}
    </section>
  );
}