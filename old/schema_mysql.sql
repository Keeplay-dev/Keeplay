-- ============================================================================
-- KEEPLAY v2.0 - SCRIPT DE BANCO DE DADOS RELACIONAL SQL (MYSQL 8.0+ / MARIADB)
-- Compatível com: phpMyAdmin, cPanel, Hostinger, AWS RDS MySQL, PlanetScale
-- Codificação: UTF8MB4 (Suporte total a Emojis) | Idioma: pt-BR
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. USUÁRIOS & CONTAS (Autenticação, Perfil, Gamificação)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_private TINYINT(1) DEFAULT 0,
    equipped_title VARCHAR(100) DEFAULT 'Iniciante Curioso',
    total_xp INT DEFAULT 0,
    accepted_terms_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Títulos honoríficos desbloqueados por cada usuário
CREATE TABLE IF NOT EXISTS user_unlocked_titles (
    user_id VARCHAR(64) NOT NULL,
    title_name VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, title_name),
    CONSTRAINT fk_titles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. REDE SOCIAL: AMIZADES & CONEXÕES (Ciclo Assíncrono)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_connections (
    id VARCHAR(64) PRIMARY KEY,
    requester_id VARCHAR(64) NOT NULL,
    addressee_id VARCHAR(64) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_connection_pair UNIQUE (requester_id, addressee_id),
    CONSTRAINT fk_conn_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. CHATS & MENSAGENS DIRETAS (DMs entre Amigos Confirmados)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    message_text TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ACERVO CULTURAL: ITENS REGISTRADOS (Filmes, Séries, Livros, Jogos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('filme', 'serie', 'livro', 'jogo') NOT NULL,
    status ENUM(
        'assistido', 'quero_assistir', 'revisto',
        'assistindo', 'finalizada', 'em_espera', 'dropada',
        'lendo', 'lido', 'quero_ler', 'abandonado',
        'jogando', 'zerado', 'platinado', 'backlog', 'dropado'
    ) NOT NULL DEFAULT 'assistido',
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_spoiler TINYINT(1) DEFAULT 0,
    cover_image TEXT,
    xp_gained INT DEFAULT 50,
    
    -- Progresso e Contadores
    current_progress INT DEFAULT 0,
    total_progress INT DEFAULT 0,
    season_current INT DEFAULT 1,
    hours_spent DECIMAL(8, 1) DEFAULT 0.0,
    is_rewatch TINYINT(1) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. PROVEDORES & ONDE ASSISTIR / JOGAR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_item_providers (
    media_item_id VARCHAR(64) NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (media_item_id, provider_id),
    CONSTRAINT fk_mip_item FOREIGN KEY (media_item_id) REFERENCES media_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_mip_prov FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. DIÁRIO CRONOLÓGICO DE CONSUMO (Histórico de Sessões)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumption_logs (
    id VARCHAR(64) PRIMARY KEY,
    media_item_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    started_at DATE,
    finished_at DATE,
    notes TEXT,
    is_rewatch TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_item FOREIGN KEY (media_item_id) REFERENCES media_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. LISTAS PERSONALIZADAS DE OBRAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_lists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    visibility ENUM('publica', 'privada') DEFAULT 'publica',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_list_items (
    list_id VARCHAR(64) NOT NULL,
    media_item_id VARCHAR(64) NOT NULL,
    display_order INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, media_item_id),
    CONSTRAINT fk_cli_list FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_cli_item FOREIGN KEY (media_item_id) REFERENCES media_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. GAMIFICAÇÃO: CONQUISTAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(20) NOT NULL,
    is_secret TINYINT(1) DEFAULT 0,
    target_count INT DEFAULT 1,
    reward_xp INT DEFAULT 100,
    granted_title VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id VARCHAR(64) NOT NULL,
    achievement_id VARCHAR(64) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ua_ach FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. GAMIFICAÇÃO: MISSÕES MENSAIS ROTATIVAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_missions (
    id VARCHAR(64) PRIMARY KEY,
    month_year VARCHAR(7) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('filme', 'serie', 'livro', 'jogo'),
    target_count INT NOT NULL,
    reward_xp INT NOT NULL DEFAULT 150,
    icon VARCHAR(20) NOT NULL,
    expires_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_mission_progress (
    user_id VARCHAR(64) NOT NULL,
    mission_id VARCHAR(64) NOT NULL,
    current_count INT DEFAULT 0,
    is_completed TINYINT(1) DEFAULT 0,
    is_claimed TINYINT(1) DEFAULT 0,
    completed_at DATETIME,
    PRIMARY KEY (user_id, mission_id),
    CONSTRAINT fk_ump_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ump_mission FOREIGN KEY (mission_id) REFERENCES monthly_missions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. FEED SOCIAL DE ATIVIDADES & REAÇÕES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_feed (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    media_item_id VARCHAR(64),
    title VARCHAR(255),
    media_title VARCHAR(255),
    cover_image TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_spoiler TINYINT(1) DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feed_media FOREIGN KEY (media_item_id) REFERENCES media_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feed_reactions (
    activity_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    reaction ENUM('like', 'applause', 'fire') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id, user_id, reaction),
    CONSTRAINT fk_fr_activity FOREIGN KEY (activity_id) REFERENCES activity_feed(id) ON DELETE CASCADE,
    CONSTRAINT fk_fr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. SEGURANÇA, MODERAÇÃO & PRIVACIDADE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blocks (
    id VARCHAR(64) PRIMARY KEY,
    blocker_id VARCHAR(64) NOT NULL,
    blocked_id VARCHAR(64) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_block_pair UNIQUE (blocker_id, blocked_id),
    CONSTRAINT fk_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blocks_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_reports (
    id VARCHAR(64) PRIMARY KEY,
    reporter_id VARCHAR(64) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    author_id VARCHAR(64),
    reason ENUM('spoiler_unmarked', 'offensive', 'spam', 'other') NOT NULL,
    details TEXT,
    content_snippet TEXT,
    status ENUM('pending', 'reviewed', 'dismissed', 'action_taken') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. ÍNDICES DE PERFORMANCE (MYSQL)
-- ============================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_connections_requester ON user_connections(requester_id, status);
CREATE INDEX idx_connections_addressee ON user_connections(addressee_id, status);
CREATE INDEX idx_chat_convo ON chat_messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_chat_unread ON chat_messages(receiver_id, is_read);
CREATE INDEX idx_media_user_cat ON media_items(user_id, category);
CREATE INDEX idx_media_user_stat ON media_items(user_id, status);
CREATE INDEX idx_consumption_dates ON consumption_logs(user_id, finished_at);
CREATE INDEX idx_feed_timeline ON activity_feed(created_at);
CREATE INDEX idx_reports_status ON content_reports(status);

-- ============================================================================
-- 13. VIEWS ANALÍTICAS
-- ============================================================================

CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id AS user_id,
    u.name,
    u.username,
    u.total_xp,
    u.equipped_title,
    COUNT(DISTINCT m.id) AS total_media_items,
    COUNT(DISTINCT CASE WHEN m.category = 'filme' THEN m.id END) AS total_movies,
    COUNT(DISTINCT CASE WHEN m.category = 'serie' THEN m.id END) AS total_series,
    COUNT(DISTINCT CASE WHEN m.category = 'livro' THEN m.id END) AS total_books,
    COUNT(DISTINCT CASE WHEN m.category = 'jogo' THEN m.id END) AS total_games,
    COALESCE(SUM(m.hours_spent), 0) AS total_hours_invested,
    COUNT(DISTINCT ua.achievement_id) AS total_achievements_unlocked,
    COUNT(DISTINCT c.id) AS total_friends
FROM users u
LEFT JOIN media_items m ON m.user_id = u.id
LEFT JOIN user_achievements ua ON ua.user_id = u.id
LEFT JOIN user_connections c ON (c.requester_id = u.id OR c.addressee_id = u.id) AND c.status = 'accepted'
GROUP BY u.id, u.name, u.username, u.total_xp, u.equipped_title;

CREATE OR REPLACE VIEW v_chat_conversations AS
WITH ranked_messages AS (
    SELECT 
        m.*,
        ROW_NUMBER() OVER (
            PARTITION BY 
                LEAST(m.sender_id, m.receiver_id), 
                GREATEST(m.sender_id, m.receiver_id)
            ORDER BY m.created_at DESC
        ) AS rn
    FROM chat_messages m
)
SELECT 
    rm.id AS last_message_id,
    rm.sender_id,
    rm.receiver_id,
    rm.message_text AS last_message_text,
    rm.is_read AS last_message_is_read,
    rm.created_at AS last_message_time,
    u_sender.name AS sender_name,
    u_receiver.name AS receiver_name
FROM ranked_messages rm
JOIN users u_sender ON u_sender.id = rm.sender_id
JOIN users u_receiver ON u_receiver.id = rm.receiver_id
WHERE rm.rn = 1;

-- ============================================================================
-- 14. CARGA INICIAL DE DADOS (SEEDS MYSQL)
-- ============================================================================

INSERT IGNORE INTO providers (id, name, category, icon_name) VALUES
('netflix', 'Netflix', 'streaming', '🔴'),
('prime', 'Prime Video', 'streaming', '🔷'),
('max', 'Max / HBO', 'streaming', '🟣'),
('disney', 'Disney+', 'streaming', '🏰'),
('apple', 'Apple TV+', 'streaming', '🍏'),
('steam', 'Steam', 'store', '💨'),
('ps', 'PlayStation', 'hardware', '🎮'),
('xbox', 'Xbox', 'hardware', '🟢'),
('switch', 'Nintendo Switch', 'hardware', '🔴'),
('kindle', 'Kindle', 'leitura', '📖'),
('livro', 'Livro Físico', 'leitura', '📚'),
('cinema', 'Cinema', 'streaming', '🍿');

INSERT IGNORE INTO achievements (id, name, category, description, icon, is_secret, target_count, reward_xp, granted_title) VALUES
('filme_10', 'Cinéfilo Iniciante', 'filme', 'Cadastre 10 filmes no seu catálogo.', '🎬', 0, 10, 100, 'Cinéfilo Iniciante'),
('filme_30', 'Cinéfilo Assíduo', 'filme', 'Cadastre 30 filmes no seu catálogo.', '🎥', 0, 30, 150, 'Cinéfilo Assíduo'),
('serie_10', 'Maratonista Iniciante', 'serie', 'Cadastre 10 séries no seu catálogo.', '🍿', 0, 10, 100, 'Maratonista Iniciante'),
('serie_30', 'Maratonista Noturno', 'serie', 'Cadastre 30 séries no seu catálogo.', '📺', 0, 30, 150, 'Maratonista Noturno'),
('livro_10', 'Leitor Iniciante', 'livro', 'Cadastre 10 livros no seu catálogo.', '📚', 0, 10, 100, 'Leitor Iniciante'),
('livro_30', 'Devorador de Páginas', 'livro', 'Cadastre 30 livros no seu catálogo.', '📖', 0, 30, 150, 'Devorador de Páginas'),
('jogo_10', 'Gamer Casual', 'jogo', 'Cadastre 10 jogos no seu catálogo.', '🎮', 0, 10, 100, 'Gamer Casual'),
('jogo_100', 'Zerador Profissional', 'jogo', 'Cadastre 100 jogos no seu catálogo.', '🏆', 0, 100, 300, 'Zerador Profissional'),
('special_first', 'Primeiro Registro', 'especial', 'Adicione sua primeira obra ao acervo.', '✨', 0, 1, 50, 'Iniciante Curioso'),
('secret_platina', 'Caçador de Troféus', 'secreta', 'Platine um jogo épico (100% de progresso alcançado).', '🏆', 1, 1, 200, 'Mestre dos Troféus');

INSERT IGNORE INTO monthly_missions (id, month_year, title, description, category, target_count, reward_xp, icon, expires_at) VALUES
('m_filme_2', '2026-09', 'Sessão Dupla', 'Cadastre ou assista a 2 filmes neste mês.', 'filme', 2, 150, '🎬', '2026-09-30 23:59:59'),
('m_jogo_4star', '2026-09', 'Gamer Determinado', 'Avalie ou finalize 2 jogos com 4 ou 5 estrelas.', 'jogo', 2, 180, '🎮', '2026-09-30 23:59:59'),
('m_critica_detalhe', '2026-09', 'Crítico Detalhista', 'Escreva 1 resenha aprofundada com mais de 50 caracteres.', NULL, 1, 120, '✍️', '2026-09-30 23:59:59'),
('m_livro_1', '2026-09', 'Páginas em Foco', 'Registre ou conclua 1 livro no seu acervo.', 'livro', 1, 140, '📚', '2026-09-30 23:59:59');

INSERT IGNORE INTO users (id, name, username, email, password_hash, avatar_url, bio, is_private, equipped_title, total_xp) VALUES
('usr_rafael', 'Rafael', 'rafael', 'rafael@gmail.com', '1234', '', 'Entusiasta de séries, ficção científica, livros envolventes e games épicos.', 0, 'Iniciante Curioso', 390),
('usr_mariacine', 'Maria Eduarda', 'mariacine', 'maria@cinema.com', '1234', '', 'Cinéfila apaixonada por cinema noir, ficção científica clássica e direção de arte.', 0, 'Cinéfilo Assíduo', 420),
('usr_lucasgames', 'Lucas Gamer', 'lucasgames', 'lucas@games.com', '1234', '', 'Zerando e platinando todos os RPGs de mundo aberto e soulslikes possíveis.', 0, 'Zerador Profissional', 550),
('usr_carolbooks', 'Carol Mendes', 'carolbooks', 'carol@livros.com', '1234', '', 'Devoradora de literatura fantástica, distopias e ficção especulativa.', 0, 'Devorador de Páginas', 480);

INSERT IGNORE INTO user_unlocked_titles (user_id, title_name) VALUES
('usr_rafael', 'Iniciante Curioso'),
('usr_mariacine', 'Iniciante Curioso'),
('usr_mariacine', 'Cinéfilo Assíduo'),
('usr_lucasgames', 'Iniciante Curioso'),
('usr_lucasgames', 'Gamer Casual'),
('usr_lucasgames', 'Zerador Profissional'),
('usr_carolbooks', 'Iniciante Curioso'),
('usr_carolbooks', 'Leitor Iniciante'),
('usr_carolbooks', 'Devorador de Páginas');

INSERT IGNORE INTO user_connections (id, requester_id, addressee_id, status, created_at, updated_at) VALUES
('conn_1', 'usr_rafael', 'usr_mariacine', 'accepted', '2026-09-10 14:00:00', '2026-09-10 14:05:00'),
('conn_2', 'usr_lucasgames', 'usr_rafael', 'pending', '2026-09-14 18:30:00', '2026-09-14 18:30:00');

INSERT IGNORE INTO chat_messages (id, sender_id, receiver_id, message_text, is_read, created_at) VALUES
('msg_init_1', 'usr_mariacine', 'usr_rafael', 'Oi Rafael! Vi que você favoritou Interestelar e Duna no seu acervo cultural, muito bom gosto! 🎬🍿', 1, '2026-09-15 18:50:00'),
('msg_init_2', 'usr_rafael', 'usr_mariacine', 'Oi Maria! Muito obrigado! Duna e Interestelar são fantásticos. Vi que você assistiu Blade Runner 2049 e Severance também, a fotografia de Blade Runner é de outro mundo!', 1, '2026-09-15 20:51:00'),
('msg_init_3', 'usr_mariacine', 'usr_rafael', 'Com certeza! Roger Deakins é um gênio da iluminação. E o final da 1ª temporada de Severance é de cair o queixo! Quando puder, assista aos episódios finais! 🔥', 0, '2026-09-15 22:20:00');

INSERT IGNORE INTO media_items (id, user_id, title, category, status, rating, comment, is_spoiler, cover_image, xp_gained, current_progress, total_progress, season_current, hours_spent, is_rewatch) VALUES
('demo_1', 'usr_rafael', 'Interestelar', 'filme', 'assistido', 5, 'Uma obra-prima da ficção científica. A trilha de Hans Zimmer e o conceito de dilatação temporal são inesquecíveis.', 0, 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80', 120, 1, 1, 1, 2.8, 1),
('demo_2', 'usr_rafael', 'The Witcher 3: Wild Hunt', 'jogo', 'platinado', 5, 'Narrativa impecável, combate envolvente e uma das melhores construções de mundo aberto já feitas. 100% de conquistas!', 0, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80', 160, 100, 100, 1, 145.0, 0),
('demo_3', 'usr_rafael', 'Duna', 'livro', 'lido', 4, 'Mundo riquíssimo em intrigas políticas, ecologia e religião. Leitura obrigatória para fãs de sci-fi.', 0, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80', 110, 680, 680, 1, 18.0, 0),

('m_item_1', 'usr_mariacine', 'Blade Runner 2049', 'filme', 'assistido', 5, 'Direção de arte estonteante. Uma continuação que honra e expande o clássico original.', 0, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 120, 1, 1, 1, 2.7, 0),
('m_item_2', 'usr_mariacine', 'Ruptura (Severance)', 'serie', 'finalizada', 5, 'Tensão psicológica no ambiente corporativo levada ao nível máximo. Final impecável.', 0, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80', 140, 9, 9, 1, 8.5, 0),

('g_1', 'usr_lucasgames', 'Elden Ring', 'jogo', 'platinado', 5, 'Um dos maiores mundos abertos já criados. Desafio e liberdade absolutos.', 0, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80', 160, 100, 100, 1, 160.0, 0),
('g_2', 'usr_lucasgames', 'Cyberpunk 2077', 'jogo', 'zerado', 4, 'Night City é vibrante e a história de V e Johnny Silverhand é marcante.', 0, '', 110, 80, 100, 1, 65.0, 0),

('b_1', 'usr_carolbooks', 'O Nome do Vento', 'livro', 'lido', 5, 'Prosa lírica impressionante. Kvothe é um dos protagonistas mais cativantes da fantasia.', 0, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 120, 656, 656, 1, 22.0, 0),
('b_2', 'usr_carolbooks', '1984', 'livro', 'lido', 5, 'Leitura essencial e assustadoramente atual sobre vigilância e controle.', 0, '', 120, 328, 328, 1, 10.0, 0);

INSERT IGNORE INTO media_item_providers (media_item_id, provider_id) VALUES
('demo_1', 'max'),
('demo_1', 'prime'),
('demo_2', 'steam'),
('demo_2', 'ps'),
('demo_3', 'kindle'),
('demo_3', 'livro'),
('m_item_1', 'netflix'),
('m_item_2', 'apple'),
('g_1', 'steam'),
('g_1', 'ps'),
('g_2', 'steam'),
('b_1', 'livro'),
('b_2', 'kindle');

INSERT IGNORE INTO consumption_logs (id, media_item_id, user_id, started_at, finished_at, notes, is_rewatch) VALUES
('log_1', 'demo_1', 'usr_rafael', '2026-09-08', '2026-09-10', 'Primeira vez no cinema e re-assistido em casa.', 1),
('log_2', 'demo_2', 'usr_rafael', '2026-07-01', '2026-09-12', 'Campanha principal + Hearts of Stone + Blood and Wine.', 0),
('log_3', 'demo_3', 'usr_rafael', '2026-08-15', '2026-09-13', 'Edição de luxo da Aleph.', 0),
('log_4', 'g_1', 'usr_lucasgames', '2026-08-01', '2026-09-05', 'Platinado com build de fé.', 0),
('log_5', 'b_1', 'usr_carolbooks', '2026-08-25', '2026-09-02', 'Reler em breve.', 0);

INSERT IGNORE INTO custom_lists (id, user_id, title, description, visibility) VALUES
('list_1', 'usr_rafael', 'Obras-Primas da Ficção Científica', 'Narrativas que exploram conceitos temporais, espaciais e filosóficos inesquecíveis.', 'publica'),
('list_m1', 'usr_mariacine', 'Cyberpunk & Distopias Visuais', 'Filmes e séries com estética marcante, neon e distopias de alto nível.', 'publica'),
('list_l1', 'usr_lucasgames', 'Soulslikes da Minha Vida', 'Os maiores desafios superados nos videogames.', 'publica'),
('list_c1', 'usr_carolbooks', 'Distopias Clássicas e Modernas', 'Livros para refletir sobre sociedade, tecnologia e política.', 'publica');

INSERT IGNORE INTO custom_list_items (list_id, media_item_id, display_order) VALUES
('list_1', 'demo_1', 1),
('list_1', 'demo_3', 2),
('list_m1', 'm_item_1', 1),
('list_m1', 'm_item_2', 2),
('list_l1', 'g_1', 1),
('list_c1', 'b_2', 1);

INSERT IGNORE INTO activity_feed (id, user_id, activity_type, media_item_id, title, media_title, cover_image, rating, comment, is_spoiler, created_at) VALUES
('act_1', 'usr_mariacine', 'review', 'm_item_1', 'avaliou um filme', 'Blade Runner 2049', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 5, 'Fotografia magistral de Roger Deakins e atmosfera cyberpunk incomparável.', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('act_2', 'usr_lucasgames', 'platina', 'g_1', 'platinou um jogo', 'Elden Ring', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80', 5, '160 horas de exploração pura nas Terras Intermédias. 100% dos troféus conquistados!', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('act_3', 'usr_carolbooks', 'list', 'b_2', 'criou uma lista temática', 'Distopias Clássicas e Modernas', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 5, 'Uma curadoria especial para quem ama reflexões sobre o futuro e poder.', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('act_4', 'usr_mariacine', 'review', 'demo_1', 'analisou uma obra marcante com spoiler', 'Interestelar', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', 5, 'A revelação do tesserato na 5ª dimensão permitindo que Cooper envie dados quânticos pelo ponteiro de segundos do relógio da Murphy é extraordinária.', 1, DATE_SUB(NOW(), INTERVAL 4 HOUR));

INSERT IGNORE INTO feed_reactions (activity_id, user_id, reaction) VALUES
('act_1', 'usr_rafael', 'like'),
('act_1', 'usr_lucasgames', 'fire'),
('act_2', 'usr_rafael', 'fire'),
('act_2', 'usr_mariacine', 'applause'),
('act_3', 'usr_rafael', 'like'),
('act_4', 'usr_rafael', 'fire');

SET FOREIGN_KEY_CHECKS = 1;

-- FIM DO SCRIPT MYSQL
