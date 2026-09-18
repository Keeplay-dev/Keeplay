/**
 * Keeplay v2.0 - Lógica Principal da Aplicação
 * Gerenciamento de Usuários, Sessão, Cadastro, Gamificação (Níveis, Missões Mensais, Conquistas Secretas, Títulos),
 * Comunidade (Listas Personalizadas, Feed de Amigos com Reações, Medidor de Afinidade Cultural),
 * Consumo Específico (Status por Mídia, Contadores, Diário de Datas),
 * Dashboard de Estatísticas & Retrospectiva Wrapped,
 * Provedores (Onde Assistir/Jogar) e Importação/Exportação CSV e JSON.
 * Idioma: Português do Brasil (pt-BR)
 */

// ==========================================================================
// Base de Usuários Inicial (Demonstração Multi-Usuário Comunitária v2.0)
// ==========================================================================

const INITIAL_USERS = [
  {
    id: 'usr_rafael',
    name: 'Rafael',
    username: 'rafael',
    email: 'rafael@gmail.com',
    password: '1234',
    avatar: '',
    bio: 'Entusiasta de séries, ficção científica, livros envolventes e games épicos.',
    isPrivate: false,
    equippedTitle: 'Iniciante Curioso',
    unlockedTitles: ['Iniciante Curioso'],
    friends: ['usr_mariacine'],
    unlockedAchievements: [],
    customLists: [
      {
        id: 'list_1',
        title: 'Obras-Primas da Ficção Científica',
        description: 'Narrativas que exploram conceitos temporais, espaciais e filosóficos inesquecíveis.',
        isPublic: true,
        itemIds: ['demo_1', 'demo_3'],
        createdAt: '10/09/2026'
      }
    ],
    items: [
      {
        id: 'demo_1',
        title: 'Interestelar',
        category: 'filme',
        status: 'assistido',
        rating: 5,
        comment: 'Uma obra-prima da ficção científica. A trilha de Hans Zimmer e o conceito de dilatação temporal são inesquecíveis.',
        coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
        xpGained: 120,
        progress: { current: 1, total: 1, season: 1, hours: 2.8 },
        providers: ['max', 'prime'],
        consumptionLogs: [{ startedAt: '2026-09-08', finishedAt: '2026-09-10', notes: 'Primeira vez no cinema e re-assistido em casa.', isRewatch: true }],
        createdAt: '10/09/2026'
      },
      {
        id: 'demo_2',
        title: 'The Witcher 3: Wild Hunt',
        category: 'jogo',
        status: 'platinado',
        rating: 5,
        comment: 'Narrativa impecável, combate envolvente e uma das melhores construções de mundo aberto já feitas. 100% de conquistas!',
        coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
        xpGained: 160,
        progress: { current: 100, total: 100, season: 1, hours: 145 },
        providers: ['steam', 'ps'],
        consumptionLogs: [{ startedAt: '2026-07-01', finishedAt: '2026-09-12', notes: 'Campanha principal + Hearts of Stone + Blood and Wine.', isRewatch: false }],
        createdAt: '12/09/2026'
      },
      {
        id: 'demo_3',
        title: 'Duna',
        category: 'livro',
        status: 'lido',
        rating: 4,
        comment: 'Mundo riquíssimo em intrigas políticas, ecologia e religião. Leitura obrigatória para fãs de sci-fi.',
        coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
        xpGained: 110,
        progress: { current: 680, total: 680, season: 1, hours: 18 },
        providers: ['kindle', 'livro'],
        consumptionLogs: [{ startedAt: '2026-08-15', finishedAt: '2026-09-13', notes: 'Edição de luxo da Aleph.', isRewatch: false }],
        createdAt: '13/09/2026'
      }
    ]
  },
  {
    id: 'usr_mariacine',
    name: 'Maria Eduarda',
    username: 'mariacine',
    email: 'maria@cinema.com',
    password: '1234',
    avatar: '',
    bio: 'Cinéfila apaixonada por cinema noir, ficção científica clássica e direção de arte.',
    isPrivate: false,
    equippedTitle: 'Cinéfilo Assíduo',
    unlockedTitles: ['Iniciante Curioso', 'Cinéfilo Assíduo'],
    friends: ['usr_rafael'],
    unlockedAchievements: ['filme_10', 'special_first'],
    customLists: [
      {
        id: 'list_m1',
        title: 'Cyberpunk & Distopias Visuais',
        description: 'Filmes com iluminação de néon e reflexões existenciais.',
        isPublic: true,
        itemIds: ['m_1', 'm_3'],
        createdAt: '08/09/2026'
      }
    ],
    items: [
      {
        id: 'm_1',
        title: 'Blade Runner 2049',
        category: 'filme',
        status: 'assistido',
        rating: 5,
        comment: 'Fotografia magistral de Roger Deakins e atmosfera cyberpunk incomparável.',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        xpGained: 120,
        progress: { current: 1, total: 1, season: 1, hours: 2.7 },
        providers: ['max'],
        consumptionLogs: [{ startedAt: '2026-09-01', finishedAt: '2026-09-01', notes: 'Re-assistido.', isRewatch: true }],
        createdAt: '01/09/2026'
      },
      {
        id: 'm_2',
        title: 'Pulp Fiction',
        category: 'filme',
        status: 'assistido',
        rating: 5,
        comment: 'Diálogos icônicos e narrativa não-linear genial de Quentin Tarantino.',
        coverImage: '',
        xpGained: 120,
        progress: { current: 1, total: 1, season: 1, hours: 2.5 },
        providers: ['netflix'],
        consumptionLogs: [{ startedAt: '2026-09-03', finishedAt: '2026-09-03', notes: '', isRewatch: false }],
        createdAt: '03/09/2026'
      },
      {
        id: 'm_3',
        title: 'Severance (Ruptura)',
        category: 'serie',
        status: 'assistindo',
        rating: 5,
        comment: 'Suspense corporativo perturbador e brilhantemente construído. O final da 1ª temporada quando Helly descobre sua identidade fora da Lumon é estarrecedor!',
        isSpoiler: true,
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        xpGained: 120,
        progress: { current: 7, total: 9, season: 1, hours: 7 },
        providers: ['apple'],
        consumptionLogs: [{ startedAt: '2026-09-05', finishedAt: '2026-09-08', notes: 'Temporada 1 em andamento.', isRewatch: false }],
        createdAt: '08/09/2026'
      }
    ]
  },
  {
    id: 'usr_lucasgames',
    name: 'Lucas Gamer',
    username: 'lucasgames',
    email: 'lucas@games.com',
    password: '1234',
    avatar: '',
    bio: 'Zerando e platinando todos os RPGs de mundo aberto e soulslikes possíveis.',
    isPrivate: false,
    equippedTitle: 'Zerador Profissional',
    unlockedTitles: ['Iniciante Curioso', 'Gamer Casual', 'Zerador Profissional'],
    friends: [],
    unlockedAchievements: ['jogo_10', 'special_first'],
    customLists: [
      {
        id: 'list_l1',
        title: 'Soulslikes da Minha Vida',
        description: 'Os maiores desafios superados nos videogames.',
        isPublic: true,
        itemIds: ['g_1'],
        createdAt: '06/09/2026'
      }
    ],
    items: [
      {
        id: 'g_1',
        title: 'Elden Ring',
        category: 'jogo',
        status: 'platinado',
        rating: 5,
        comment: 'Um dos maiores mundos abertos já criados. Desafio e liberdade absolutos.',
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
        xpGained: 160,
        progress: { current: 100, total: 100, season: 1, hours: 160 },
        providers: ['steam', 'ps'],
        consumptionLogs: [{ startedAt: '2026-08-01', finishedAt: '2026-09-05', notes: 'Platinado com build de fé.', isRewatch: false }],
        createdAt: '05/09/2026'
      },
      {
        id: 'g_2',
        title: 'Cyberpunk 2077',
        category: 'jogo',
        status: 'zerado',
        rating: 4,
        comment: 'Night City é vibrante e a história de V e Johnny Silverhand é marcante.',
        coverImage: '',
        xpGained: 110,
        progress: { current: 80, total: 100, season: 1, hours: 65 },
        providers: ['steam'],
        consumptionLogs: [{ startedAt: '2026-08-20', finishedAt: '2026-09-09', notes: 'Final com os Nômades.', isRewatch: false }],
        createdAt: '09/09/2026'
      }
    ]
  },
  {
    id: 'usr_carolbooks',
    name: 'Carol Mendes',
    username: 'carolbooks',
    email: 'carol@livros.com',
    password: '1234',
    avatar: '',
    bio: 'Devoradora de literatura fantástica, distopias e ficção especulativa.',
    isPrivate: false,
    equippedTitle: 'Devorador de Páginas',
    unlockedTitles: ['Iniciante Curioso', 'Leitor Iniciante', 'Devorador de Páginas'],
    friends: [],
    unlockedAchievements: ['livro_10', 'special_first'],
    customLists: [
      {
        id: 'list_c1',
        title: 'Distopias Clássicas e Modernas',
        description: 'Livros para refletir sobre sociedade, tecnologia e política.',
        isPublic: true,
        itemIds: ['b_2'],
        createdAt: '04/09/2026'
      }
    ],
    items: [
      {
        id: 'b_1',
        title: 'O Nome do Vento',
        category: 'livro',
        status: 'lido',
        rating: 5,
        comment: 'Prosa lírica impressionante. Kvothe é um dos protagonistas mais cativantes da fantasia.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
        xpGained: 120,
        progress: { current: 656, total: 656, season: 1, hours: 22 },
        providers: ['livro'],
        consumptionLogs: [{ startedAt: '2026-08-25', finishedAt: '2026-09-02', notes: 'Reler em breve.', isRewatch: false }],
        createdAt: '02/09/2026'
      },
      {
        id: 'b_2',
        title: '1984',
        category: 'livro',
        status: 'lido',
        rating: 5,
        comment: 'Leitura essencial e assustadoramente atual sobre vigilância e controle.',
        coverImage: '',
        xpGained: 120,
        progress: { current: 328, total: 328, season: 1, hours: 10 },
        providers: ['kindle'],
        consumptionLogs: [{ startedAt: '2026-09-03', finishedAt: '2026-09-04', notes: '', isRewatch: false }],
        createdAt: '04/09/2026'
      }
    ]
  }
];

// ==========================================================================
// Base Inicial de Conexões e Amizades v2.0 (Ciclo de Vida Assíncrono)
// ==========================================================================

const INITIAL_CONNECTIONS = [
  // Rafael e Maria Eduarda: amizade formalmente aceita
  {
    id: 'conn_1',
    requesterId: 'usr_rafael',
    addresseeId: 'usr_mariacine',
    status: 'accepted',
    createdAt: '10/09/2026',
    updatedAt: '10/09/2026'
  },
  // Lucas enviou solicitação de amizade para Rafael (pendente de aprovação)
  {
    id: 'conn_2',
    requesterId: 'usr_lucasgames',
    addresseeId: 'usr_rafael',
    status: 'pending',
    createdAt: '14/09/2026',
    updatedAt: '14/09/2026'
  }
];

// ==========================================================================
// Base Inicial de Mensagens de Chat (DMs entre Amigos Confirmados)
// ==========================================================================

const INITIAL_MESSAGES = [
  {
    id: 'msg_init_1',
    senderId: 'usr_mariacine',
    receiverId: 'usr_rafael',
    text: 'Oi Rafael! Vi que você favoritou Interestelar e Duna no seu acervo cultural, muito bom gosto! 🎬🍿',
    timestamp: Date.now() - (1000 * 60 * 60 * 4), // 4 horas atrás
    createdAt: '15/09/2026 18:50',
    read: true
  },
  {
    id: 'msg_init_2',
    senderId: 'usr_rafael',
    receiverId: 'usr_mariacine',
    text: 'Oi Maria! Muito obrigado! Duna e Interestelar são fantásticos. Vi que você assistiu Blade Runner 2049 e Severance também, a fotografia de Blade Runner é de outro mundo!',
    timestamp: Date.now() - (1000 * 60 * 60 * 2), // 2 horas atrás
    createdAt: '15/09/2026 20:51',
    read: true
  },
  {
    id: 'msg_init_3',
    senderId: 'usr_mariacine',
    receiverId: 'usr_rafael',
    text: 'Com certeza! Roger Deakins é um gênio da iluminação. E o final da 1ª temporada de Severance é de cair o queixo! Quando puder, assista aos episódios finais! 🔥',
    timestamp: Date.now() - (1000 * 60 * 30), // 30 min atrás
    createdAt: '15/09/2026 22:20',
    read: false
  }
];

// Níveis de Gamificação
const LEVEL_TIERS = [
  { level: 1, title: 'Iniciante Curioso', minXp: 0, maxXp: 150 },
  { level: 2, title: 'Explorador Cultural', minXp: 150, maxXp: 350 },
  { level: 3, title: 'Crítico Entusiasta', minXp: 350, maxXp: 650 },
  { level: 4, title: 'Conhecedor Multimídia', minXp: 650, maxXp: 1050 },
  { level: 5, title: 'Mestre da Cultura Pop', minXp: 1050, maxXp: 1550 },
  { level: 6, title: 'Lenda dos Registros', minXp: 1550, maxXp: 2200 },
  { level: 7, title: 'Oráculo Cultural', minXp: 2200, maxXp: Infinity }
];

// Marcos de Conquistas por Categoria
const CATEGORY_MILESTONES = [
  {
    category: 'filme',
    label: 'Filmes',
    tiers: [
      { count: 10, name: 'Cinéfilo Iniciante', icon: '🎬' },
      { count: 30, name: 'Cinéfilo Assíduo', icon: '🎥' },
      { count: 70, name: 'Crítico de Cinema', icon: '🎞️' },
      { count: 100, name: 'Mestre da Sétima Arte', icon: '📽️' },
      { count: 200, name: 'Enciclopédia Cinematográfica', icon: '🌟' },
      { count: 300, name: 'Lenda do Cinema', icon: '👑' }
    ]
  },
  {
    category: 'serie',
    label: 'Séries',
    tiers: [
      { count: 10, name: 'Maratonista Iniciante', icon: '🍿' },
      { count: 30, name: 'Maratonista Noturno', icon: '📺' },
      { count: 70, name: 'Devorador de Temporadas', icon: '⚡' },
      { count: 100, name: 'Especialista em Séries', icon: '💎' },
      { count: 200, name: 'Viciado em Ficção', icon: '🔥' },
      { count: 300, name: 'Lenda das Séries', icon: '👑' }
    ]
  },
  {
    category: 'livro',
    label: 'Livros',
    tiers: [
      { count: 10, name: 'Leitor Iniciante', icon: '📚' },
      { count: 30, name: 'Devorador de Páginas', icon: '📖' },
      { count: 70, name: 'Rato de Biblioteca', icon: '📜' },
      { count: 100, name: 'Literato Dedicado', icon: '✒️' },
      { count: 200, name: 'Guardião dos Tomos', icon: '🏰' },
      { count: 300, name: 'Lenda da Literatura', icon: '👑' }
    ]
  },
  {
    category: 'jogo',
    label: 'Jogos',
    tiers: [
      { count: 10, name: 'Gamer Casual', icon: '🎮' },
      { count: 30, name: 'Gamer Entusiasta', icon: '🕹️' },
      { count: 70, name: 'Veterano dos Games', icon: '⚔️' },
      { count: 100, name: 'Zerador Profissional', icon: '🏆' },
      { count: 200, name: 'Mestre dos Jogos', icon: '👾' },
      { count: 300, name: 'Lenda Gamer', icon: '👑' }
    ]
  }
];

// Definição Completa de Conquistas (Comuns, Especiais e 4 Secretas)
const ACHIEVEMENTS_DEF = [
  ...CATEGORY_MILESTONES.flatMap(cat => 
    cat.tiers.map(tier => ({
      id: `${cat.category}_${tier.count}`,
      name: tier.name,
      category: cat.category,
      desc: `Cadastre ${tier.count} ${cat.label.toLowerCase()} no seu catálogo.`,
      icon: tier.icon,
      isSecret: false,
      check: (items) => items.filter(i => i.category === cat.category).length >= tier.count,
      getProgress: (items) => {
        const current = items.filter(i => i.category === cat.category).length;
        return { current: Math.min(current, tier.count), target: tier.count };
      }
    }))
  ),
  {
    id: 'special_first',
    name: 'Primeiro Registro',
    category: 'especial',
    desc: 'Cadastre seu 1º registro de qualquer categoria.',
    icon: '🌱',
    isSecret: false,
    check: (items) => items.length >= 1,
    getProgress: (items) => ({ current: Math.min(items.length, 1), target: 1 })
  },
  {
    id: 'special_5stars',
    name: 'Exigência Máxima',
    category: 'especial',
    desc: 'Avalie 3 ou mais obras com 5 estrelas.',
    icon: '⭐',
    isSecret: false,
    check: (items) => items.filter(i => Number(i.rating) === 5).length >= 3,
    getProgress: (items) => {
      const count = items.filter(i => Number(i.rating) === 5).length;
      return { current: Math.min(count, 3), target: 3 };
    }
  },
  {
    id: 'special_polymath',
    name: 'Polímata Cultural',
    category: 'especial',
    desc: 'Tenha ao menos 1 registro em cada uma das 4 categorias.',
    icon: '🔮',
    isSecret: false,
    check: (items) => {
      const cats = new Set(items.map(i => i.category));
      return ['filme', 'serie', 'livro', 'jogo'].every(c => cats.has(c));
    },
    getProgress: (items) => {
      const cats = new Set(items.map(i => i.category));
      const count = ['filme', 'serie', 'livro', 'jogo'].filter(c => cats.has(c)).length;
      return { current: count, target: 4 };
    }
  },
  // CONQUISTAS SECRETAS (Gamificação Avançada)
  {
    id: 'secret_midnight',
    name: 'Coruja da Madrugada',
    category: 'secreta',
    desc: 'Registrou ou avaliou uma obra na calada da noite (entre 00:00 e 05:00).',
    icon: '🦉',
    isSecret: true,
    check: (items) => {
      const hour = new Date().getHours();
      return (hour >= 0 && hour < 5) && items.length > 0;
    },
    getProgress: (items) => ({ current: 0, target: 1 })
  },
  {
    id: 'secret_harsh_critic',
    name: 'Crítico Implacável',
    category: 'secreta',
    desc: 'Avaliou uma obra com 1 estrela e redigiu uma análise minuciosa com mais de 50 caracteres.',
    icon: '⚡',
    isSecret: true,
    check: (items) => items.some(i => Number(i.rating) === 1 && (i.comment && i.comment.trim().length >= 50)),
    getProgress: (items) => {
      const found = items.some(i => Number(i.rating) === 1 && (i.comment && i.comment.trim().length >= 50));
      return { current: found ? 1 : 0, target: 1 };
    }
  },
  {
    id: 'secret_speedrun',
    name: 'Colecionador Obsessivo',
    category: 'secreta',
    desc: 'Cadastrou 3 ou mais obras culturais no mesmo dia.',
    icon: '🏃',
    isSecret: true,
    check: (items) => {
      const dates = items.map(i => i.createdAt || '');
      const countByDate = {};
      dates.forEach(d => { if (d) countByDate[d] = (countByDate[d] || 0) + 1; });
      return Object.values(countByDate).some(cnt => cnt >= 3);
    },
    getProgress: (items) => {
      const dates = items.map(i => i.createdAt || '');
      const countByDate = {};
      dates.forEach(d => { if (d) countByDate[d] = (countByDate[d] || 0) + 1; });
      const maxCount = Math.max(0, ...Object.values(countByDate));
      return { current: Math.min(maxCount, 3), target: 3 };
    }
  },
  {
    id: 'secret_platinador',
    name: 'Mestre dos 100%',
    category: 'secreta',
    desc: 'Conquistou sua primeira obra com status "Platinado (100%)"!',
    icon: '👑',
    isSecret: true,
    check: (items) => items.some(i => i.status === 'platinado'),
    getProgress: (items) => {
      const hasPlatina = items.some(i => i.status === 'platinado');
      return { current: hasPlatina ? 1 : 0, target: 1 };
    }
  }
];

// Mapeamento de Status por Categoria
const MEDIA_STATUS_CONFIG = {
  filme: [
    { value: 'assistido', label: '🎬 Assistido' },
    { value: 'quero_assistir', label: '⏳ Quero Assistir' },
    { value: 'revisto', label: '🔄 Revisto' }
  ],
  serie: [
    { value: 'assistindo', label: '🍿 Assistindo' },
    { value: 'finalizada', label: '🎬 Finalizada' },
    { value: 'em_espera', label: '⏳ Em Espera' },
    { value: 'dropada', label: '💤 Dropada' }
  ],
  livro: [
    { value: 'lendo', label: '📖 Lendo' },
    { value: 'lido', label: '📚 Concluído' },
    { value: 'quero_ler', label: '⏳ Quero Ler' },
    { value: 'abandonado', label: '💤 Abandonado' }
  ],
  jogo: [
    { value: 'jogando', label: '🕹️ Jogando' },
    { value: 'zerado', label: '✅ Zerado' },
    { value: 'platinado', label: '🏆 Platinado (100%)' },
    { value: 'backlog', label: '⏳ Backlog' },
    { value: 'dropado', label: '💤 Dropado' }
  ]
};

// Catálogo de Provedores e Plataformas
const PROVIDERS_DATA = [
  { id: 'netflix', name: 'Netflix', icon: '🔴' },
  { id: 'prime', name: 'Prime Video', icon: '🔷' },
  { id: 'max', name: 'Max / HBO', icon: '🟣' },
  { id: 'disney', name: 'Disney+', icon: '🏰' },
  { id: 'apple', name: 'Apple TV+', icon: '🍏' },
  { id: 'steam', name: 'Steam', icon: '💨' },
  { id: 'ps', name: 'PlayStation', icon: '🎮' },
  { id: 'xbox', name: 'Xbox', icon: '🟢' },
  { id: 'switch', name: 'Nintendo Switch', icon: '🔴' },
  { id: 'kindle', name: 'Kindle', icon: '📖' },
  { id: 'livro', name: 'Livro Físico', icon: '📚' },
  { id: 'cinema', name: 'Cinema', icon: '🍿' }
];

// Missões Temporárias Mensais (Rotativas)
const MONTHLY_MISSIONS_POOL = [
  {
    id: 'm_filme_2',
    title: 'Sessão Dupla',
    category: 'filme',
    desc: 'Cadastre ou assista a 2 filmes neste mês.',
    target: 2,
    rewardXp: 150,
    icon: '🎬',
    check: (items) => items.filter(i => i.category === 'filme').length
  },
  {
    id: 'm_jogo_4star',
    title: 'Gamer Determinado',
    category: 'jogo',
    desc: 'Avalie ou finalize 2 jogos com 4 ou 5 estrelas.',
    target: 2,
    rewardXp: 180,
    icon: '🎮',
    check: (items) => items.filter(i => i.category === 'jogo' && Number(i.rating) >= 4).length
  },
  {
    id: 'm_critica_detalhe',
    title: 'Crítico Detalhista',
    category: null,
    desc: 'Escreva 1 resenha aprofundada com mais de 50 caracteres.',
    target: 1,
    rewardXp: 120,
    icon: '✍️',
    check: (items) => items.filter(i => i.comment && i.comment.trim().length >= 50).length
  },
  {
    id: 'm_livro_1',
    title: 'Páginas em Foco',
    category: 'livro',
    desc: 'Registre ou conclua 1 livro no seu acervo.',
    target: 1,
    rewardXp: 140,
    icon: '📚',
    check: (items) => items.filter(i => i.category === 'livro').length
  }
];

// Atividades Iniciais do Feed Social
const SEED_ACTIVITIES = [
  {
    id: 'act_1',
    userId: 'usr_mariacine',
    userName: 'Maria Eduarda',
    userAvatar: '',
    type: 'review',
    title: 'avaliou um filme',
    mediaTitle: 'Blade Runner 2049',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Fotografia magistral de Roger Deakins e atmosfera cyberpunk incomparável.',
    timeAgo: 'há 2 horas',
    reactions: { like: 4, applause: 3, fire: 6, userReactions: {} }
  },
  {
    id: 'act_2',
    userId: 'usr_lucasgames',
    userName: 'Lucas Gamer',
    userAvatar: '',
    type: 'platina',
    title: 'platinou um jogo',
    mediaTitle: 'Elden Ring',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    rating: 5,
    comment: '160 horas de exploração pura nas Terras Intermédias. 100% dos troféus conquistados!',
    timeAgo: 'ontem às 21:40',
    reactions: { like: 8, applause: 12, fire: 15, userReactions: {} }
  },
  {
    id: 'act_3',
    userId: 'usr_carolbooks',
    userName: 'Carol Mendes',
    userAvatar: '',
    type: 'list',
    title: 'criou uma lista temática',
    mediaTitle: 'Distopias Clássicas e Modernas',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Uma curadoria especial para quem ama reflexões sobre o futuro e poder.',
    timeAgo: 'há 2 dias',
    reactions: { like: 5, applause: 2, fire: 3, userReactions: {} }
  },
  {
    id: 'act_4',
    userId: 'usr_mariacine',
    userName: 'Maria Eduarda',
    userAvatar: '',
    type: 'review',
    title: 'analisou uma obra marcante com spoiler',
    mediaTitle: 'Interestelar',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'A revelação do tesserato na 5ª dimensão permitindo que Cooper envie dados quânticos pelo ponteiro de segundos do relógio da Murphy é extraordinária.',
    isSpoiler: true,
    timeAgo: 'há 4 horas',
    reactions: { like: 7, applause: 4, fire: 9, userReactions: {} }
  }
];

// ==========================================================================
// Estado Global da Aplicação v2.0
// ==========================================================================

let appState = {
  users: [],
  currentUser: null,
  connections: [], // Conexões com status: 'pending' | 'accepted' | 'rejected'
  selectedCategory: 'todos',
  selectedStatus: 'todos',
  selectedAchCategory: 'todos',
  communitySearchQuery: '',
  searchQuery: '',
  selectedRatingInput: 5,
  currentView: 'catalog', // 'catalog' | 'community' | 'chats' | 'profile'
  currentCatalogSubTab: 'catalog', // 'catalog' | 'lists' | 'missions'
  currentCommunitySubTab: 'members', // 'members' | 'requests' | 'feed' | 'blocked'
  blocks: [], // Bloqueios: { id, blockerId, blockedId, createdAt }
  reports: [], // Denúncias: { id, reporterId, reportedUserId, itemId, activityId, reason, details, status, createdAt }
  messages: [], // Mensagens de chat persistidas
  selectedChatFriendId: null, // ID do amigo com chat aberto atualmente
  chatSearchQuery: '', // Filtro de busca na lista de amigos do chat
  selectedProviders: [],
  activityFeed: [],
  currentWrappedSlide: 0
};

// ==========================================================================
// Efeito de Confetes em Canvas Nativo
// ==========================================================================

const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationFrame: null,

  init() {
    this.canvas = document.getElementById('confettiCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  trigger(duration = 2800) {
    if (!this.canvas) this.init();
    this.particles = [];
    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#38bdf8', '#fbbf24', '#10b981', '#ffffff'];
    const count = 95;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.35 + Math.random() * 0.15
      });
    }

    const startTime = performance.now();
    const loop = (currentTime) => {
      const elapsed = currentTime - startTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (elapsed / duration));

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      });

      if (elapsed < duration) {
        this.animationFrame = requestAnimationFrame(loop);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(loop);
  }
};

function playCelebrationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.09);
      gain.gain.setValueAtTime(0.14, audioCtx.currentTime + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + index * 0.09);
      osc.stop(audioCtx.currentTime + index * 0.09 + 0.38);
    });
  } catch (e) {}
}

// ==========================================================================
// Camada de Dados Multi-Usuário & Migração Automática v2.0
// ==========================================================================

function loadUsersDatabase() {
  const raw = localStorage.getItem('keeplay_users') || localStorage.getItem('catalogogeral_users');
  let users = [];

  if (raw) {
    try {
      users = JSON.parse(raw);
    } catch (e) {
      users = [...INITIAL_USERS];
    }
  } else {
    users = [...INITIAL_USERS];
  }

  // Migração transparente para estrutura v2.0
  users = users.map(user => {
    // Garante campos de gamificação e listas
    if (!user.equippedTitle) user.equippedTitle = 'Iniciante Curioso';
    if (!user.unlockedTitles) user.unlockedTitles = ['Iniciante Curioso'];
    if (!user.customLists) user.customLists = [];
    if (!user.claimedMissions) user.claimedMissions = [];

    // Migra itens
    user.items = (user.items || []).map(item => {
      let defaultStatus = 'assistido';
      if (item.category === 'jogo') defaultStatus = 'zerado';
      else if (item.category === 'livro') defaultStatus = 'lido';
      else if (item.category === 'serie') defaultStatus = 'assistindo';

      return {
        ...item,
        status: item.status || defaultStatus,
        progress: item.progress || {
          current: item.category === 'serie' ? 5 : (item.category === 'livro' ? 120 : 1),
          total: item.category === 'serie' ? 10 : (item.category === 'livro' ? 300 : 1),
          season: 1,
          hours: item.category === 'jogo' ? 35 : (item.category === 'filme' ? 2.2 : 10)
        },
        providers: item.providers || [],
        consumptionLogs: item.consumptionLogs || [{ startedAt: item.createdAt, finishedAt: item.createdAt, isRewatch: Boolean(item.isRewatch) }],
        isRewatch: Boolean(item.isRewatch)
      };
    });

    return user;
  });

  appState.users = users;
  saveUsersDatabase();

  // Carrega Feed Social
  const rawFeed = localStorage.getItem('keeplay_feed') || localStorage.getItem('catalogogeral_feed');
  if (rawFeed) {
    try {
      appState.activityFeed = JSON.parse(rawFeed);
    } catch (e) {
      appState.activityFeed = [...SEED_ACTIVITIES];
    }
  } else {
    appState.activityFeed = [...SEED_ACTIVITIES];
    saveFeedDatabase();
  }
}

function saveUsersDatabase() {
  localStorage.setItem('keeplay_users', JSON.stringify(appState.users));
}

function saveFeedDatabase() {
  localStorage.setItem('keeplay_feed', JSON.stringify(appState.activityFeed));
}

// ==========================================================================
// Gerenciamento de Conexões de Amizade (Ciclo de Vida Assíncrono v2.0)
// ==========================================================================

function loadConnectionsDatabase() {
  const raw = localStorage.getItem('keeplay_connections') || localStorage.getItem('catalogogeral_connections');
  let connections = [];

  if (raw) {
    try {
      connections = JSON.parse(raw);
    } catch (e) {
      connections = [...INITIAL_CONNECTIONS];
    }
  } else {
    connections = [...INITIAL_CONNECTIONS];
    localStorage.setItem('keeplay_connections', JSON.stringify(connections));
  }

  appState.connections = connections;
}

function saveConnectionsDatabase(reRender = true) {
  localStorage.setItem('keeplay_connections', JSON.stringify(appState.connections));
  syncUsersFriendsList();
  updatePendingBadge();
  if (reRender && appState.currentView === 'chats' && !isRenderingChatsView) {
    renderChatsView();
  }
}

function getConnectionBetween(userId1, userId2) {
  if (!userId1 || !userId2) return null;
  return (appState.connections || []).find(c => 
    ((c.requesterId === userId1 && c.addresseeId === userId2) ||
     (c.requesterId === userId2 && c.addresseeId === userId1)) &&
    c.status !== 'rejected'
  ) || null;
}

function getAcceptedFriendIds(userId) {
  if (!userId) return [];
  const connections = appState.connections || [];
  const friendIds = [];
  connections.forEach(c => {
    if (c.status === 'accepted') {
      if (c.requesterId === userId) friendIds.push(c.addresseeId);
      else if (c.addresseeId === userId) friendIds.push(c.requesterId);
    }
  });
  return Array.from(new Set(friendIds));
}

function getPendingIncomingRequests(userId) {
  if (!userId) return [];
  return (appState.connections || []).filter(c => c.addresseeId === userId && c.status === 'pending');
}

function getPendingOutgoingRequests(userId) {
  if (!userId) return [];
  return (appState.connections || []).filter(c => c.requesterId === userId && c.status === 'pending');
}

function syncUsersFriendsList() {
  if (!appState.users) return;
  let changed = false;
  appState.users.forEach(u => {
    const acceptedIds = getAcceptedFriendIds(u.id);
    const currentIds = u.friends || [];
    if (JSON.stringify(acceptedIds.slice().sort()) !== JSON.stringify(currentIds.slice().sort())) {
      u.friends = acceptedIds;
      changed = true;
    }
  });

  if (appState.currentUser) {
    appState.currentUser.friends = getAcceptedFriendIds(appState.currentUser.id);
  }

  if (changed) {
    saveUsersDatabase();
  }
}

function updatePendingBadge() {
  if (!appState.currentUser) return;
  const incoming = getPendingIncomingRequests(appState.currentUser.id);
  const outgoing = getPendingOutgoingRequests(appState.currentUser.id);
  const badge = document.getElementById('pendingRequestsCountBadge');
  if (badge) {
    if (incoming.length > 0) {
      badge.textContent = incoming.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  const inCountEl = document.getElementById('incomingRequestsCount');
  if (inCountEl) inCountEl.textContent = incoming.length;

  const outCountEl = document.getElementById('outgoingRequestsCount');
  if (outCountEl) outCountEl.textContent = outgoing.length;

  const friendsCounterBadge = document.getElementById('friendsCounterBadge');
  if (friendsCounterBadge) {
    const friendCount = getAcceptedFriendIds(appState.currentUser.id).length;
    friendsCounterBadge.textContent = `${friendCount} ${friendCount === 1 ? 'amigo conectado' : 'amigos conectados'}`;
  }
}

// ==========================================================================
// Gerenciamento de Bloqueios e Denúncias de Conteúdo
// ==========================================================================

function loadBlocksDatabase() {
  const raw = localStorage.getItem('keeplay_blocks') || localStorage.getItem('catalogogeral_blocks');
  let blocks = [];
  if (raw) {
    try {
      blocks = JSON.parse(raw);
    } catch (e) {
      blocks = [];
    }
  }
  appState.blocks = blocks;
}

function saveBlocksDatabase() {
  localStorage.setItem('keeplay_blocks', JSON.stringify(appState.blocks || []));
  updateBlockedBadge();
}

function loadReportsDatabase() {
  const raw = localStorage.getItem('keeplay_reports') || localStorage.getItem('catalogogeral_reports');
  let reports = [];
  if (raw) {
    try {
      reports = JSON.parse(raw);
    } catch (e) {
      reports = [];
    }
  }
  appState.reports = reports;
}

function saveReportsDatabase() {
  localStorage.setItem('keeplay_reports', JSON.stringify(appState.reports || []));
}

// ==========================================================================
// Módulo de Chats e Mensagens Diretas entre Amigos (v2.0)
// ==========================================================================

function loadMessagesDatabase() {
  const raw = localStorage.getItem('keeplay_messages') || localStorage.getItem('catalogogeral_messages');
  let messages = [];
  if (raw) {
    try {
      messages = JSON.parse(raw);
    } catch (e) {
      messages = [...INITIAL_MESSAGES];
    }
  } else {
    messages = [...INITIAL_MESSAGES];
  }
  appState.messages = messages;
  updateChatUnreadBadge();
}

function saveMessagesDatabase() {
  localStorage.setItem('keeplay_messages', JSON.stringify(appState.messages || []));
  updateChatUnreadBadge();
}

function getMessagesBetween(userId1, userId2) {
  if (!userId1 || !userId2) return [];
  return (appState.messages || []).filter(m => 
    (m.senderId === userId1 && m.receiverId === userId2) ||
    (m.senderId === userId2 && m.receiverId === userId1)
  ).sort((a, b) => a.timestamp - b.timestamp);
}

function updateChatUnreadBadge() {
  if (!appState.currentUser) return;
  const currentId = appState.currentUser.id;
  const unreadCount = (appState.messages || []).filter(m => m.receiverId === currentId && !m.read).length;
  const badge = document.getElementById('unreadChatsBadge');
  const mobileBadge = document.getElementById('mobileUnreadChatsBadge');
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = badgeText;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  if (mobileBadge) {
    if (unreadCount > 0) {
      mobileBadge.textContent = badgeText;
      mobileBadge.style.display = 'inline-block';
    } else {
      mobileBadge.style.display = 'none';
    }
  }
}

function formatChatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `${hours}:${minutes}`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Ontem ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

function formatChatSeparatorDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Hoje';
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

let isRenderingChatsView = false;

function renderChatsView() {
  if (!appState.currentUser || isRenderingChatsView) return;
  isRenderingChatsView = true;

  try {
    loadMessagesDatabase();

    const currentId = appState.currentUser.id;
    const friendIds = getAcceptedFriendIds(currentId);

    // Se o amigo selecionado deixou de ser amigo ou foi bloqueado, desseleciona
    if (appState.selectedChatFriendId && !friendIds.includes(appState.selectedChatFriendId)) {
      appState.selectedChatFriendId = null;
    }

    // Se nenhum chat está selecionado mas há amigos com conversa, seleciona o primeiro amigo por padrão
    if (!appState.selectedChatFriendId && friendIds.length > 0) {
      // Escolhe o amigo com a mensagem mais recente ou o primeiro da lista
      let bestFriendId = friendIds[0];
      let latestTime = 0;
      friendIds.forEach(fId => {
        const msgs = getMessagesBetween(currentId, fId);
        if (msgs.length > 0) {
          const lastMsgTime = msgs[msgs.length - 1].timestamp;
          if (lastMsgTime > latestTime) {
            latestTime = lastMsgTime;
            bestFriendId = fId;
          }
        }
      });
      appState.selectedChatFriendId = bestFriendId;
    }

    renderChatFriendsList();

    const placeholder = document.getElementById('noChatSelectedPlaceholder');
    const activeContainer = document.getElementById('activeChatContainer');

    if (!appState.selectedChatFriendId || friendIds.length === 0) {
      if (placeholder) {
        placeholder.style.display = 'flex';
        renderPlaceholderQuickPicks();
      }
      if (activeContainer) activeContainer.style.display = 'none';
    } else {
      if (placeholder) placeholder.style.display = 'none';
      if (activeContainer) activeContainer.style.display = 'flex';
      renderActiveChat();
    }

    updateChatUnreadBadge();
  } finally {
    isRenderingChatsView = false;
  }
}

function renderPlaceholderQuickPicks() {
  const placeholder = document.getElementById('noChatSelectedPlaceholder');
  if (!placeholder || !appState.currentUser) return;

  const currentId = appState.currentUser.id;
  const friendIds = getAcceptedFriendIds(currentId);
  const friends = (appState.users || []).filter(u => friendIds.includes(u.id) && !hasUserBlocked(currentId, u.id));
  const otherUsers = (appState.users || []).filter(u => u.id !== currentId && !hasUserBlocked(currentId, u.id));

  let existingPicks = placeholder.querySelector('.chat-placeholder-quick-picks');
  if (existingPicks) existingPicks.remove();

  const picksWrap = document.createElement('div');
  picksWrap.className = 'chat-placeholder-quick-picks';

  if (friends.length > 0) {
    picksWrap.innerHTML = `
      <div class="chat-quick-picks-label">Escolha um amigo para conversar agora:</div>
      <div class="chat-quick-picks-grid">
        ${friends.map(f => `
          <button type="button" class="chat-quick-pick-btn" onclick="selectChatFriend('${f.id}')">
            <span class="quick-pick-avatar">${f.avatar ? `<img src="${f.avatar}">` : (f.name ? f.name[0].toUpperCase() : 'U')}</span>
            <div class="quick-pick-info">
              <strong>${escapeHtml(f.name)}</strong>
              <small>@${escapeHtml(f.username)}</small>
            </div>
            <span class="quick-pick-action">Abrir Chat 💬</span>
          </button>
        `).join('')}
      </div>
    `;
  } else {
    picksWrap.innerHTML = `
      <div class="chat-quick-picks-label">Conecte-se com membros para iniciar uma conversa:</div>
      <div class="chat-quick-picks-grid">
        ${otherUsers.map(u => `
          <button type="button" class="chat-quick-pick-btn" onclick="openChatWithUser('${u.id}')">
            <span class="quick-pick-avatar">${u.avatar ? `<img src="${u.avatar}">` : (u.name ? u.name[0].toUpperCase() : 'U')}</span>
            <div class="quick-pick-info">
              <strong>${escapeHtml(u.name)}</strong>
              <small>@${escapeHtml(u.username)}</small>
            </div>
            <span class="quick-pick-action">Conversar 💬</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  placeholder.appendChild(picksWrap);
}

function renderChatFriendsList() {
  const container = document.getElementById('chatFriendsListContainer');
  const counterEl = document.getElementById('chatFriendsCount');
  if (!container || !appState.currentUser) return;

  const currentId = appState.currentUser.id;
  const friendIds = getAcceptedFriendIds(currentId);

  if (counterEl) {
    counterEl.textContent = `${friendIds.length} ${friendIds.length === 1 ? 'amigo' : 'amigos'}`;
  }

  // Se houver solicitações de amizade recebidas pendentes, exibe banner com atalho rápido
  const incomingRequests = getPendingIncomingRequests(currentId);
  let pendingHtml = '';
  if (incomingRequests.length > 0) {
    const pendingItems = incomingRequests.map(req => {
      const requester = (appState.users || []).find(u => u.id === req.requesterId);
      if (!requester) return '';
      return `
        <div class="chat-pending-card">
          <div class="chat-pending-user">
            <span class="chat-pending-avatar">${requester.avatar ? `<img src="${requester.avatar}">` : requester.name.charAt(0).toUpperCase()}</span>
            <div class="chat-pending-names">
              <strong>${escapeHtml(requester.name)}</strong>
              <small>@${escapeHtml(requester.username)}</small>
            </div>
          </div>
          <button type="button" class="btn-chat-accept-instant" onclick="handleAcceptAndOpenChat('${req.id}', '${requester.id}')" title="Aceitar pedido e abrir conversa">
            <span>✓</span> Aceitar & Conversar
          </button>
        </div>
      `;
    }).filter(Boolean).join('');

    if (pendingItems) {
      pendingHtml = `
        <div class="chat-pending-banner">
          <div class="chat-pending-title">
            <span>📬</span> Solicitações Pendentes (${incomingRequests.length})
          </div>
          ${pendingItems}
        </div>
      `;
    }
  }

  // Filtra amigos ativos e não bloqueados
  const friends = (appState.users || []).filter(u => 
    friendIds.includes(u.id) && !hasUserBlocked(currentId, u.id) && !hasUserBlocked(u.id, currentId)
  );

  if (friends.length === 0) {
    const otherUsers = (appState.users || []).filter(u => u.id !== currentId && !hasUserBlocked(currentId, u.id));
    container.innerHTML = `
      ${pendingHtml}
      <div class="chats-empty-friends">
        <div class="chats-empty-friends-icon">💬</div>
        <h4>Inicie uma Conversa</h4>
        <p>Você pode conversar diretamente com outros exploradores culturais do Keeplay:</p>
        <div class="chat-suggested-users-wrap">
          ${otherUsers.map(user => `
            <div class="chat-suggested-item" onclick="openChatWithUser('${user.id}')" role="button" tabindex="0">
              <div class="chat-friend-avatar">
                ${user.avatar ? `<img src="${user.avatar}" alt="${escapeAttr(user.name)}">` : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </div>
              <div class="chat-friend-details">
                <div class="chat-friend-name">${escapeHtml(user.name)}</div>
                <div class="chat-last-snippet">@${escapeHtml(user.username)} • ${escapeHtml(user.equippedTitle || 'Explorador')}</div>
              </div>
              <button type="button" class="btn-suggested-chat-action" onclick="event.stopPropagation(); openChatWithUser('${user.id}')">
                <span>💬</span> Conversar
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  const query = (appState.chatSearchQuery || '').toLowerCase().trim();
  const filteredFriends = friends.filter(f => {
    if (!query) return true;
    return (f.name && f.name.toLowerCase().includes(query)) ||
           (f.username && f.username.toLowerCase().includes(query));
  });

  if (filteredFriends.length === 0) {
    container.innerHTML = `
      ${pendingHtml}
      <div class="chats-empty-friends" style="padding: 1.5rem 0.5rem;">
        <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🔍</div>
        <h4 style="font-size: 0.85rem;">Nenhum amigo encontrado</h4>
        <p style="font-size: 0.74rem;">Nenhum amigo corresponde a "${escapeHtml(query)}".</p>
      </div>
    `;
    return;
  }

  // Ordena amigos: quem tem mensagem mais recente fica no topo
  filteredFriends.sort((a, b) => {
    const msgsA = getMessagesBetween(currentId, a.id);
    const msgsB = getMessagesBetween(currentId, b.id);
    const timeA = msgsA.length > 0 ? msgsA[msgsA.length - 1].timestamp : 0;
    const timeB = msgsB.length > 0 ? msgsB[msgsB.length - 1].timestamp : 0;
    return timeB - timeA;
  });

  const friendsListHtml = filteredFriends.map(friend => {
    const msgs = getMessagesBetween(currentId, friend.id);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const unreadCount = msgs.filter(m => m.receiverId === currentId && !m.read).length;
    const isActive = appState.selectedChatFriendId === friend.id;

    const initial = friend.name ? friend.name.charAt(0).toUpperCase() : 'U';
    const avatarHtml = friend.avatar 
      ? `<img src="${friend.avatar}" alt="${escapeAttr(friend.name)}">` 
      : initial;

    let lastSnippet = 'Inicie uma conversa cultural...';
    let lastTimeText = '';
    if (lastMsg) {
      const isMine = lastMsg.senderId === currentId;
      lastSnippet = (isMine ? 'Você: ' : '') + escapeHtml(lastMsg.text);
      lastTimeText = formatChatTime(lastMsg.timestamp);
    }

    return `
      <div class="chat-friend-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}" 
           data-friend-id="${friend.id}"
           onclick="selectChatFriend('${friend.id}')" 
           role="button" 
           tabindex="0"
           aria-label="Conversar com ${escapeAttr(friend.name)}">
        <div class="chat-avatar-container">
          <div class="chat-friend-avatar">
            ${avatarHtml}
          </div>
          <span class="chat-online-dot" title="Amigo Online"></span>
        </div>
        <div class="chat-friend-details">
          <div class="chat-friend-top-row">
            <span class="chat-friend-name">${escapeHtml(friend.name)}</span>
            <span class="chat-friend-time">${lastTimeText}</span>
          </div>
          <div class="chat-friend-sub-row">
            <span class="chat-last-snippet">${lastSnippet}</span>
            ${unreadCount > 0 ? `<span class="chat-unread-badge">${unreadCount}</span>` : ''}
          </div>
        </div>
        <button type="button" class="btn-chat-item-delete" onclick="event.stopPropagation(); deleteChatWithFriend('${friend.id}')" title="Excluir histórico com ${escapeAttr(friend.name)}" aria-label="Excluir histórico de conversa com ${escapeAttr(friend.name)}">
          🗑️
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = pendingHtml + friendsListHtml;
}

function selectChatFriend(friendId) {
  if (!appState.currentUser) return;
  const currentId = appState.currentUser.id;
  const friendIds = getAcceptedFriendIds(currentId);

  if (!friendIds.includes(friendId)) {
    openChatWithUser(friendId);
    return;
  }

  appState.selectedChatFriendId = friendId;

  // Marca mensagens recebidas deste amigo como lidas
  let markedAny = false;
  (appState.messages || []).forEach(m => {
    if (m.senderId === friendId && m.receiverId === currentId && !m.read) {
      m.read = true;
      markedAny = true;
    }
  });

  if (markedAny) {
    saveMessagesDatabase();
  }

  // Abre na visão mobile se estiver em tela pequena
  const wrapper = document.querySelector('.chats-layout-wrapper');
  if (wrapper) wrapper.classList.add('mobile-chat-open');

  renderChatsView();

  const chatInput = document.getElementById('chatMessageInput');
  if (chatInput) {
    chatInput.focus();
  }
}

window.selectChatFriend = selectChatFriend;

window.handleAcceptAndOpenChat = function(connId, userId) {
  const conn = (appState.connections || []).find(c => c.id === connId);
  if (conn) {
    conn.status = 'accepted';
    conn.updatedAt = new Date().toLocaleDateString('pt-BR');
    saveConnectionsDatabase(false);
  }
  const user = (appState.users || []).find(u => u.id === userId);
  showToast('Amizade Confirmada', `Agora você e ${user ? user.name : 'este membro'} estão conectados!`, '🎉');
  selectChatFriend(userId);
};

function renderActiveChat() {
  if (!appState.currentUser || !appState.selectedChatFriendId) return;

  const currentId = appState.currentUser.id;
  const friend = (appState.users || []).find(u => u.id === appState.selectedChatFriendId);
  if (!friend) return;

  // Header do Chat
  const avatarEl = document.getElementById('activeChatAvatar');
  const nameEl = document.getElementById('activeChatName');
  const userEl = document.getElementById('activeChatUsername');
  const titleBadge = document.getElementById('activeChatTitleBadge');
  const affinityBadge = document.getElementById('activeChatAffinityBadge');
  const viewProfileBtn = document.getElementById('btnActiveChatViewProfile');

  const initial = friend.name ? friend.name.charAt(0).toUpperCase() : 'U';
  if (avatarEl) {
    avatarEl.innerHTML = friend.avatar ? `<img src="${friend.avatar}" alt="${escapeAttr(friend.name)}">` : initial;
  }
  if (nameEl) nameEl.textContent = friend.name;
  if (userEl) userEl.textContent = `@${friend.username}`;

  if (titleBadge) {
    titleBadge.textContent = `🎖️ ${friend.equippedTitle || 'Explorador Cultural'}`;
  }

  const affinity = calculateCulturalAffinity(appState.currentUser, friend);
  if (affinityBadge) {
    affinityBadge.textContent = `✨ ${affinity.percentage}% Afinidade (${affinity.label})`;
  }

  if (viewProfileBtn) {
    viewProfileBtn.onclick = () => viewOtherUserCatalog(friend.id);
  }

  // Atualiza placeholder do input
  const inputEl = document.getElementById('chatMessageInput');
  if (inputEl) {
    inputEl.placeholder = `Escreva uma mensagem para ${friend.name}...`;
  }

  // Renderiza Feed de Mensagens
  const stream = document.getElementById('chatMessagesStream');
  if (!stream) return;

  const messages = getMessagesBetween(currentId, friend.id);

  if (messages.length === 0) {
    stream.innerHTML = `
      <div style="text-align: center; padding: 3.5rem 1.5rem; color: var(--text-muted); margin: auto;">
        <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">👋</div>
        <h4 style="color: var(--text-primary); margin-bottom: 0.35rem;">Início da conversa com ${escapeHtml(friend.name)}</h4>
        <p style="font-size: 0.84rem; max-width: 380px; margin: 0 auto; line-height: 1.5;">
          Diga um olá, compartilhe o que achou de uma obra recente ou reaja com uma pipoca! 🍿
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  let lastDateStr = '';

  messages.forEach(msg => {
    const msgDateStr = new Date(msg.timestamp).toDateString();
    if (msgDateStr !== lastDateStr) {
      html += `<div class="chat-date-separator">${formatChatSeparatorDate(msg.timestamp)}</div>`;
      lastDateStr = msgDateStr;
    }

    const isMine = msg.senderId === currentId;
    const timeStr = formatChatTime(msg.timestamp);

    html += `
      <div class="chat-message-row ${isMine ? 'mine' : 'theirs'}" data-msg-id="${msg.id}">
        ${!isMine ? `
          <div class="chat-msg-avatar">
            ${friend.avatar ? `<img src="${friend.avatar}" alt="${escapeAttr(friend.name)}">` : initial}
          </div>
        ` : ''}
        <div class="chat-msg-content-wrapper">
          <div class="chat-message-bubble">
            <span class="chat-bubble-text">${escapeHtml(msg.text)}</span>
            <button type="button" class="btn-msg-delete" onclick="deleteIndividualMessage('${msg.id}')" title="Excluir esta mensagem" aria-label="Excluir esta mensagem">
              ✕
            </button>
          </div>
          <div class="chat-message-meta">
            <span>${timeStr}</span>
            ${isMine ? `<span class="chat-check-read" title="${msg.read ? 'Lida' : 'Enviada'}">✓✓</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  stream.innerHTML = html;
  stream.scrollTop = stream.scrollHeight;
}

function sendChatMessage(text) {
  if (!appState.currentUser || !appState.selectedChatFriendId) return;

  const cleanText = (text || '').trim();
  if (!cleanText) return;

  const currentId = appState.currentUser.id;
  const friendId = appState.selectedChatFriendId;

  // Validação de Segurança: Somente amigos confirmados podem trocar mensagens diretas
  const friendIds = getAcceptedFriendIds(currentId);
  if (!friendIds.includes(friendId)) {
    showToast('Não Permitido', 'Você só pode enviar mensagens para quem adicionou como amigo.', '⚠️');
    return;
  }

  if (hasUserBlocked(currentId, friendId) || hasUserBlocked(friendId, currentId)) {
    showToast('Bloqueado', 'Não é possível trocar mensagens com usuários bloqueados.', '🚫');
    return;
  }

  const now = Date.now();
  const dateObj = new Date(now);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const createdAtFormatted = `${day}/${month}/${year} ${hours}:${minutes}`;

  const newMsg = {
    id: 'msg_' + now + '_' + Math.random().toString(36).substr(2, 6),
    senderId: currentId,
    receiverId: friendId,
    text: cleanText,
    timestamp: now,
    createdAt: createdAtFormatted,
    read: false
  };

  appState.messages.push(newMsg);
  saveMessagesDatabase();

  // Limpa o campo
  const inputEl = document.getElementById('chatMessageInput');
  if (inputEl) inputEl.value = '';

  // Atualiza conversa e lista lateral
  renderActiveChat();
  renderChatFriendsList();

  // Simula resposta contextual do amigo após breve intervalo (animação viva)
  simulateFriendResponse(friendId, cleanText);
}

function simulateFriendResponse(friendId, userText) {
  const friend = (appState.users || []).find(u => u.id === friendId);
  if (!friend) return;

  const typingIndicator = document.getElementById('chatTypingIndicator');
  const typingAvatar = document.getElementById('typingAvatar');
  const typingText = document.getElementById('typingText');
  const stream = document.getElementById('chatMessagesStream');

  // Mostra indicador de digitação após 600ms
  setTimeout(() => {
    // Se o usuário ainda estiver na conversa com este amigo
    if (appState.selectedChatFriendId === friendId && typingIndicator) {
      const initial = friend.name ? friend.name.charAt(0).toUpperCase() : 'U';
      if (typingAvatar) {
        typingAvatar.innerHTML = friend.avatar ? `<img src="${friend.avatar}" alt="${escapeAttr(friend.name)}">` : initial;
      }
      if (typingText) {
        typingText.textContent = `${friend.name.split(' ')[0]} está digitando...`;
      }
      typingIndicator.style.display = 'flex';
      if (stream) stream.scrollTop = stream.scrollHeight;
    }
  }, 600);

  // Resposta simulada após 1800ms
  setTimeout(() => {
    if (typingIndicator) typingIndicator.style.display = 'none';

    // Gera texto em personagem com base na personalidade e afinidade
    const lower = (userText || '').toLowerCase();
    let replyText = '';

    if (friendId === 'usr_mariacine') {
      if (lower.includes('filme') || lower.includes('cinema') || lower.includes('pipoca') || lower.includes('🍿') || lower.includes('🎬')) {
        replyText = 'Adorei! O cinema tem esse poder único de transportar a gente para outros mundos. Já preparou a pipoca para a próxima sessão? 🍿🎬';
      } else if (lower.includes('severance') || lower.includes('ruptura') || lower.includes('serie')) {
        replyText = 'Nem me fale de Severance! A tensão em cada cena da Lumon é maravilhosa. Você já terminou a 1ª temporada? Não vejo a hora da próxima!';
      } else if (lower.includes('blade runner') || lower.includes('sci-fi') || lower.includes('duna') || lower.includes('interestelar')) {
        replyText = 'A estética visual e a trilha sonora desses filmes são obras-primas da ficção científica! Denis Villeneuve e Christopher Nolan elevaram o gênero a outro patamar. ✨';
      } else if (lower.includes('⭐') || lower.includes('5') || lower.includes('top') || lower.includes('nota')) {
        replyText = 'Nota 5 com louvor! Quando uma obra mexe com a gente desse jeito, tem que entrar para o Hall da Fama do acervo! 🌟';
      } else {
        const defaultReplies = [
          'Muito legal você comentar isso! Vou até adicionar uma anotação no meu diário cultural do Keeplay. 📝✨',
          'Concordo plenamente! Nossa afinidade cultural não mente, a gente pensa super parecido sobre entretenimento! 🍿👥',
          'Que recomendação maravilhosa! Já marquei como "Quero Assistir" no meu catálogo. O que mais você me indica?'
        ];
        replyText = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      }
    } else if (friendId === 'usr_lucasgames') {
      if (lower.includes('jogo') || lower.includes('game') || lower.includes('elden ring') || lower.includes('🎮')) {
        replyText = 'Cara, os games souls são os maiores desafios que já joguei! Se você curte ação e exploração, zerar Elden Ring é obrigatório 🎮🏆';
      } else {
        replyText = 'Boa demaaaais! Vou continuar a campanha do meu backlog hoje à noite. Valeu pela mensagem parceiro! ⚔️👾';
      }
    } else if (friendId === 'usr_carolbooks') {
      if (lower.includes('livro') || lower.includes('ler') || lower.includes('leitura') || lower.includes('📚')) {
        replyText = 'Ai que delícia encontrar quem ama conversar sobre livros! A construção de mundo de histórias fantásticas é sempre inspiradora 📚📖';
      } else {
        replyText = 'Muito bom trocar essa ideia com você! Sempre bom ter amigos no Keeplay com gostos tão envolventes! ✨';
      }
    } else {
      replyText = 'Muito legal! Obrigado por mandar mensagem por aqui no chat do Keeplay! Vamos manter o papo em dia e acompanhar os acervos! 💬✨';
    }

    const now = Date.now();
    const dateObj = new Date(now);
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const createdAtFormatted = `${day}/${month}/${year} ${hours}:${minutes}`;

    const isCurrentChatOpen = appState.currentView === 'chats' && appState.selectedChatFriendId === friendId;

    const replyMsg = {
      id: 'msg_' + now + '_' + Math.random().toString(36).substr(2, 6),
      senderId: friendId,
      receiverId: appState.currentUser.id,
      text: replyText,
      timestamp: now,
      createdAt: createdAtFormatted,
      read: isCurrentChatOpen // se o usuário já estiver com a conversa aberta na tela, marca como lida
    };

    appState.messages.push(replyMsg);
    saveMessagesDatabase();

    // Se estiver com o chat aberto, renderiza na hora e rola até o fim
    if (isCurrentChatOpen) {
      renderActiveChat();
    } else {
      // Se estiver em outra aba, avisa com toast sutil
      showToast(`Nova Mensagem de ${friend.name}`, replyText.length > 55 ? replyText.substring(0, 52) + '...' : replyText, '💬');
    }

    renderChatFriendsList();
  }, 1900);
}

// Atalho Global para Iniciar Chat a partir de Qualquer Lugar (ex: Cartão da Comunidade, Catálogo)
window.openChatWithUser = function(friendId) {
  if (!appState.currentUser) return;

  const currentId = appState.currentUser.id;
  const friendIds = getAcceptedFriendIds(currentId);

  if (!friendIds.includes(friendId)) {
    const targetUser = (appState.users || []).find(u => u.id === friendId);
    if (!targetUser) {
      showToast('Aviso', 'Usuário não encontrado.', '⚠️');
      return;
    }

    // Se houver solicitação pendente do target para o usuário, aceita
    const pendingIncoming = (appState.connections || []).find(c => 
      c.requesterId === friendId && c.addresseeId === currentId && c.status === 'pending'
    );

    if (pendingIncoming) {
      pendingIncoming.status = 'accepted';
      pendingIncoming.updatedAt = new Date().toLocaleDateString('pt-BR');
      saveConnectionsDatabase(false);
      showToast('Amizade Aceita', `Agora você e ${targetUser.name} estão conectados no Chat!`, '🤝');
    } else {
      let conn = getConnectionBetween(currentId, friendId);
      if (conn) {
        conn.status = 'accepted';
        conn.updatedAt = new Date().toLocaleDateString('pt-BR');
      } else {
        const newConn = {
          id: 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          requesterId: currentId,
          addresseeId: friendId,
          status: 'accepted',
          createdAt: new Date().toLocaleDateString('pt-BR'),
          updatedAt: new Date().toLocaleDateString('pt-BR')
        };
        appState.connections.push(newConn);
      }
      saveConnectionsDatabase(false);
      showToast('Conectado', `Amizade com ${targetUser.name} confirmada! Chat aberto.`, '💬');
    }
  }

  // Abre aba de chats e seleciona o amigo
  switchView('chats');
  selectChatFriend(friendId);
};

// Exclusão de Conversa Completa com um Amigo [RF-20]
function deleteChatWithFriend(friendId) {
  if (!appState.currentUser || !friendId) return;

  const currentId = appState.currentUser.id;
  const friend = (appState.users || []).find(u => u.id === friendId);
  const friendName = friend ? friend.name : 'este contato';

  const confirmMsg = `Deseja realmente apagar todo o histórico de conversa com ${friendName}?\n\nTodas as mensagens trocadas serão excluídas permanentemente para você.`;
  if (!window.confirm(confirmMsg)) return;

  loadMessagesDatabase();
  const countBefore = (appState.messages || []).length;
  appState.messages = (appState.messages || []).filter(m => 
    !((m.senderId === currentId && m.receiverId === friendId) ||
      (m.senderId === friendId && m.receiverId === currentId))
  );
  const deletedCount = countBefore - appState.messages.length;

  saveMessagesDatabase();

  renderChatFriendsList();
  if (appState.selectedChatFriendId === friendId) {
    renderActiveChat();
  }
  updateChatUnreadBadge();

  showToast(
    'Chat Excluído',
    deletedCount > 0 
      ? `Histórico de ${deletedCount} ${deletedCount === 1 ? 'mensagem' : 'mensagens'} com ${friendName} foi apagado.`
      : `O histórico de conversa com ${friendName} foi limpo.`,
    '🗑️'
  );
}

// Exclusão de Mensagem Individual do Fluxo [RF-20]
function deleteIndividualMessage(messageId) {
  if (!appState.currentUser || !messageId) return;

  if (!window.confirm('Deseja excluir esta mensagem permanentemente?')) return;

  loadMessagesDatabase();
  const countBefore = (appState.messages || []).length;
  appState.messages = (appState.messages || []).filter(m => m.id !== messageId);

  if (appState.messages.length < countBefore) {
    saveMessagesDatabase();
    renderActiveChat();
    renderChatFriendsList();
    updateChatUnreadBadge();
    showToast('Mensagem Excluída', 'A mensagem foi removida do chat.', '🗑️');
  }
}

window.deleteChatWithFriend = deleteChatWithFriend;
window.deleteIndividualMessage = deleteIndividualMessage;

function hasUserBlocked(blockerId, targetId) {
  if (!blockerId || !targetId) return false;
  return (appState.blocks || []).some(b => b.blockerId === blockerId && b.blockedId === targetId);
}

function isUserBlocked(userAId, userBId) {
  if (!userAId || !userBId) return false;
  return (appState.blocks || []).some(b => 
    (b.blockerId === userAId && b.blockedId === userBId) ||
    (b.blockerId === userBId && b.blockedId === userAId)
  );
}

window.blockUser = function(targetUserId) {
  if (!appState.currentUser) return;
  const myId = appState.currentUser.id;
  if (myId === targetUserId) return;

  loadBlocksDatabase();
  if (hasUserBlocked(myId, targetUserId)) {
    showToast('Já Bloqueado', 'Este usuário já está na sua lista de bloqueios.', 'ℹ️');
    return;
  }

  const targetUser = (appState.users || []).find(u => u.id === targetUserId);
  const targetName = targetUser ? targetUser.name : 'Membro';

  const newBlock = {
    id: 'blk_' + Date.now(),
    blockerId: myId,
    blockedId: targetUserId,
    createdAt: new Date().toLocaleDateString('pt-BR')
  };

  appState.blocks.push(newBlock);
  saveBlocksDatabase();

  // Rompe qualquer conexão de amizade ou pedido pendente imediatamente [RF-18]
  loadConnectionsDatabase();
  appState.connections = (appState.connections || []).filter(c => 
    !((c.requesterId === myId && c.addresseeId === targetUserId) ||
      (c.requesterId === targetUserId && c.addresseeId === myId))
  );
  saveConnectionsDatabase();

  showToast('Usuário Bloqueado', `Você bloqueou ${targetName}. O perfil e amizade foram restringidos.`, '🚫');

  // Atualiza UIs
  renderCommunityGrid();
  renderBlockedUsersList();
  renderActivityFeed();
  renderCommunityRequests();
  updatePendingBadge();
  updateBlockedBadge();
};

window.unblockUser = function(targetUserId) {
  if (!appState.currentUser) return;
  const myId = appState.currentUser.id;

  loadBlocksDatabase();
  appState.blocks = (appState.blocks || []).filter(b => !(b.blockerId === myId && b.blockedId === targetUserId));
  saveBlocksDatabase();

  const targetUser = (appState.users || []).find(u => u.id === targetUserId);
  const targetName = targetUser ? targetUser.name : 'Membro';

  showToast('Usuário Desbloqueado', `${targetName} foi removido da sua lista de bloqueios.`, '🔓');

  renderCommunityGrid();
  renderBlockedUsersList();
  renderActivityFeed();
  updateBlockedBadge();
};

function renderBlockedUsersList() {
  const container = document.getElementById('blockedUsersListContainer');
  if (!container || !appState.currentUser) return;

  loadBlocksDatabase();
  loadUsersDatabase();
  const myId = appState.currentUser.id;
  const myBlocks = (appState.blocks || []).filter(b => b.blockerId === myId);

  if (myBlocks.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); max-width: 580px; margin: 1.5rem auto;">
        <div style="font-size: 2.8rem; margin-bottom: 0.65rem; opacity: 0.6;">🛡️</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.35rem;">Nenhum usuário bloqueado</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Sua convivência está tranquila! Quando você bloquear um membro, ele aparecerá aqui com opção de desbloqueio.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myBlocks.map(block => {
    const user = (appState.users || []).find(u => u.id === block.blockedId);
    const name = user ? user.name : 'Usuário';
    const username = user ? user.username : 'desconhecido';
    const initial = name.charAt(0).toUpperCase();
    const avatarHtml = (user && user.avatar) 
      ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;" alt="${name}">` 
      : initial;

    return `
      <div class="blocked-item-card">
        <div class="blocked-item-left">
          <div class="blocked-avatar">${avatarHtml}</div>
          <div class="blocked-info">
            <h4>${escapeHtml(name)}</h4>
            <p>@${escapeHtml(username)} • Bloqueado em ${block.createdAt || 'recente'}</p>
          </div>
        </div>
        <button type="button" class="btn-unblock-sm" onclick="unblockUser('${block.blockedId}')" title="Remover bloqueio">
          <span>🔓</span> Desbloquear
        </button>
      </div>
    `;
  }).join('');
}

function updateBlockedBadge() {
  if (!appState.currentUser) return;
  const myId = appState.currentUser.id;
  const myBlocks = (appState.blocks || []).filter(b => b.blockerId === myId);
  const badge = document.getElementById('blockedUsersCountBadge');
  if (badge) {
    if (myBlocks.length > 0) {
      badge.textContent = myBlocks.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ==========================================================================
// Sistema de Denúncia de Conteúdo (Reporting)
// ==========================================================================

window.openReportModal = function(data) {
  if (!appState.currentUser) return;
  
  const modal = document.getElementById('reportModal');
  if (!modal) return;

  document.getElementById('reportItemId').value = data.itemId || '';
  document.getElementById('reportAuthorId').value = data.reportedUserId || '';
  document.getElementById('reportActivityId').value = data.activityId || '';

  const authorEl = document.getElementById('reportAuthorName');
  if (authorEl) authorEl.textContent = data.authorName ? `@${data.authorName}` : '@membro';

  const mediaEl = document.getElementById('reportMediaTitle');
  if (mediaEl) mediaEl.textContent = data.mediaTitle ? `em "${data.mediaTitle}"` : '';

  const snippetEl = document.getElementById('reportCommentSnippet');
  if (snippetEl) {
    const text = data.commentText || '';
    snippetEl.textContent = text.length > 140 ? text.substring(0, 140) + '...' : text;
  }

  // Reset motivo para spoiler_unmarked
  const firstRadio = document.querySelector('input[name="reportReason"][value="spoiler_unmarked"]');
  if (firstRadio) firstRadio.checked = true;

  const detailsInput = document.getElementById('reportDetailsInput');
  if (detailsInput) detailsInput.value = '';

  openModal('reportModal');
};

function handleReportSubmit(e) {
  e.preventDefault();
  if (!appState.currentUser) return;

  const btnSubmit = document.getElementById('btnSubmitReport');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    setTimeout(() => { if (btnSubmit) btnSubmit.disabled = false; }, 800);
  }

  const itemId = document.getElementById('reportItemId').value;
  const reportedUserId = document.getElementById('reportAuthorId').value;
  const activityId = document.getElementById('reportActivityId').value;
  const reasonRadio = document.querySelector('input[name="reportReason"]:checked');
  const reason = reasonRadio ? reasonRadio.value : 'other';
  const details = (document.getElementById('reportDetailsInput')?.value || '').trim();

  loadReportsDatabase();
  const newReport = {
    id: 'rep_' + Date.now(),
    reporterId: appState.currentUser.id,
    reportedUserId,
    itemId,
    activityId,
    reason,
    details,
    status: 'pending_review',
    createdAt: new Date().toLocaleDateString('pt-BR')
  };

  appState.reports.push(newReport);
  saveReportsDatabase();
  closeModal('reportModal');

  // Mitigação imediata: se for spoiler não demarcado, aplica blur na hora
  if (reason === 'spoiler_unmarked') {
    if (activityId) {
      const act = (appState.activityFeed || []).find(a => a.id === activityId);
      if (act) {
        act.isSpoiler = true;
        saveFeedDatabase();
        renderActivityFeed();
      }
    }
    if (itemId && reportedUserId) {
      loadUsersDatabase();
      const targetUser = (appState.users || []).find(u => u.id === reportedUserId);
      if (targetUser) {
        const item = (targetUser.items || []).find(i => i.id === itemId);
        if (item) {
          item.isSpoiler = true;
          saveUsersDatabase();
        }
      }
    }
    showToast(
      'Denúncia Enviada',
      'Obrigado! O comentário foi mascarado com alerta de spoiler para proteger sua experiência.',
      '🛡️'
    );
  } else {
    showToast(
      'Denúncia Registrada',
      'Obrigado por ajudar a manter o Keeplay saudável. O comentário foi enviado para moderação.',
      '🚨'
    );
  }
}

// ==========================================================================
// Tagging e Alerta de Spoilers (Blur & Reveal)
// ==========================================================================

function formatCommentWithSpoiler(commentText, isSpoiler) {
  if (!commentText) return '';
  if (!isSpoiler) {
    return `<p class="media-comment">${escapeHtml(commentText)}</p>`;
  }
  return `
    <div class="spoiler-container is-blurred" onclick="toggleSpoilerBlur(this)" title="Clique para revelar ou ocultar o spoiler">
      <div class="spoiler-header-bar">
        <span class="spoiler-badge">⚠️ SPOILER</span>
        <span class="spoiler-toggle-hint">👁️ Revelar</span>
      </div>
      <p class="spoiler-text-content">${escapeHtml(commentText)}</p>
    </div>
  `;
}

window.toggleSpoilerBlur = function(el) {
  const container = el.classList.contains('spoiler-container') ? el : el.closest('.spoiler-container');
  if (!container) return;
  const isBlurred = container.classList.toggle('is-blurred');
  const hintEl = container.querySelector('.spoiler-toggle-hint');
  if (hintEl) {
    hintEl.innerHTML = isBlurred ? '👁️ Revelar' : '🙈 Ocultar';
  }
};

function escapeAttr(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, ' ');
}

function saveCurrentUser() {
  if (!appState.currentUser) return;
  const index = appState.users.findIndex(u => u.id === appState.currentUser.id);
  if (index !== -1) {
    appState.users[index] = { ...appState.currentUser };
  } else {
    appState.users.push(appState.currentUser);
  }
  saveUsersDatabase();
  renderProfileUI();
  updateGamificationUI();
}

// ==========================================================================
// Sessão & Autenticação
// ==========================================================================

function checkSession() {
  loadUsersDatabase();
  loadConnectionsDatabase();
  const activeUserId = localStorage.getItem('keeplay_active_user_id') || localStorage.getItem('catalogogeral_active_user_id');

  if (activeUserId) {
    const user = appState.users.find(u => u.id === activeUserId);
    if (user) {
      appState.currentUser = user;
      showAppView();
      return;
    }
  }

  showAuthView();
}

function showAuthView() {
  document.getElementById('authSection').style.display = 'flex';
  document.getElementById('appSection').style.display = 'none';
}

function showAppView() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'flex';
  renderProfileUI();
  updateGamificationUI();
  renderMediaGrid();
  renderCustomLists();
  renderMonthlyMissions();
  renderCommunityGrid();
  renderCommunityRequests();
  renderActivityFeed();
  renderProfileDashboard();
  updatePendingBadge();
  updateChatUnreadBadge();
}

function handleLogin(e) {
  e.preventDefault();
  loadUsersDatabase();

  const identifier = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();
  const errorAlert = document.getElementById('loginError');

  const user = appState.users.find(u => 
    u.username && u.username.toLowerCase() === identifier &&
    u.password === password
  );

  if (user) {
    errorAlert.style.display = 'none';
    appState.currentUser = user;
    localStorage.setItem('keeplay_active_user_id', user.id);
    showAppView();
    showToast(`Bem-vindo, ${user.name}!`, 'Catálogo e estatísticas carregados.', '✨');
  } else {
    errorAlert.style.display = 'block';
    errorAlert.textContent = 'Usuário ou senha incorretos.';
  }
}

function handleRegister(e) {
  e.preventDefault();
  loadUsersDatabase();

  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const password = document.getElementById('regPassword').value.trim();
  const errorAlert = document.getElementById('loginError');

  if (!username || !password || !name) {
    errorAlert.style.display = 'block';
    errorAlert.textContent = 'Preencha todos os campos para cadastrar.';
    return;
  }

  const acceptTerms = document.getElementById('regAcceptTerms');
  if (!acceptTerms || !acceptTerms.checked) {
    errorAlert.style.display = 'block';
    errorAlert.textContent = 'Você precisa ler e concordar com os Termos de Uso e Proteção de Dados (LGPD) para criar sua conta.';
    if (acceptTerms) acceptTerms.focus();
    return;
  }

  const userExists = appState.users.some(u => u.username && u.username.toLowerCase() === username);
  if (userExists) {
    errorAlert.style.display = 'block';
    errorAlert.textContent = `O nome de usuário "@${username}" já está em uso.`;
    return;
  }

  errorAlert.style.display = 'none';

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    username,
    password,
    avatar: '',
    bio: 'Novo explorador cultural no Keeplay.',
    isPrivate: false,
    equippedTitle: 'Iniciante Curioso',
    unlockedTitles: ['Iniciante Curioso'],
    acceptedTermsAt: new Date().toISOString(),
    friends: [],
    unlockedAchievements: [],
    claimedMissions: [],
    customLists: [],
    items: []
  };

  appState.users.push(newUser);
  saveUsersDatabase();

  appState.currentUser = newUser;
  localStorage.setItem('keeplay_active_user_id', newUser.id);

  document.getElementById('registerForm').reset();
  document.getElementById('loginForm').reset();

  showAppView();
  ConfettiEngine.trigger(3000);
  showToast('Conta Criada!', `Bem-vindo ao Keeplay, ${name}!`, '🎉');
}

function handleLogout() {
  localStorage.removeItem('keeplay_active_user_id');
  localStorage.removeItem('catalogogeral_active_user_id');
  appState.currentUser = null;
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  showAuthView();
}

// ==========================================================================
// Navegação Principal & Sub-Abas
// ==========================================================================

function switchView(viewName) {
  appState.currentView = viewName;

  const catalogView = document.getElementById('catalogView');
  const communityView = document.getElementById('communityView');
  const chatsView = document.getElementById('chatsView');
  const profileView = document.getElementById('profileView');

  // Botões do cabeçalho desktop
  const btnCatalog = document.getElementById('btnViewCatalog');
  const btnCommunity = document.getElementById('btnViewCommunity');
  const btnChats = document.getElementById('btnViewChats');
  const btnProfile = document.getElementById('btnViewProfile');

  // Botões do dock inferior mobile
  const mobileCatalog = document.getElementById('mobileNavCatalog');
  const mobileCommunity = document.getElementById('mobileNavCommunity');
  const mobileChats = document.getElementById('mobileNavChats');
  const mobileProfile = document.getElementById('mobileNavProfile');

  const allNavBtns = [
    btnCatalog, btnCommunity, btnChats, btnProfile,
    mobileCatalog, mobileCommunity, mobileChats, mobileProfile
  ].filter(Boolean);

  allNavBtns.forEach(b => b.classList.remove('active'));
  [catalogView, communityView, chatsView, profileView].filter(Boolean).forEach(v => v.style.display = 'none');

  if (viewName === 'catalog') {
    catalogView.style.display = 'block';
    if (btnCatalog) btnCatalog.classList.add('active');
    if (mobileCatalog) mobileCatalog.classList.add('active');
    renderMediaGrid();
  } else if (viewName === 'community') {
    communityView.style.display = 'block';
    if (btnCommunity) btnCommunity.classList.add('active');
    if (mobileCommunity) mobileCommunity.classList.add('active');
    renderCommunityGrid();
    renderActivityFeed();
  } else if (viewName === 'chats') {
    if (chatsView) chatsView.style.display = 'block';
    if (btnChats) btnChats.classList.add('active');
    if (mobileChats) mobileChats.classList.add('active');
    renderChatsView();
  } else if (viewName === 'profile') {
    profileView.style.display = 'block';
    if (btnProfile) btnProfile.classList.add('active');
    if (mobileProfile) mobileProfile.classList.add('active');
    renderProfileUI();
    renderProfileDashboard();
  }

  // Rola suavemente ao topo para conforto do usuário no celular
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchCatalogSubTab(subTabName) {
  appState.currentCatalogSubTab = subTabName;

  const tabCatalog = document.getElementById('subTabCatalog');
  const tabLists = document.getElementById('subTabLists');
  const tabMissions = document.getElementById('subTabMissions');

  const secAcervo = document.getElementById('catalogAcervoSection');
  const secLists = document.getElementById('catalogListsSection');
  const secMissions = document.getElementById('catalogMissionsSection');

  [tabCatalog, tabLists, tabMissions].forEach(t => t.classList.remove('active'));
  [secAcervo, secLists, secMissions].forEach(s => s.style.display = 'none');

  if (subTabName === 'catalog') {
    tabCatalog.classList.add('active');
    secAcervo.style.display = 'block';
    renderMediaGrid();
  } else if (subTabName === 'lists') {
    tabLists.classList.add('active');
    secLists.style.display = 'block';
    renderCustomLists();
  } else if (subTabName === 'missions') {
    tabMissions.classList.add('active');
    secMissions.style.display = 'block';
    renderMonthlyMissions();
  }
}

function switchCommunitySubTab(subTabName) {
  appState.currentCommunitySubTab = subTabName;

  const tabMembers = document.getElementById('subTabCommunityMembers');
  const tabRequests = document.getElementById('subTabCommunityRequests');
  const tabFeed = document.getElementById('subTabCommunityFeed');
  const tabBlocked = document.getElementById('subTabCommunityBlocked');

  const secMembers = document.getElementById('communityMembersSection');
  const secRequests = document.getElementById('communityRequestsSection');
  const secFeed = document.getElementById('communityFeedSection');
  const secBlocked = document.getElementById('communityBlockedSection');

  [tabMembers, tabRequests, tabFeed, tabBlocked].forEach(t => t && t.classList.remove('active'));
  [secMembers, secRequests, secFeed, secBlocked].forEach(s => s && (s.style.display = 'none'));

  if (subTabName === 'members') {
    if (tabMembers) tabMembers.classList.add('active');
    if (secMembers) secMembers.style.display = 'block';
    renderCommunityGrid();
  } else if (subTabName === 'requests') {
    if (tabRequests) tabRequests.classList.add('active');
    if (secRequests) secRequests.style.display = 'block';
    renderCommunityRequests();
  } else if (subTabName === 'blocked') {
    if (tabBlocked) tabBlocked.classList.add('active');
    if (secBlocked) secBlocked.style.display = 'block';
    renderBlockedUsersList();
  } else {
    if (tabFeed) tabFeed.classList.add('active');
    if (secFeed) secFeed.style.display = 'block';
    renderActivityFeed();
  }
  updatePendingBadge();
  updateBlockedBadge();
}

// ==========================================================================
// Gamificação (XP, Níveis, Títulos & Missões Mensais)
// ==========================================================================

function calculateItemXp(rating, commentText, status = 'assistido') {
  const baseXp = 50;
  const ratingBonus = Number(rating) * 10;
  const commentBonus = (commentText && commentText.trim().length >= 30) ? 30 : 0;
  const platinaBonus = status === 'platinado' ? 40 : 0;
  return baseXp + ratingBonus + commentBonus + platinaBonus;
}

function calculateCurrentLevel(totalXp) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_TIERS[i].minXp) {
      const tier = LEVEL_TIERS[i];
      let percent = 100;
      if (tier.maxXp !== Infinity) {
        const range = tier.maxXp - tier.minXp;
        const currentProgress = totalXp - tier.minXp;
        percent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
      }
      return { ...tier, percent, totalXp };
    }
  }
  return { ...LEVEL_TIERS[0], percent: 0, totalXp };
}

function getAvailableTitlesForUser(user) {
  if (!user) return ['Iniciante Curioso'];
  const items = user.items || [];
  const totalXp = items.reduce((acc, i) => acc + (i.xpGained || 50), 0);
  const lvlInfo = calculateCurrentLevel(totalXp);

  const titles = ['Iniciante Curioso'];
  if (lvlInfo.level >= 2) titles.push('Explorador Cultural');
  if (lvlInfo.level >= 3) titles.push('Crítico Entusiasta');
  if (lvlInfo.level >= 4) titles.push('Conhecedor Multimídia');
  if (lvlInfo.level >= 5) titles.push('Mestre da Cultura Pop');
  if (lvlInfo.level >= 6) titles.push('Lenda dos Registros');
  if (lvlInfo.level >= 7) titles.push('Oráculo Cultural');

  // Títulos especiais por conquistas
  if (items.some(i => i.status === 'platinado')) titles.push('Platinador Lendário 🏆');
  if (items.filter(i => i.category === 'filme').length >= 5) titles.push('Cinéfilo Noturno 🎬');
  if (items.filter(i => i.category === 'livro').length >= 3) titles.push('Rato de Biblioteca 📚');
  if ((user.customLists || []).length >= 2) titles.push('Curador de Obras 📑');

  return Array.from(new Set(titles));
}

function updateGamificationUI() {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];
  const totalXp = items.reduce((acc, item) => acc + (item.xpGained || 50), 0);
  const levelInfo = calculateCurrentLevel(totalXp);
  const equippedTitle = appState.currentUser.equippedTitle || levelInfo.title;

  // Topbar
  document.getElementById('levelNumber').textContent = `Nível ${levelInfo.level}`;
  document.getElementById('xpCurrentText').textContent = `${totalXp} XP`;
  document.getElementById('xpNextText').textContent = levelInfo.maxXp === Infinity 
    ? 'Nível Máximo' 
    : `/ ${levelInfo.maxXp} XP`;
  document.getElementById('xpProgressBar').style.width = `${levelInfo.percent}%`;

  // Hero Catálogo
  document.getElementById('heroEquippedTitle').textContent = `👑 ${equippedTitle}`;
  document.getElementById('levelTitleDesc').textContent = `Nível ${levelInfo.level} • ${levelInfo.title}`;
  document.getElementById('statTotalItems').textContent = items.length;
  document.getElementById('statTotalXp').textContent = totalXp;

  // Média de Avaliação
  if (items.length > 0) {
    const avg = items.reduce((acc, i) => acc + Number(i.rating), 0) / items.length;
    document.getElementById('statAverageRating').textContent = avg.toFixed(1);
  } else {
    document.getElementById('statAverageRating').textContent = '0.0';
  }

  // Horas Totais
  const totalHours = items.reduce((acc, i) => acc + Number(i.progress?.hours || 0), 0);
  const hoursEl = document.getElementById('statHoursSpent');
  if (hoursEl) hoursEl.textContent = `${Math.round(totalHours)}h`;

  // Estatísticas no Card de Perfil
  const profileStatItems = document.getElementById('profileStatItems');
  if (profileStatItems) profileStatItems.textContent = items.length;

  const profileStatLevel = document.getElementById('profileStatLevel');
  if (profileStatLevel) profileStatLevel.textContent = `Nv. ${levelInfo.level}`;

  const profileStatPlatinas = document.getElementById('profileStatPlatinas');
  if (profileStatPlatinas) {
    const platinas = items.filter(i => i.status === 'platinado').length;
    profileStatPlatinas.textContent = platinas;
  }

  const profileStatHours = document.getElementById('profileStatHours');
  if (profileStatHours) profileStatHours.textContent = `${Math.round(totalHours)}h`;

  const profileStatLists = document.getElementById('profileStatLists');
  if (profileStatLists) profileStatLists.textContent = (appState.currentUser.customLists || []).length;

  const profileStatBadges = document.getElementById('profileStatBadges');
  if (profileStatBadges) profileStatBadges.textContent = (appState.currentUser.unlockedAchievements || []).length;

  checkAndAwardAchievements();
}

function checkAndAwardAchievements(silent = false) {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];
  const savedUnlocked = appState.currentUser.unlockedAchievements || [];
  const newlyUnlocked = [];

  ACHIEVEMENTS_DEF.forEach(ach => {
    if (!savedUnlocked.includes(ach.id) && ach.check(items)) {
      savedUnlocked.push(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    appState.currentUser.unlockedAchievements = savedUnlocked;
    saveCurrentUser();

    if (!silent) {
      ConfettiEngine.trigger(3400);
      newlyUnlocked.forEach(ach => {
        const isSecret = ach.isSecret;
        showToast(
          isSecret ? '🤫 Conquista Secreta Revelada!' : 'Conquista Desbloqueada!',
          `${ach.icon} <strong>${ach.name}</strong>: ${ach.desc}`,
          ach.icon,
          true
        );

        // Gera evento no feed de amigos
        addActivityFeedEvent({
          type: 'achievement',
          title: `desbloqueou a conquista "${ach.name}" ${ach.icon}`,
          mediaTitle: ach.desc,
          comment: isSecret ? 'Uma conquista secreta foi desvendada!' : 'Mais um marco alcançado no Keeplay.'
        });
      });
    }
  }

  const badgeCount = document.getElementById('unlockedBadgesCount');
  if (badgeCount) {
    badgeCount.textContent = `${savedUnlocked.length}/${ACHIEVEMENTS_DEF.length}`;
  }
}

function renderAchievementsModal() {
  const container = document.getElementById('achievementsList');
  if (!container || !appState.currentUser) return;

  const items = appState.currentUser.items || [];
  const unlocked = appState.currentUser.unlockedAchievements || [];

  const filtered = ACHIEVEMENTS_DEF.filter(ach => {
    return appState.selectedAchCategory === 'todos' || ach.category === appState.selectedAchCategory;
  });

  container.innerHTML = filtered.map(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    const isSecret = ach.isSecret;

    // Se a conquista é secreta e ainda está bloqueada, mascara nome e descrição
    const displayName = (isSecret && !isUnlocked) ? 'Conquista Secreta' : ach.name;
    const displayDesc = (isSecret && !isUnlocked) ? '??? Esta conquista é um enigma. Continue registrando e explorando para desvendá-la.' : ach.desc;
    const displayIcon = (isSecret && !isUnlocked) ? '❓' : ach.icon;

    const progress = ach.getProgress ? ach.getProgress(items) : { current: isUnlocked ? 1 : 0, target: 1 };
    const pct = isUnlocked ? 100 : Math.min(100, Math.round((progress.current / progress.target) * 100));

    const cardClass = isSecret 
      ? (isUnlocked ? 'achievement-card secret-unlocked' : 'achievement-card secret-locked')
      : (isUnlocked ? 'achievement-card unlocked' : 'achievement-card locked');

    return `
      <div class="${cardClass}">
        <div class="achievement-icon">${displayIcon}</div>
        <div class="achievement-details">
          <div class="achievement-title-row">
            <span class="achievement-name">${displayName}</span>
            <span class="achievement-status">${isUnlocked ? '✓ Desbloqueada' : (isSecret ? '🔒 Bloqueada' : 'Em Progresso')}</span>
          </div>
          <p class="achievement-desc">${displayDesc}</p>
          
          <div class="achievement-progress-bar-wrap">
            <div class="ach-prog-track">
              <div class="ach-prog-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="ach-prog-text">${isUnlocked ? 'Concluída (100%)' : (isSecret ? '???/???' : `${progress.current}/${progress.target} (${pct}%)`)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Missões Mensais Temporárias
function renderMonthlyMissions() {
  const container = document.getElementById('monthlyMissionsGrid');
  if (!container || !appState.currentUser) return;

  const items = appState.currentUser.items || [];
  const claimedList = appState.currentUser.claimedMissions || [];

  // Dias restantes no mês atual
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const timerEl = document.getElementById('missionsDaysRemaining');
  if (timerEl) timerEl.textContent = `${daysRemaining} dias`;

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthTitle = document.getElementById('missionsMonthTitle');
  if (monthTitle) monthTitle.textContent = `Missões Temporárias de ${months[now.getMonth()]}`;

  container.innerHTML = MONTHLY_MISSIONS_POOL.map(m => {
    const current = m.check(items);
    const target = m.target;
    const isReady = current >= target;
    const isClaimed = claimedList.includes(m.id);
    const pct = Math.min(100, Math.round((current / target) * 100));

    return `
      <div class="mission-card ${isClaimed ? 'completed' : ''}">
        <div>
          <div class="mission-header">
            <div class="mission-icon">${m.icon}</div>
            <div class="mission-info">
              <h4>${m.title}</h4>
              <p>${m.desc}</p>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-muted);">Progresso: ${current}/${target}</span>
              <span class="mission-reward-badge">+${m.rewardXp} XP</span>
            </div>
            <div class="card-prog-track">
              <div class="card-prog-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          ${isClaimed 
            ? `<div style="text-align: center; color: var(--success); font-weight: 700; font-size: 0.85rem;">✓ Recompensa Resgatada</div>`
            : (isReady 
                ? `<button type="button" class="btn-claim-mission" onclick="claimMonthlyMission('${m.id}', ${m.rewardXp})">🎁 Resgatar +${m.rewardXp} XP</button>`
                : `<button type="button" class="btn-icon-text" style="width: 100%; justify-content: center;" disabled>Em Andamento (${pct}%)</button>`
              )
          }
        </div>
      </div>
    `;
  }).join('');
}

window.claimMonthlyMission = function(missionId, xpAmount) {
  if (!appState.currentUser) return;
  let claimed = appState.currentUser.claimedMissions || [];
  if (claimed.includes(missionId)) return;

  claimed.push(missionId);
  appState.currentUser.claimedMissions = claimed;

  // Cria item bônus de XP invisível ou atribui ao total
  const bonusItem = {
    id: 'mission_xp_' + Date.now(),
    title: 'Bônus de Missão Mensal',
    category: 'especial',
    status: 'concluida',
    rating: 5,
    comment: `Completou com sucesso a missão temporária do mês!`,
    coverImage: '',
    xpGained: xpAmount,
    progress: { hours: 0 },
    createdAt: new Date().toLocaleDateString('pt-BR')
  };

  appState.currentUser.items.push(bonusItem);
  saveCurrentUser();
  ConfettiEngine.trigger(3000);
  showToast('Missão Resgatada!', `Você ganhou <strong>+${xpAmount} XP</strong>!`, '🎁');
  renderMonthlyMissions();

  addActivityFeedEvent({
    type: 'mission',
    title: 'concluiu uma missão mensal',
    mediaTitle: 'Missão Sazonal Concluída',
    comment: `Ganhou +${xpAmount} XP por atingir as metas do mês.`
  });
};

// ==========================================================================
// Comunidade, Listas Personalizadas & Feed Social
// ==========================================================================

// 1. Listas Personalizadas
function renderCustomLists() {
  const grid = document.getElementById('customListsGrid');
  const countBadge = document.getElementById('userListsCount');
  if (!grid || !appState.currentUser) return;

  const lists = appState.currentUser.customLists || [];
  if (countBadge) countBadge.textContent = lists.length;

  if (lists.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <div style="font-size: 2.8rem; margin-bottom: 0.5rem; opacity: 0.7;">📑</div>
        <h3>Você ainda não possui nenhuma lista</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Crie coleções como "Top 10 Filmes de Ficção" ou "Jogos para Zerar nas Férias".</p>
        <button type="button" class="btn-primary" onclick="openCreateListModal()" style="width: auto; margin: 0 auto;">+ Criar Primeira Lista</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = lists.map(list => {
    const userItems = appState.currentUser.items || [];
    const listItems = userItems.filter(i => (list.itemIds || []).includes(i.id));

    // Mosaico de até 4 capas
    const covers = listItems.map(i => i.coverImage).filter(Boolean).slice(0, 4);
    const mosaicHtml = Array.from({ length: 4 }, (_, idx) => {
      if (covers[idx]) {
        return `<img src="${covers[idx]}" class="mosaic-thumb" alt="Capa">`;
      }
      return `<div class="mosaic-empty-slot">✦</div>`;
    }).join('');

    return `
      <div class="custom-list-card">
        <div>
          <div class="custom-list-top">
            <h4 class="custom-list-title">${escapeHtml(list.title)}</h4>
            <span class="custom-list-visibility ${list.isPublic ? 'public' : 'private'}">
              ${list.isPublic ? '🌐 Pública' : '🔒 Privada'}
            </span>
          </div>

          <p class="custom-list-desc">${escapeHtml(list.description || 'Sem descrição informada.')}</p>
          
          <div class="custom-list-mosaic">
            ${mosaicHtml}
          </div>
        </div>

        <div class="custom-list-footer">
          <span>${listItems.length} obras</span>
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="btn-item-edit" onclick="viewCustomList('${list.id}', '${appState.currentUser.id}')" title="Visualizar lista">
              Abrir
            </button>
            <button type="button" class="btn-item-delete" onclick="deleteCustomList('${list.id}')" title="Excluir lista">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openCreateListModal = function(editId = null) {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];
  const checklist = document.getElementById('listItemsSelectorList');
  const titleInput = document.getElementById('listTitleInput');
  const descInput = document.getElementById('listDescInput');
  const publicInput = document.getElementById('listIsPublic');
  const hiddenId = document.getElementById('editListId');

  hiddenId.value = editId || '';
  titleInput.value = '';
  descInput.value = '';
  publicInput.checked = true;

  if (items.length === 0) {
    checklist.innerHTML = `<p style="padding: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">Nenhuma obra no seu acervo para adicionar à lista.</p>`;
  } else {
    checklist.innerHTML = items.map(item => `
      <label class="item-checklist-row">
        <input type="checkbox" name="listItemsCheck" value="${item.id}">
        <span style="font-size: 0.9rem;">${escapeHtml(item.title)}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${getCategoryLabel(item.category)}</span>
      </label>
    `).join('');
  }

  openModal('customListModal');
};

window.saveCustomList = function(e) {
  e.preventDefault();
  if (!appState.currentUser) return;

  const title = document.getElementById('listTitleInput').value.trim();
  const description = document.getElementById('listDescInput').value.trim();
  const isPublic = document.getElementById('listIsPublic').checked;
  const editId = document.getElementById('editListId').value;

  const checkboxes = document.querySelectorAll('input[name="listItemsCheck"]:checked');
  const selectedIds = Array.from(checkboxes).map(c => c.value);

  let lists = appState.currentUser.customLists || [];

  if (editId) {
    const idx = lists.findIndex(l => l.id === editId);
    if (idx !== -1) {
      lists[idx] = { ...lists[idx], title, description, isPublic, itemIds: selectedIds };
    }
  } else {
    const newList = {
      id: 'list_' + Date.now(),
      title,
      description,
      isPublic,
      itemIds: selectedIds,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    lists.unshift(newList);

    // Adiciona evento no feed se a lista for pública
    if (isPublic) {
      addActivityFeedEvent({
        type: 'list',
        title: 'criou uma lista temática pública',
        mediaTitle: title,
        comment: description || 'Confira as obras selecionadas nesta nova coleção!'
      });
    }
  }

  appState.currentUser.customLists = lists;
  saveCurrentUser();
  closeModal('customListModal');
  renderCustomLists();
  showToast('Lista Salva!', `A lista "${title}" está disponível.`, '📑');
};

window.deleteCustomList = function(listId) {
  if (!appState.currentUser) return;
  if (confirm('Deseja realmente excluir esta lista personalizada?')) {
    appState.currentUser.customLists = (appState.currentUser.customLists || []).filter(l => l.id !== listId);
    saveCurrentUser();
    renderCustomLists();
    showToast('Lista Excluída', 'A coleção foi removida.', 'ℹ️');
  }
};

window.viewCustomList = function(listId, ownerId) {
  loadUsersDatabase();
  const owner = appState.users.find(u => u.id === ownerId);
  if (!owner) return;

  const list = (owner.customLists || []).find(l => l.id === listId);
  if (!list) return;

  const modalTitle = document.getElementById('viewCustomListTitle');
  const modalBody = document.getElementById('viewCustomListBody');

  modalTitle.textContent = `${list.title} (por ${owner.name})`;

  const items = (owner.items || []).filter(i => (list.itemIds || []).includes(i.id));

  if (items.length === 0) {
    modalBody.innerHTML = `
      <p style="color: var(--text-muted); padding: 1.5rem 0; text-align: center;">Nenhuma obra incluída nesta lista no momento.</p>
    `;
  } else {
    const canEdit = ownerId === appState.currentUser.id;
    const cardsHtml = items.map(item => renderMediaCardHtml(item, canEdit, { id: owner.id, name: owner.name })).join('');
    modalBody.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${escapeHtml(list.description || 'Sem descrição.')}</p>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          <strong>${items.length} obras</strong> selecionadas • Visibilidade: ${list.isPublic ? 'Pública' : 'Privada'}
        </div>
      </div>
      <div class="media-grid">
        ${cardsHtml}
      </div>
    `;
  }

  openModal('viewCustomListModal');
};

// 2. Medidor de Afinidade Cultural entre Perfis
function calculateCulturalAffinity(currentUser, otherUser) {
  if (!currentUser || !otherUser) return { percentage: 50, label: 'Gostos Ecléticos' };

  const myItems = currentUser.items || [];
  const otherItems = otherUser.items || [];

  if (myItems.length === 0 || otherItems.length === 0) {
    return { percentage: 50, label: 'Conexão em Potencial' };
  }

  // 1. Proporção por categoria
  const cats = ['filme', 'serie', 'livro', 'jogo'];
  let catScore = 0;
  cats.forEach(c => {
    const myPct = myItems.filter(i => i.category === c).length / myItems.length;
    const otherPct = otherItems.filter(i => i.category === c).length / otherItems.length;
    catScore += 1 - Math.abs(myPct - otherPct);
  });
  const catNormalized = (catScore / 4) * 45; // até 45 pontos

  // 2. Obras ou títulos com termos parecidos
  let sharedTitlesCount = 0;
  const myTitles = myItems.map(i => i.title.toLowerCase().trim());
  otherItems.forEach(oi => {
    if (myTitles.some(t => t.includes(oi.title.toLowerCase().trim()) || oi.title.toLowerCase().includes(t))) {
      sharedTitlesCount++;
    }
  });
  const sharedNormalized = Math.min(35, sharedTitlesCount * 18); // até 35 pontos

  // 3. Proximidade de notas médias
  const myAvg = myItems.reduce((acc, i) => acc + Number(i.rating), 0) / myItems.length;
  const otherAvg = otherItems.reduce((acc, i) => acc + Number(i.rating), 0) / otherItems.length;
  const ratingCloseness = Math.max(0, 1 - (Math.abs(myAvg - otherAvg) / 4)) * 20; // até 20 pontos

  let totalPct = Math.round(catNormalized + sharedNormalized + ratingCloseness);
  totalPct = Math.min(99, Math.max(35, totalPct));

  let label = '🔮 Gostos Ecléticos';
  if (totalPct >= 85) label = '🌟 Almas Gêmeas Culturais';
  else if (totalPct >= 72) label = '✨ Grande Sintonia';
  else if (totalPct >= 55) label = '🤝 Conexão Positiva';

  return { percentage: totalPct, label };
}

function renderCommunityGrid() {
  const grid = document.getElementById('communityGrid');
  if (!grid || !appState.currentUser) return;

  loadUsersDatabase();
  loadConnectionsDatabase();
  loadBlocksDatabase();
  const currentId = appState.currentUser.id;
  const query = (appState.communitySearchQuery || '').toLowerCase();

  // Filtragem: Não exibe membros que bloquearam o usuário logado [RF-18]
  const otherUsers = appState.users.filter(u => u.id !== currentId && !hasUserBlocked(u.id, currentId));
  const filteredUsers = otherUsers.filter(u => {
    if (!query) return true;
    return u.name.toLowerCase().includes(query) || 
           u.username.toLowerCase().includes(query) || 
           (u.bio && u.bio.toLowerCase().includes(query));
  });

  if (filteredUsers.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.7;">👥</div>
        <h3>Nenhum membro encontrado</h3>
        <p style="color: var(--text-muted);">Tente pesquisar por outro nome ou @usuário.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredUsers.map(user => {
    const conn = getConnectionBetween(currentId, user.id);
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    const userItems = user.items || [];
    const totalXp = userItems.reduce((acc, i) => acc + (i.xpGained || 50), 0);
    const levelInfo = calculateCurrentLevel(totalXp);
    const affinity = calculateCulturalAffinity(appState.currentUser, user);

    const avatarHtml = user.avatar 
      ? `<img src="${user.avatar}" class="user-card-avatar-inner" alt="${user.name}">`
      : `<div class="user-card-avatar-inner">${initial}</div>`;

    const isBlockedByMe = hasUserBlocked(currentId, user.id);

    // Renderiza botão contextual de conexão conforme status da relação e bloqueios
    let actionBtnHtml = '';
    if (isBlockedByMe) {
      actionBtnHtml = `
        <button type="button" class="btn-unblock-sm" onclick="unblockUser('${user.id}')" title="Desbloquear este membro">
          <span>🔓</span> Desbloquear
        </button>
      `;
    } else if (!conn) {
      actionBtnHtml = `
        <button type="button" class="btn-friend not-friend" onclick="handleSendRequest('${user.id}')" title="Enviar pedido de amizade">
          <span>+</span> Conectar
        </button>
        <button type="button" class="btn-chat-trigger" onclick="openChatWithUser('${user.id}')" title="Conversar no Chat com este membro">
          <span>💬</span> Chat
        </button>
      `;
    } else if (conn.status === 'accepted') {
      actionBtnHtml = `
        <button type="button" class="btn-friend is-friend" onclick="handleRemoveFriend('${user.id}')" title="Clique para desfazer a amizade">
          <span>✓</span> Amigos
        </button>
        <button type="button" class="btn-chat-trigger" onclick="openChatWithUser('${user.id}')" title="Conversar no Chat com este amigo">
          <span>💬</span> Chat
        </button>
      `;
    } else if (conn.status === 'pending') {
      if (conn.requesterId === currentId) {
        actionBtnHtml = `
          <button type="button" class="btn-friend is-pending" onclick="handleCancelRequest('${conn.id}')" title="Clique para cancelar esta solicitação pendente">
            <span>⏳</span> Solicitação enviada
          </button>
          <button type="button" class="btn-chat-trigger" onclick="openChatWithUser('${user.id}')" title="Conversar no Chat com este membro">
            <span>💬</span> Chat
          </button>
        `;
      } else {
        actionBtnHtml = `
          <div class="btn-friend-actions">
            <button type="button" class="btn-accept-sm" onclick="handleAcceptRequest('${conn.id}')" title="Aceitar pedido de amizade">
              <span>✓</span> Aceitar
            </button>
            <button type="button" class="btn-reject-sm" onclick="handleRejectRequest('${conn.id}')" title="Recusar pedido">
              <span>✕</span>
            </button>
          </div>
          <button type="button" class="btn-chat-trigger" onclick="openChatWithUser('${user.id}')" title="Aceitar e Conversar no Chat">
            <span>💬</span> Chat
          </button>
        `;
      }
    }

    return `
      <div class="user-card">
        <div>
          <div class="user-card-top">
            <div class="user-card-avatar">
              ${avatarHtml}
            </div>
            <div class="user-card-info">
              <h4>${escapeHtml(user.name)}</h4>
              <div class="user-card-username">@${escapeHtml(user.username)}</div>
            </div>
            <span class="user-card-privacy-badge ${user.isPrivate ? 'private' : 'public'}">
              ${user.isPrivate ? '🔒 Privado' : '🌐 Público'}
            </span>
          </div>

          <div style="margin: 0.35rem 0;">
            <span class="equipped-title-badge" style="font-size: 0.72rem; padding: 0.15rem 0.6rem;">
              🎖️ ${escapeHtml(user.equippedTitle || 'Explorador')}
            </span>
          </div>

          <p class="user-card-bio">${escapeHtml(user.bio || 'Sem biografia.')}</p>

          <!-- Medidor de Afinidade Cultural -->
          <div class="affinity-meter-box">
            <div class="affinity-header-row">
              <span>Afinidade Cultural:</span>
              <span class="affinity-percentage-val">${affinity.percentage}%</span>
            </div>
            <div class="affinity-bar-track">
              <div class="affinity-bar-fill" style="width: ${affinity.percentage}%;"></div>
            </div>
            <span class="affinity-label-tag">${affinity.label}</span>
          </div>

          <div class="user-card-stats">
            <div class="user-card-stat-item">
              <div class="n">${user.isPrivate ? '—' : userItems.length}</div>
              <div class="l">Obras</div>
            </div>
            <div class="user-card-stat-item">
              <div class="n">${user.isPrivate ? '—' : `Nv. ${levelInfo.level}`}</div>
              <div class="l">Nível</div>
            </div>
            <div class="user-card-stat-item">
              <div class="n">${user.isPrivate ? '—' : totalXp}</div>
              <div class="l">XP</div>
            </div>
          </div>
        </div>

        <div class="user-card-actions">
          ${actionBtnHtml}
          <button type="button" class="btn-view-user-catalog" onclick="viewOtherUserCatalog('${user.id}')">
            Ver Catálogo
          </button>
          ${!isBlockedByMe ? `
            <button type="button" class="btn-block-action" onclick="if(confirm('Deseja realmente bloquear ${escapeAttr(user.name)}? Pedidos e conexões serão desfeitos.')){ blockUser('${user.id}'); }" title="Bloquear este membro">
              🚫
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  updatePendingBadge();
}

// ==========================================================================
// Handlers do Ciclo de Vida de Amizade (POST/DELETE endpoints client-side)
// ==========================================================================

window.handleSendRequest = function(targetUserId) {
  if (!appState.currentUser) return;
  const myId = appState.currentUser.id;
  if (myId === targetUserId) return;

  loadBlocksDatabase();
  if (isUserBlocked(myId, targetUserId)) {
    showToast('Ação Bloqueada', 'Não é possível enviar solicitações de amizade para usuários bloqueados.', '🚫');
    return;
  }

  const existing = getConnectionBetween(myId, targetUserId);
  if (existing) {
    if (existing.status === 'accepted') {
      showToast('Já são amigos', 'Vocês já possuem conexão confirmada.', 'ℹ️');
      return;
    }
    if (existing.status === 'pending') {
      showToast('Solicitação pendente', 'Já existe um pedido em andamento.', 'ℹ️');
      return;
    }
  }

  const targetUser = appState.users.find(u => u.id === targetUserId);
  const targetName = targetUser ? targetUser.name : 'Membro';

  const newConn = {
    id: 'conn_' + Date.now(),
    requesterId: myId,
    addresseeId: targetUserId,
    status: 'pending',
    createdAt: new Date().toLocaleDateString('pt-BR'),
    updatedAt: new Date().toLocaleDateString('pt-BR')
  };

  appState.connections.push(newConn);
  saveConnectionsDatabase();
  showToast('Solicitação Enviada! 📬', `Pedido de amizade enviado para ${targetName}. Aguarde o aceite.`, '📬');

  renderCommunityGrid();
  renderCommunityRequests();
};

window.handleAcceptRequest = function(connectionId) {
  if (!appState.currentUser) return;
  const conn = (appState.connections || []).find(c => c.id === connectionId);
  if (!conn) return;

  conn.status = 'accepted';
  conn.updatedAt = new Date().toLocaleDateString('pt-BR');
  saveConnectionsDatabase();

  const partnerId = conn.requesterId === appState.currentUser.id ? conn.addresseeId : conn.requesterId;
  const partner = appState.users.find(u => u.id === partnerId);
  const partnerName = partner ? partner.name : 'Membro';

  ConfettiEngine.trigger(2500);
  playCelebrationSound();
  showToast('Amizade Confirmada! 🤝', `Você e ${partnerName} agora são amigos oficiais!`, '🎉');

  addActivityFeedEvent({
    type: 'friend',
    title: `conectou-se com @${partner ? partner.username : 'membro'}`,
    mediaTitle: 'Nova Amizade Cultural',
    comment: 'Agora vocês podem acompanhar o feed de atividades um do outro!'
  });

  renderCommunityGrid();
  renderCommunityRequests();
  renderActivityFeed();
};

window.handleRejectRequest = function(connectionId) {
  if (!appState.currentUser) return;
  const conn = (appState.connections || []).find(c => c.id === connectionId);
  if (!conn) return;

  const partnerId = conn.requesterId === appState.currentUser.id ? conn.addresseeId : conn.requesterId;
  const partner = appState.users.find(u => u.id === partnerId);
  const partnerName = partner ? partner.name : 'Membro';

  // Desfaz vínculo removendo a solicitação
  appState.connections = appState.connections.filter(c => c.id !== connectionId);
  saveConnectionsDatabase();

  showToast('Solicitação Recusada', `O convite de ${partnerName} foi recusado e o vínculo desfeito.`, 'ℹ️');

  renderCommunityGrid();
  renderCommunityRequests();
  renderActivityFeed();
};

window.handleCancelRequest = function(connectionId) {
  if (!appState.currentUser) return;
  const conn = (appState.connections || []).find(c => c.id === connectionId);
  if (!conn) return;

  const partnerId = conn.requesterId === appState.currentUser.id ? conn.addresseeId : conn.requesterId;
  const partner = appState.users.find(u => u.id === partnerId);
  const partnerName = partner ? partner.name : 'Membro';

  appState.connections = appState.connections.filter(c => c.id !== connectionId);
  saveConnectionsDatabase();

  showToast('Solicitação Cancelada', `Você cancelou o pedido de amizade para ${partnerName}.`, 'ℹ️');

  renderCommunityGrid();
  renderCommunityRequests();
};

window.handleRemoveFriend = function(targetUserId) {
  if (!appState.currentUser) return;
  const targetUser = appState.users.find(u => u.id === targetUserId);
  const targetName = targetUser ? targetUser.name : 'este amigo';

  if (confirm(`Deseja realmente desfazer a amizade com ${targetName}? Vocês não verão mais as atividades um do outro no feed.`)) {
    const myId = appState.currentUser.id;
    appState.connections = appState.connections.filter(c => 
      !((c.requesterId === myId && c.addresseeId === targetUserId) ||
        (c.requesterId === targetUserId && c.addresseeId === myId))
    );
    saveConnectionsDatabase();
    showToast('Amizade Desfeita', `Vínculo com ${targetName} desfeito com sucesso.`, 'ℹ️');

    renderCommunityGrid();
    renderCommunityRequests();
    renderActivityFeed();
  }
};

window.toggleFriend = function(targetUserId) {
  if (!appState.currentUser) return;
  const conn = getConnectionBetween(appState.currentUser.id, targetUserId);
  if (!conn) {
    handleSendRequest(targetUserId);
  } else if (conn.status === 'accepted') {
    handleRemoveFriend(targetUserId);
  } else if (conn.status === 'pending') {
    if (conn.requesterId === appState.currentUser.id) {
      handleCancelRequest(conn.id);
    } else {
      handleAcceptRequest(conn.id);
    }
  }
};

// ==========================================================================
// Aba de Solicitações de Amizade (Inbox Recebidas & Enviadas)
// ==========================================================================

function renderCommunityRequests() {
  if (!appState.currentUser) return;
  loadUsersDatabase();
  loadConnectionsDatabase();

  const myId = appState.currentUser.id;
  const incoming = getPendingIncomingRequests(myId);
  const outgoing = getPendingOutgoingRequests(myId);

  const incomingContainer = document.getElementById('incomingRequestsList');
  const outgoingContainer = document.getElementById('outgoingRequestsList');

  updatePendingBadge();

  // 1. Renderiza Recebidas
  if (incomingContainer) {
    if (incoming.length === 0) {
      incomingContainer.innerHTML = `
        <div class="requests-empty-state">
          <div class="icon">📬</div>
          <p>Nenhuma solicitação de amizade pendente no momento.</p>
        </div>
      `;
    } else {
      incomingContainer.innerHTML = incoming.map(req => {
        const sender = appState.users.find(u => u.id === req.requesterId);
        if (!sender) return '';
        const initial = sender.name ? sender.name.charAt(0).toUpperCase() : 'U';
        const avatarHtml = sender.avatar 
          ? `<img src="${sender.avatar}" style="width:100%;height:100%;object-fit:cover;" alt="${sender.name}">`
          : initial;
        const affinity = calculateCulturalAffinity(appState.currentUser, sender);

        return `
          <div class="request-item-card">
            <div class="request-user-meta">
              <div class="request-user-avatar">${avatarHtml}</div>
              <div class="request-user-details">
                <h4>${escapeHtml(sender.name)}</h4>
                <div class="request-user-username">@${escapeHtml(sender.username)}</div>
                <div class="request-date-info">Enviado em: ${escapeHtml(req.createdAt || 'recente')}</div>
              </div>
              <span class="request-affinity-chip" title="Afinidade cultural com você">
                ⚡ ${affinity.percentage}%
              </span>
            </div>

            <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">
              ${escapeHtml(sender.bio || 'Deseja conectar-se com você no Keeplay.')}
            </p>

            <div class="request-item-actions">
              <button type="button" class="btn-req-accept" onclick="handleAcceptRequest('${req.id}')">
                <span>✓</span> Aceitar Amizade
              </button>
              <button type="button" class="btn-req-reject" onclick="handleRejectRequest('${req.id}')">
                <span>✕</span> Recusar
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Renderiza Enviadas
  if (outgoingContainer) {
    if (outgoing.length === 0) {
      outgoingContainer.innerHTML = `
        <div class="requests-empty-state">
          <div class="icon">📤</div>
          <p>Nenhum pedido enviado aguardando aprovação.</p>
        </div>
      `;
    } else {
      outgoingContainer.innerHTML = outgoing.map(req => {
        const recipient = appState.users.find(u => u.id === req.addresseeId);
        if (!recipient) return '';
        const initial = recipient.name ? recipient.name.charAt(0).toUpperCase() : 'U';
        const avatarHtml = recipient.avatar 
          ? `<img src="${recipient.avatar}" style="width:100%;height:100%;object-fit:cover;" alt="${recipient.name}">`
          : initial;
        const affinity = calculateCulturalAffinity(appState.currentUser, recipient);

        return `
          <div class="request-item-card">
            <div class="request-user-meta">
              <div class="request-user-avatar">${avatarHtml}</div>
              <div class="request-user-details">
                <h4>${escapeHtml(recipient.name)}</h4>
                <div class="request-user-username">@${escapeHtml(recipient.username)}</div>
                <div class="request-date-info">Aguardando resposta desde: ${escapeHtml(req.createdAt || 'recente')}</div>
              </div>
              <span class="request-affinity-chip" title="Afinidade cultural estimada">
                ⚡ ${affinity.percentage}%
              </span>
            </div>

            <div class="request-item-actions">
              <button type="button" class="btn-req-cancel" onclick="handleCancelRequest('${req.id}')">
                <span>✕</span> Cancelar Solicitação
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

window.viewOtherUserCatalog = function(userId) {
  loadUsersDatabase();
  loadBlocksDatabase();
  const target = appState.users.find(u => u.id === userId);
  if (!target) return;

  const currentId = appState.currentUser.id;
  const modalTitle = document.getElementById('userCatalogModalTitle');
  const modalBody = document.getElementById('userCatalogModalBody');

  modalTitle.textContent = `Acervo de ${target.name} (@${target.username})`;

  // Verificação de Bloqueio [RF-18]
  if (hasUserBlocked(currentId, target.id)) {
    modalBody.innerHTML = `
      <div class="blocked-notice-card">
        <div class="blocked-notice-icon">🚫</div>
        <h3>Membro Bloqueado</h3>
        <p>Você bloqueou <strong>${escapeHtml(target.name)}</strong>. Enquanto o bloqueio estiver ativo, você não pode visualizar o acervo ou listas.</p>
        <button type="button" class="btn-unblock-sm" onclick="unblockUser('${target.id}'); viewOtherUserCatalog('${target.id}');">
          🔓 Desbloquear Usuário
        </button>
      </div>
    `;
    openModal('userCatalogModal');
    return;
  }

  if (hasUserBlocked(target.id, currentId)) {
    modalBody.innerHTML = `
      <div class="blocked-notice-card">
        <div class="blocked-notice-icon">🔒</div>
        <h3>Perfil Indisponível</h3>
        <p>Este perfil não está acessível no momento.</p>
      </div>
    `;
    openModal('userCatalogModal');
    return;
  }

  if (target.isPrivate && target.id !== appState.currentUser.id) {
    modalBody.innerHTML = `
      <div class="locked-catalog-notice">
        <div class="locked-icon">🔒</div>
        <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">Perfil Privado</h3>
        <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto; line-height: 1.5;">
          ${escapeHtml(target.name)} optou por manter seu catálogo restrito.
        </p>
      </div>
    `;
    openModal('userCatalogModal');
    return;
  }

  const items = target.items || [];
  const totalXp = items.reduce((acc, i) => acc + (i.xpGained || 50), 0);
  const levelInfo = calculateCurrentLevel(totalXp);
  const affinity = calculateCulturalAffinity(appState.currentUser, target);
  const publicLists = (target.customLists || []).filter(l => l.isPublic);

  const listsHtml = publicLists.length > 0 ? `
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--text-primary);">Listas Públicas de ${escapeHtml(target.name)}</h4>
      <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
        ${publicLists.map(l => `
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md); min-width: 200px; cursor: pointer;" onclick="viewCustomList('${l.id}', '${target.id}')">
            <strong>${escapeHtml(l.title)}</strong>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${(l.itemIds || []).length} obras inclusas</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const cardsHtml = items.length === 0 
    ? `<p style="color: var(--text-muted); padding: 2rem 0; text-align: center;">Nenhuma obra catalogada ainda.</p>`
    : `<div class="media-grid">${items.map(item => renderMediaCardHtml(item, false, { id: target.id, name: target.name })).join('')}</div>`;

  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 1rem;">
      <div>
        <span style="font-weight: 700; color: #facc15;">⭐ Nível ${levelInfo.level}</span>
        <span style="color: var(--text-muted); margin-left: 0.5rem;">• ${levelInfo.title}</span>
        <div style="margin-top: 0.25rem; font-size: 0.82rem; color: #ec4899; font-weight: 600;">
          Afinidade com você: ${affinity.percentage}% (${affinity.label})
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;">
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          <strong>${items.length}</strong> obras • <strong>${totalXp}</strong> XP acumulado
        </div>
        <button type="button" class="btn-chat-trigger" onclick="closeModal('userCatalogModal'); openChatWithUser('${target.id}');" title="Conversar no Chat">
          <span>💬</span> Conversar no Chat
        </button>
        <button type="button" class="btn-block-action" onclick="if(confirm('Bloquear ${escapeAttr(target.name)}? Conexões de amizade serão desfeitas.')){ blockUser('${target.id}'); viewOtherUserCatalog('${target.id}'); }" title="Bloquear este usuário">
          🚫 Bloquear
        </button>
      </div>
    </div>
    ${listsHtml}
    ${cardsHtml}
  `;

  openModal('userCatalogModal');
};

// 3. Feed de Atividades dos Amigos com Reações
function addActivityFeedEvent(eventData) {
  if (!appState.currentUser) return;
  const newActivity = {
    id: 'act_' + Date.now(),
    userId: appState.currentUser.id,
    userName: appState.currentUser.name,
    userAvatar: appState.currentUser.avatar,
    type: eventData.type || 'item',
    title: eventData.title || 'registrou uma nova obra',
    mediaTitle: eventData.mediaTitle || '',
    coverImage: eventData.coverImage || '',
    rating: eventData.rating || 5,
    comment: eventData.comment || '',
    isSpoiler: Boolean(eventData.isSpoiler),
    timeAgo: 'agora mesmo',
    reactions: { like: 0, applause: 0, fire: 0, userReactions: {} }
  };

  appState.activityFeed.unshift(newActivity);
  if (appState.activityFeed.length > 40) appState.activityFeed.pop();
  saveFeedDatabase();
  renderActivityFeed();
}

function renderActivityFeed() {
  const container = document.getElementById('activityFeedContainer');
  if (!container || !appState.currentUser) return;

  loadConnectionsDatabase();
  loadBlocksDatabase();
  const currentUserId = appState.currentUser.id;
  const acceptedFriendIds = new Set([currentUserId, ...getAcceptedFriendIds(currentUserId)]);

  const rawFeed = appState.activityFeed || [];
  // FILTRAGEM ESTRITA [RF-05] e BLOQUEIO [RF-18]:
  // Somente atividades do próprio usuário ou de amigos formalmente ACEITOS que NÃO estejam bloqueados
  const feed = rawFeed.filter(item => acceptedFriendIds.has(item.userId) && !isUserBlocked(currentUserId, item.userId));

  if (feed.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); max-width: 600px; margin: 2rem auto;">
        <div style="font-size: 2.8rem; margin-bottom: 0.65rem; opacity: 0.7;">⚡</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">Nenhuma atividade recente de amigos</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.55;">
          As publicações, avaliações e conquistas só são exibidas para vínculos de amizade formalmente <strong>aceitos</strong>. Conecte-se com membros e aceite convites na aba Comunidade!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = feed.map(item => {
    const initial = item.userName ? item.userName.charAt(0).toUpperCase() : 'U';
    const avatarHtml = item.userAvatar 
      ? `<img src="${item.userAvatar}" style="width:100%;height:100%;object-fit:cover;" alt="Avatar">`
      : initial;

    const myId = appState.currentUser.id;
    const userReactedLike = item.reactions?.userReactions?.[myId] === 'like';
    const userReactedApplause = item.reactions?.userReactions?.[myId] === 'applause';
    const userReactedFire = item.reactions?.userReactions?.[myId] === 'fire';
    const commentHtml = formatCommentWithSpoiler(item.comment, Boolean(item.isSpoiler));

    return `
      <div class="feed-card">
        <div class="feed-top-row">
          <div class="feed-avatar">${avatarHtml}</div>
          <div class="feed-user-meta">
            <h4><strong>${escapeHtml(item.userName)}</strong> <span style="font-weight: normal; color: var(--text-secondary);">${item.title}</span></h4>
            <span class="feed-time">${item.timeAgo || 'recente'}</span>
          </div>
        </div>

        <div class="feed-content-box">
          ${item.coverImage ? `<img src="${escapeHtml(item.coverImage)}" class="feed-media-cover" alt="Capa" onerror="this.style.display='none';">` : ''}
          <div style="flex: 1;">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.25rem;">${escapeHtml(item.mediaTitle)}</h4>
            ${item.rating ? `<div style="color: #fbbf24; font-size: 0.85rem; margin-bottom: 0.35rem;">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>` : ''}
            ${commentHtml}
          </div>
        </div>

        <div class="feed-reaction-bar" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="btn-reaction ${userReactedLike ? 'active' : ''}" onclick="toggleFeedReaction('${item.id}', 'like')">
              <span>❤️</span> <span>${item.reactions?.like || 0}</span>
            </button>
            <button type="button" class="btn-reaction ${userReactedApplause ? 'active' : ''}" onclick="toggleFeedReaction('${item.id}', 'applause')">
              <span>👏</span> <span>${item.reactions?.applause || 0}</span>
            </button>
            <button type="button" class="btn-reaction ${userReactedFire ? 'active' : ''}" onclick="toggleFeedReaction('${item.id}', 'fire')">
              <span>🔥</span> <span>${item.reactions?.fire || 0}</span>
            </button>
          </div>
          ${item.userId !== myId ? `
            <button type="button" class="btn-report-item" onclick="openReportModal({ activityId: '${item.id}', reportedUserId: '${item.userId}', commentText: '${escapeAttr(item.comment)}', authorName: '${escapeAttr(item.userName)}', mediaTitle: '${escapeAttr(item.mediaTitle)}' })" title="Denunciar comentário ou spoiler desmarcado">
              <span>🚨</span> Denunciar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleFeedReaction = function(activityId, reactionType) {
  if (!appState.currentUser) return;
  const activity = appState.activityFeed.find(a => a.id === activityId);
  if (!activity) return;

  if (!activity.reactions) activity.reactions = { like: 0, applause: 0, fire: 0, userReactions: {} };
  if (!activity.reactions.userReactions) activity.reactions.userReactions = {};

  const myId = appState.currentUser.id;
  const currentReaction = activity.reactions.userReactions[myId];

  if (currentReaction === reactionType) {
    activity.reactions[reactionType] = Math.max(0, (activity.reactions[reactionType] || 1) - 1);
    delete activity.reactions.userReactions[myId];
  } else {
    if (currentReaction) {
      activity.reactions[currentReaction] = Math.max(0, (activity.reactions[currentReaction] || 1) - 1);
    }
    activity.reactions[reactionType] = (activity.reactions[reactionType] || 0) + 1;
    activity.reactions.userReactions[myId] = reactionType;
    showToast('Reação Enviada!', `Você reagiu com ${reactionType === 'like' ? '❤️' : (reactionType === 'fire' ? '🔥' : '👏')}`, '✨');
  }

  saveFeedDatabase();
  renderActivityFeed();
};

// ==========================================================================
// Catálogo Pessoal (CRUD Expandido v2.0)
// ==========================================================================

function getCategoryColor(cat) {
  switch (cat) {
    case 'filme': return 'var(--cat-filme)';
    case 'serie': return 'var(--cat-serie)';
    case 'livro': return 'var(--cat-livro)';
    case 'jogo': return 'var(--cat-jogo)';
    default: return 'var(--accent-primary)';
  }
}

function getCategoryLabel(cat) {
  switch (cat) {
    case 'filme': return '🎬 Filme';
    case 'serie': return '🍿 Série';
    case 'livro': return '📚 Livro';
    case 'jogo': return '🎮 Jogo';
    default: return cat;
  }
}

function getStatusBadgeHtml(category, status) {
  if (!status) return '';
  const cleanStatus = status.toLowerCase();

  let label = status;
  let cssClass = 'status-badge';

  if (cleanStatus === 'platinado') {
    return `<span class="status-badge status-platinado">🏆 Platinado 100%</span>`;
  } else if (cleanStatus === 'zerado') {
    return `<span class="status-badge status-zerado">✅ Zerado</span>`;
  } else if (cleanStatus === 'jogando') {
    return `<span class="status-badge status-jogando">🕹️ Jogando</span>`;
  } else if (cleanStatus === 'assistindo') {
    return `<span class="status-badge status-assistindo">🍿 Assistindo</span>`;
  } else if (cleanStatus === 'finalizada') {
    return `<span class="status-badge status-finalizada">🎬 Finalizada</span>`;
  } else if (cleanStatus === 'lendo') {
    return `<span class="status-badge status-lendo">📖 Lendo</span>`;
  } else if (cleanStatus === 'lido') {
    return `<span class="status-badge status-lido">📚 Concluído</span>`;
  } else if (cleanStatus === 'assistido') {
    return `<span class="status-badge status-assistido">🎬 Assistido</span>`;
  } else if (cleanStatus === 'revisto') {
    return `<span class="status-badge status-revisto">🔄 Revisto</span>`;
  } else if (cleanStatus.includes('quero') || cleanStatus === 'backlog' || cleanStatus === 'em_espera') {
    return `<span class="status-badge status-quero">⏳ Backlog</span>`;
  } else if (cleanStatus.includes('drop') || cleanStatus.includes('abandon')) {
    return `<span class="status-badge status-dropado">💤 Dropado</span>`;
  }

  return `<span class="status-badge status-assistido">${label}</span>`;
}

function renderMediaCardHtml(item, canEdit = true, authorInfo = null) {
  const starsHtml = Array.from({ length: 5 }, (_, i) => {
    return `<span class="${i < item.rating ? 'star-filled' : 'star-empty'}">★</span>`;
  }).join('');

  const cardColor = getCategoryColor(item.category);
  const categoryLabel = getCategoryLabel(item.category);
  const hasCover = Boolean(item.coverImage && item.coverImage.trim());
  const statusBadge = getStatusBadgeHtml(item.category, item.status);
  const commentHtml = formatCommentWithSpoiler(item.comment, Boolean(item.isSpoiler));

  // Progresso
  let progressHtml = '';
  if (item.category === 'serie' && item.progress && item.progress.total > 0) {
    const pct = Math.min(100, Math.round((item.progress.current / item.progress.total) * 100));
    progressHtml = `
      <div class="card-progress-bar-wrap">
        <div class="card-prog-track"><div class="card-prog-fill" style="width:${pct}%;"></div></div>
        <div class="card-prog-text">
          <span>Episódio ${item.progress.current} / ${item.progress.total}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  } else if (item.category === 'livro' && item.progress && item.progress.total > 0) {
    const pct = Math.min(100, Math.round((item.progress.current / item.progress.total) * 100));
    progressHtml = `
      <div class="card-progress-bar-wrap">
        <div class="card-prog-track"><div class="card-prog-fill" style="width:${pct}%;"></div></div>
        <div class="card-prog-text">
          <span>Pág. ${item.progress.current} / ${item.progress.total}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }

  // Tags de provedores
  const providersHtml = (item.providers && item.providers.length > 0) 
    ? `<div class="card-providers-row">${item.providers.map(pId => {
        const prov = PROVIDERS_DATA.find(p => p.id === pId);
        return prov ? `<span class="provider-tag">${prov.icon} ${prov.name}</span>` : '';
      }).join('')}</div>`
    : '';

  // Diário de Consumo
  const dateInfo = item.consumptionLogs && item.consumptionLogs[0]?.finishedAt 
    ? item.consumptionLogs[0].finishedAt 
    : (item.createdAt || 'Registrado');

  const rewatchBadge = item.isRewatch ? '<span style="color: #fbbf24; font-size: 0.72rem; margin-left: 0.25rem;" title="Revisitação">🔄</span>' : '';

  if (hasCover) {
    return `
      <article class="media-card has-cover" style="--card-color: ${cardColor};" data-id="${item.id}">
        <div class="card-cover-container">
          <img src="${escapeHtml(item.coverImage)}" class="card-cover-img" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.onerror=null; this.parentElement.style.display='none';">
          <div class="card-cover-gradient"></div>
          <div class="card-cover-top-bar">
            <span class="category-tag">${categoryLabel}</span>
            ${statusBadge}
          </div>
        </div>

        <div class="card-body-content">
          <h3 class="media-title">${escapeHtml(item.title)}</h3>

          <div class="star-rating-display">
            ${starsHtml}
            <span class="rating-number">${item.rating}.0</span>
          </div>

          ${progressHtml}
          ${providersHtml}

          ${commentHtml}
        </div>

        <div class="card-footer">
          <div class="card-footer-info">
            <span>📅 ${dateInfo}${rewatchBadge}</span>
            <span class="card-xp-badge">+${item.xpGained || 50} XP</span>
          </div>
          ${canEdit ? `
            <div class="card-footer-actions">
              <button type="button" class="btn-item-edit" onclick="openEditModal('${item.id}')" title="Editar este registro">
                <span>✎</span> Editar
              </button>
              <button type="button" class="btn-item-delete" onclick="deleteItem('${item.id}')" title="Descartar este registro">
                <span>🗑️</span>
              </button>
            </div>
          ` : (authorInfo ? `
            <div class="card-footer-actions">
              <button type="button" class="btn-report-item" onclick="openReportModal({ itemId: '${item.id}', reportedUserId: '${authorInfo.id}', commentText: '${escapeAttr(item.comment)}', authorName: '${escapeAttr(authorInfo.name)}', mediaTitle: '${escapeAttr(item.title)}' })" title="Denunciar este comentário ou spoiler desmarcado">
                <span>🚨</span> Denunciar
              </button>
            </div>
          ` : '')}
        </div>
      </article>
    `;
  }

  return `
    <article class="media-card" style="--card-color: ${cardColor};" data-id="${item.id}">
      <div>
        <div class="card-header">
          <span class="category-tag">${categoryLabel}</span>
          ${statusBadge}
        </div>

        <h3 class="media-title">${escapeHtml(item.title)}</h3>

        <div class="star-rating-display">
          ${starsHtml}
          <span class="rating-number">${item.rating}.0</span>
        </div>

        ${progressHtml}
        ${providersHtml}

        ${commentHtml}
      </div>

      <div class="card-footer">
        <div class="card-footer-info">
          <span>📅 ${dateInfo}${rewatchBadge}</span>
          <span class="card-xp-badge">+${item.xpGained || 50} XP</span>
        </div>
        ${canEdit ? `
          <div class="card-footer-actions">
            <button type="button" class="btn-item-edit" onclick="openEditModal('${item.id}')" title="Editar este registro">
              <span>✎</span> Editar
            </button>
            <button type="button" class="btn-item-delete" onclick="deleteItem('${item.id}')" title="Descartar este registro">
              <span>🗑️</span>
            </button>
          </div>
        ` : (authorInfo ? `
          <div class="card-footer-actions">
            <button type="button" class="btn-report-item" onclick="openReportModal({ itemId: '${item.id}', reportedUserId: '${authorInfo.id}', commentText: '${escapeAttr(item.comment)}', authorName: '${escapeAttr(authorInfo.name)}', mediaTitle: '${escapeAttr(item.title)}' })" title="Denunciar este comentário ou spoiler desmarcado">
              <span>🚨</span> Denunciar
            </button>
          </div>
        ` : '')}
      </div>
    </article>
  `;
}

function renderMediaGrid() {
  const grid = document.getElementById('mediaGrid');
  if (!grid || !appState.currentUser) return;

  const items = appState.currentUser.items || [];
  const filtered = items.filter(item => {
    const matchCategory = appState.selectedCategory === 'todos' || item.category === appState.selectedCategory;
    
    // Filtro por status
    let matchStatus = true;
    if (appState.selectedStatus !== 'todos') {
      matchStatus = item.status === appState.selectedStatus;
    }

    const query = appState.searchQuery.toLowerCase();
    const matchSearch = !query || 
      item.title.toLowerCase().includes(query) || 
      (item.comment && item.comment.toLowerCase().includes(query)) ||
      (item.providers && item.providers.some(p => p.includes(query)));

    return matchCategory && matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <div style="font-size: 3rem; margin-bottom: 0.8rem; opacity: 0.7;">📂</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 0.35rem;">Nenhum registro encontrado</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Tente ajustar seus filtros ou clique em "+ Novo Registro" para cadastrar.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => renderMediaCardHtml(item, true)).join('');
}

window.deleteItem = function(id) {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];
  const item = items.find(i => i.id === id);
  if (!item) return;

  if (confirm(`Deseja realmente descartar "${item.title}" do seu catálogo?`)) {
    appState.currentUser.items = items.filter(i => i.id !== id);
    saveCurrentUser();
    renderMediaGrid();
    renderProfileDashboard();
    showToast('Registro Descartado', `"${item.title}" foi removido do seu catálogo.`, '🗑️');
  }
};

window.openEditModal = function(id) {
  if (!appState.currentUser) return;
  const item = (appState.currentUser.items || []).find(i => i.id === id);
  if (!item) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('itemTitle').value = item.title;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemComment').value = item.comment;
  document.getElementById('modalTitle').textContent = 'Editar Registro Cultural';

  // Atualiza campos dinâmicos por categoria
  updateModalFieldsByCategory(item.category, item);

  const btnSave = document.getElementById('btnSaveMedia');
  if (btnSave) btnSave.textContent = 'Salvar Alterações';

  const btnDeleteModal = document.getElementById('btnDeleteModalItem');
  if (btnDeleteModal) {
    btnDeleteModal.style.display = 'inline-flex';
    btnDeleteModal.onclick = () => {
      closeModal('mediaModal');
      window.deleteItem(item.id);
    };
  }

  setCoverPreview(item.coverImage || '');
  switchCoverTab('url');
  setStarRating(item.rating);

  const chkSpoiler = document.getElementById('itemIsSpoiler');
  if (chkSpoiler) chkSpoiler.checked = Boolean(item.isSpoiler);

  openModal('mediaModal');
};

function updateModalFieldsByCategory(category, existingItem = null) {
  const statusSelect = document.getElementById('itemStatus');
  const seasonGroup = document.getElementById('seasonFieldGroup');
  const progressLabel = document.getElementById('progressLabel');
  const currentProgInput = document.getElementById('itemProgressCurrent');
  const totalProgInput = document.getElementById('itemProgressTotal');
  const hoursInput = document.getElementById('itemHoursSpent');
  const isRewatchChk = document.getElementById('itemIsRewatch');

  // 1. Preenche Opções de Status
  const statuses = MEDIA_STATUS_CONFIG[category] || MEDIA_STATUS_CONFIG.filme;
  statusSelect.innerHTML = statuses.map(s => `
    <option value="${s.value}">${s.label}</option>
  `).join('');

  if (existingItem?.status) {
    statusSelect.value = existingItem.status;
  }

  // 2. Ajusta campos de contadores
  if (category === 'serie') {
    seasonGroup.style.display = 'block';
    progressLabel.textContent = 'Episódios (Atual / Total)';
    currentProgInput.value = existingItem?.progress?.current || 1;
    totalProgInput.value = existingItem?.progress?.total || 10;
    document.getElementById('itemSeason').value = existingItem?.progress?.season || 1;
  } else if (category === 'livro') {
    seasonGroup.style.display = 'none';
    progressLabel.textContent = 'Páginas (Lidas / Total)';
    currentProgInput.value = existingItem?.progress?.current || 50;
    totalProgInput.value = existingItem?.progress?.total || 300;
  } else {
    seasonGroup.style.display = 'none';
    progressLabel.textContent = 'Progresso Estimado (%)';
    currentProgInput.value = existingItem?.progress?.current || 100;
    totalProgInput.value = existingItem?.progress?.total || 100;
  }

  hoursInput.value = existingItem?.progress?.hours || (category === 'jogo' ? 40 : (category === 'filme' ? 2 : 10));
  isRewatchChk.checked = Boolean(existingItem?.isRewatch);

  // 3. Preenche datas do diário
  document.getElementById('itemDateStarted').value = existingItem?.consumptionLogs?.[0]?.startedAt || '';
  document.getElementById('itemDateFinished').value = existingItem?.consumptionLogs?.[0]?.finishedAt || '';

  // 4. Preenche chips de provedores
  appState.selectedProviders = existingItem?.providers || [];
  renderProviderChips();
}

function renderProviderChips() {
  const container = document.getElementById('providersChipGroup');
  if (!container) return;

  container.innerHTML = PROVIDERS_DATA.map(p => {
    const isSelected = appState.selectedProviders.includes(p.id);
    return `
      <div class="provider-chip ${isSelected ? 'selected' : ''}" onclick="toggleProviderSelection('${p.id}')">
        <span>${p.icon}</span> <span>${p.name}</span>
      </div>
    `;
  }).join('');

  document.getElementById('itemSelectedProviders').value = JSON.stringify(appState.selectedProviders);
}

window.toggleProviderSelection = function(provId) {
  if (appState.selectedProviders.includes(provId)) {
    appState.selectedProviders = appState.selectedProviders.filter(id => id !== provId);
  } else {
    appState.selectedProviders.push(provId);
  }
  renderProviderChips();
};

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================================
// Dashboard Analítico no Perfil
// ==========================================================================

function renderProfileDashboard() {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];

  // 1. Distribuição por categoria
  const catContainer = document.getElementById('dashboardCategoryBars');
  if (catContainer) {
    if (items.length === 0) {
      catContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Cadastre mídias para gerar a distribuição.</p>`;
    } else {
      const cats = [
        { id: 'filme', label: 'Filmes 🎬', color: 'var(--cat-filme)' },
        { id: 'serie', label: 'Séries 🍿', color: 'var(--cat-serie)' },
        { id: 'livro', label: 'Livros 📚', color: 'var(--cat-livro)' },
        { id: 'jogo', label: 'Jogos 🎮', color: 'var(--cat-jogo)' }
      ];

      catContainer.innerHTML = cats.map(c => {
        const count = items.filter(i => i.category === c.id).length;
        const pct = Math.round((count / items.length) * 100);
        return `
          <div class="cat-dist-row">
            <div class="cat-dist-header">
              <span>${c.label} (${count})</span>
              <span>${pct}%</span>
            </div>
            <div class="cat-dist-track">
              <div class="cat-dist-fill" style="width: ${pct}%; background: ${c.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Histograma de notas (5 a 1)
  const histContainer = document.getElementById('dashboardRatingHistogram');
  if (histContainer) {
    if (items.length === 0) {
      histContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Sem avaliações registradas.</p>`;
    } else {
      histContainer.innerHTML = [5, 4, 3, 2, 1].map(stars => {
        const count = items.filter(i => Number(i.rating) === stars).length;
        const pct = Math.round((count / items.length) * 100);
        return `
          <div class="hist-row">
            <span class="hist-star-lbl">${stars} ★</span>
            <div class="hist-track">
              <div class="hist-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="hist-count">${count}</span>
          </div>
        `;
      }).join('');
    }
  }

  // 3. Horas investidas detalhadas
  const hoursContainer = document.getElementById('dashboardHoursBreakdown');
  if (hoursContainer) {
    const hoursByCat = { filme: 0, serie: 0, livro: 0, jogo: 0 };
    items.forEach(i => {
      hoursByCat[i.category] = (hoursByCat[i.category] || 0) + Number(i.progress?.hours || 0);
    });

    hoursContainer.innerHTML = `
      <div class="hour-stat-item">
        <span>🎮 Jogos de Videogame</span>
        <strong>${Math.round(hoursByCat.jogo)} horas</strong>
      </div>
      <div class="hour-stat-item">
        <span>🍿 Séries & Maratonas</span>
        <strong>${Math.round(hoursByCat.serie)} horas</strong>
      </div>
      <div class="hour-stat-item">
        <span>🎬 Filmes & Cinema</span>
        <strong>${Math.round(hoursByCat.filme)} horas</strong>
      </div>
      <div class="hour-stat-item">
        <span>📚 Livros & Leituras</span>
        <strong>${Math.round(hoursByCat.livro)} horas</strong>
      </div>
    `;
  }

  // 4. Taxa de conclusão
  const statusContainer = document.getElementById('dashboardStatusBreakdown');
  if (statusContainer) {
    const platinas = items.filter(i => i.status === 'platinado').length;
    const concluidos = items.filter(i => ['zerado', 'lido', 'assistido', 'finalizada'].includes(i.status)).length;
    const emAndamento = items.filter(i => ['jogando', 'lendo', 'assistindo'].includes(i.status)).length;
    const dropados = items.filter(i => ['dropado', 'abandonado', 'dropada'].includes(i.status)).length;

    statusContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.65rem;">
        <div class="hour-stat-item">
          <span>🏆 Platinados com 100%</span>
          <strong style="color: #fbbf24;">${platinas}</strong>
        </div>
        <div class="hour-stat-item">
          <span>✅ Concluídos / Zerados</span>
          <strong style="color: #34d399;">${concluidos}</strong>
        </div>
        <div class="hour-stat-item">
          <span>⏳ Em Andamento</span>
          <strong style="color: #38bdf8;">${emAndamento}</strong>
        </div>
        <div class="hour-stat-item">
          <span>💤 Abandonados / Dropados</span>
          <strong style="color: #f87171;">${dropados}</strong>
        </div>
      </div>
    `;
  }
}

// ==========================================================================
// Retrospectiva Interativa ("Wrapped")
// ==========================================================================

function openWrappedModal() {
  if (!appState.currentUser) return;
  appState.currentWrappedSlide = 0;
  renderWrappedSlide(0);
  openModal('wrappedModal');
  ConfettiEngine.trigger(2500);
}

function renderWrappedSlide(slideIndex) {
  const container = document.getElementById('wrappedSlidesContainer');
  const bars = document.querySelectorAll('#wrappedStoryBars .story-bar');
  if (!container || !appState.currentUser) return;

  // Atualiza story bars
  bars.forEach((bar, idx) => {
    bar.classList.remove('active', 'viewed');
    if (idx === slideIndex) bar.classList.add('active');
    else if (idx < slideIndex) bar.classList.add('viewed');
  });

  const items = appState.currentUser.items || [];
  const totalXp = items.reduce((acc, i) => acc + (i.xpGained || 50), 0);
  const totalHours = items.reduce((acc, i) => acc + Number(i.progress?.hours || 0), 0);
  const platinas = items.filter(i => i.status === 'platinado').length;

  // Slide 0: Números Gerais
  if (slideIndex === 0) {
    container.innerHTML = `
      <div class="wrapped-slide-icon">✨</div>
      <h3 class="wrapped-slide-title">Sua Odisseia Cultural em Números</h3>
      <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto;">
        Um panorama da sua dedicação às melhores histórias e mundos virtuais neste período.
      </p>

      <div class="wrapped-big-number">${items.length}</div>
      <div style="font-size: 1.1rem; color: #c084fc; font-weight: 700; margin-bottom: 1.5rem;">Obras Culturais Catalogadas</div>

      <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
        <div class="stat-pill" style="background: rgba(255,255,255,0.06);">
          <div class="stat-value">${Math.round(totalHours)}h</div>
          <div class="stat-label">Horas Estimadas</div>
        </div>
        <div class="stat-pill" style="background: rgba(255,255,255,0.06);">
          <div class="stat-value">${totalXp}</div>
          <div class="stat-label">XP Acumulado</div>
        </div>
        <div class="stat-pill" style="background: rgba(255,255,255,0.06);">
          <div class="stat-value">${platinas}</div>
          <div class="stat-label">Platinas 🏆</div>
        </div>
      </div>
    `;
  } 
  // Slide 1: Obra-Prima Inesquecível
  else if (slideIndex === 1) {
    const topItem = items.filter(i => Number(i.rating) === 5)[0] || items[0] || { title: 'Sua Próxima Grande Obra', comment: 'Continue registrando para destacar sua favorita!', coverImage: '' };

    container.innerHTML = `
      <div class="wrapped-slide-icon">⭐</div>
      <h3 class="wrapped-slide-title">Sua Obra-Prima Favorita</h3>
      <p style="color: var(--text-secondary);">A experiência que conquistou sua nota máxima e marcou sua jornada.</p>

      <div style="margin: 1.25rem 0;">
        ${topItem.coverImage ? `<img src="${topItem.coverImage}" style="width: 110px; height: 160px; object-fit: cover; border-radius: var(--radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.7); margin-bottom: 0.75rem;" alt="Capa">` : ''}
        <h4 style="font-size: 1.4rem; font-weight: 800; color: #fff;">${escapeHtml(topItem.title)}</h4>
        <div style="color: #fbbf24; font-size: 1.2rem; margin-top: 0.25rem;">★★★★★</div>
      </div>

      <div class="wrapped-quote-box">
        "${escapeHtml(topItem.comment || 'Uma obra memorável.')}"
      </div>
    `;
  }
  // Slide 2: Categoria e Gênero Dominante
  else if (slideIndex === 2) {
    const counts = { filme: 0, serie: 0, livro: 0, jogo: 0 };
    items.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    const topCatId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'filme');
    const catLabel = getCategoryLabel(topCatId);

    container.innerHTML = `
      <div class="wrapped-slide-icon">🪐</div>
      <h3 class="wrapped-slide-title">Seu Universo Dominante</h3>
      <p style="color: var(--text-secondary);">Onde você investiu mais entusiasmo e horas preciosas.</p>

      <div class="wrapped-big-number" style="font-size: 2.8rem; color: #38bdf8; margin: 1.5rem 0;">
        ${catLabel}
      </div>
      <p style="color: var(--text-primary); font-size: 1.05rem; max-width: 440px; margin: 0 auto;">
        Com <strong>${counts[topCatId]} registros</strong>, esta foi sua maior janela de imersão e descobertas.
      </p>
    `;
  }
  // Slide 3: Arquétipo & Personalidade Cultural
  else if (slideIndex === 3) {
    let archetype = 'Explorador Cultural';
    let archDesc = 'Você transita com fluidez e curiosidade por filmes, jogos, séries e tomos fascinantes.';
    let archIcon = '🔮';

    if (platinas >= 1) {
      archetype = 'Mestre Platinador';
      archDesc = 'Nenhum desafio fica pela metade. Sua obstinação em conquistar 100% é lendária.';
      archIcon = '👑';
    } else if (items.filter(i => i.category === 'livro').length >= 3) {
      archetype = 'Guardião dos Tomos';
      archDesc = 'Sua mente habita as páginas de universos ricos e narrativas filosóficas.';
      archIcon = '📜';
    } else if (items.filter(i => i.category === 'filme').length >= 4) {
      archetype = 'Cinéfilo Filosófico';
      archDesc = 'Você enxerga o cinema como pura direção de arte, fotografia e emoção visual.';
      archIcon = '🎬';
    }

    container.innerHTML = `
      <div class="wrapped-slide-icon">${archIcon}</div>
      <h3 class="wrapped-slide-title">Sua Personalidade Cultural</h3>
      <p style="color: var(--text-secondary);">Baseado nas suas escolhas, seu perfil foi classificado como:</p>

      <div class="wrapped-archetype-card">
        <h4 style="font-size: 1.5rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.5rem;">${archetype}</h4>
        <p style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5;">${archDesc}</p>
      </div>

      <p style="margin-top: 1.25rem; font-size: 0.82rem; color: var(--text-muted);">
        Compartilhe com seus amigos ou publique no feed da comunidade!
      </p>
    `;
  }
}

function shareWrappedSummary() {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];
  const hours = items.reduce((acc, i) => acc + Number(i.progress?.hours || 0), 0);
  const text = `✨ Meu Wrapped Cultural no Keeplay:
📚 ${items.length} obras registradas
⏳ ${Math.round(hours)} horas de entretenimento
👑 Título: ${appState.currentUser.equippedTitle || 'Iniciante Curioso'}
Acompanhe seu diário e compartilhe com amigos!`;

  navigator.clipboard.writeText(text).then(() => {
    ConfettiEngine.trigger(2000);
    showToast('Resumo Copiado!', 'Texto copiado para sua área de transferência.', '📋');
  }).catch(() => {
    alert(text);
  });
}

// ==========================================================================
// Portabilidade de Dados & Importador CSV / JSON
// ==========================================================================

function exportData(format = 'csv') {
  if (!appState.currentUser) return;
  const items = appState.currentUser.items || [];

  if (format === 'json') {
    const dataStr = JSON.stringify(appState.currentUser, null, 2);
    downloadFile(dataStr, `keeplay_backup_${appState.currentUser.username}.json`, 'application/json');
    showToast('Backup Exportado!', 'Arquivo JSON baixado com sucesso.', '💾');
    return;
  }

  // Exportação CSV
  let csvContent = 'titulo,categoria,status,nota,comentario,horas,provedor,data\n';
  items.forEach(i => {
    const cleanTitle = `"${(i.title || '').replace(/"/g, '""')}"`;
    const cleanComment = `"${(i.comment || '').replace(/"/g, '""')}"`;
    const provs = `"${(i.providers || []).join(';')}"`;
    const line = [
      cleanTitle,
      i.category,
      i.status || '',
      i.rating,
      cleanComment,
      i.progress?.hours || 0,
      provs,
      i.createdAt || ''
    ].join(',');
    csvContent += line + '\n';
  });

  downloadFile(csvContent, `keeplay_acervo_${appState.currentUser.username}.csv`, 'text/csv;charset=utf-8;');
  showToast('Planilha Exportada!', 'Arquivo CSV gerado com sucesso.', '📊');
}

function downloadCsvTemplate() {
  const template = 'titulo,categoria,status,nota,comentario,horas,provedor,data\n' +
    '"Interestelar",filme,assistido,5,"Uma obra-prima da ficção científica",2.8,"max;prime",10/09/2026\n' +
    '"Elden Ring",jogo,platinado,5,"Mundo aberto espetacular",140,"steam;ps",05/09/2026\n' +
    '"Duna",livro,lido,4,"Enredo político e ecológico brilhante",18,"kindle",13/09/2026\n';
  downloadFile(template, 'modelo_importacao_keeplay.csv', 'text/csv;charset=utf-8;');
  showToast('Modelo Baixado!', 'Preencha a planilha e envie no importador.', '📄');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromCsv(file) {
  if (!file || !appState.currentUser) return;
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      alert('Arquivo CSV vazio ou sem dados após o cabeçalho.');
      return;
    }

    let importedCount = 0;
    let earnedXp = 0;

    // Ignora linha 0 (cabeçalho)
    for (let idx = 1; idx < lines.length; idx++) {
      const line = lines[idx];
      // Regex para split respeitando aspas
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      if (cols.length < 2) continue;

      const title = (cols[0] || '').replace(/^"|"$/g, '').trim();
      const category = (cols[1] || 'filme').replace(/^"|"$/g, '').trim().toLowerCase();
      const status = (cols[2] || 'assistido').replace(/^"|"$/g, '').trim().toLowerCase();
      const rating = Number((cols[3] || '5').replace(/^"|"$/g, '').trim()) || 5;
      const comment = (cols[4] || 'Importado via planilha CSV.').replace(/^"|"$/g, '').trim();
      const hours = Number((cols[5] || '2').replace(/^"|"$/g, '').trim()) || 2;
      const provsStr = (cols[6] || '').replace(/^"|"$/g, '').trim();
      const providers = provsStr ? provsStr.split(';').map(p => p.trim()) : [];

      if (!title) continue;

      const xp = calculateItemXp(rating, comment, status);
      earnedXp += xp;

      const newItem = {
        id: 'csv_' + Date.now() + '_' + idx,
        title,
        category: ['filme', 'serie', 'livro', 'jogo'].includes(category) ? category : 'filme',
        status,
        rating,
        comment,
        coverImage: '',
        xpGained: xp,
        progress: { current: 1, total: 1, season: 1, hours },
        providers,
        consumptionLogs: [{ startedAt: new Date().toLocaleDateString('pt-BR'), finishedAt: new Date().toLocaleDateString('pt-BR') }],
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      appState.currentUser.items.unshift(newItem);
      importedCount++;
    }

    if (importedCount > 0) {
      saveCurrentUser();
      renderMediaGrid();
      renderProfileDashboard();
      ConfettiEngine.trigger(3000);

      const feedback = document.getElementById('csvImportFeedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.textContent = `✓ Sucesso! ${importedCount} obras importadas e +${earnedXp} XP creditados!`;
      }
      showToast('Importação Concluída!', `${importedCount} obras adicionadas com sucesso.`, '📥');
    } else {
      alert('Não foi possível identificar registros válidos no arquivo CSV.');
    }
  };

  reader.readAsText(file);
}

function loadDemoData() {
  if (!appState.currentUser) return;
  const demoSamples = [
    {
      title: 'Arcane',
      category: 'serie',
      status: 'finalizada',
      rating: 5,
      comment: 'Animação e trilha sonora revolucionárias no universo de Runeterra.',
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      progress: { current: 9, total: 9, season: 1, hours: 6 },
      providers: ['netflix']
    },
    {
      title: 'Red Dead Redemption 2',
      category: 'jogo',
      status: 'zerado',
      rating: 5,
      comment: 'Arthur Morgan possui um dos maiores arcos de redenção já escritos.',
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      progress: { current: 100, total: 100, season: 1, hours: 85 },
      providers: ['steam', 'ps', 'xbox']
    },
    {
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      category: 'livro',
      status: 'lido',
      rating: 5,
      comment: 'O alicerce supremo da alta fantasia e mitologia contemporânea.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      progress: { current: 576, total: 576, season: 1, hours: 25 },
      providers: ['kindle', 'livro']
    }
  ];

  demoSamples.forEach(s => {
    const xp = calculateItemXp(s.rating, s.comment, s.status);
    const item = {
      id: 'demo_auto_' + Date.now() + Math.random().toString(36).substr(2, 4),
      title: s.title,
      category: s.category,
      status: s.status,
      rating: s.rating,
      comment: s.comment,
      coverImage: s.coverImage,
      xpGained: xp,
      progress: s.progress,
      providers: s.providers,
      consumptionLogs: [{ startedAt: '01/09/2026', finishedAt: '15/09/2026' }],
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    appState.currentUser.items.unshift(item);
  });

  saveCurrentUser();
  renderMediaGrid();
  renderProfileDashboard();
  ConfettiEngine.trigger(2500);
  showToast('Obras Exemplo Adicionadas!', 'Arcane, RDR2 e Senhor dos Anéis foram inseridos.', '✨');
}

// ==========================================================================
// Perfil do Usuário
// ==========================================================================

function renderProfileUI() {
  if (!appState.currentUser) return;
  const p = appState.currentUser;
  const initial = p.name ? p.name.charAt(0).toUpperCase() : 'U';

  // Mini Avatar Topbar
  const navAvatar = document.getElementById('navAvatarMini');
  if (navAvatar) {
    if (p.avatar) {
      navAvatar.innerHTML = `<img src="${p.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">`;
    } else {
      navAvatar.textContent = initial;
    }
  }

  const navUsername = document.getElementById('navUsernameText');
  if (navUsername) navUsername.textContent = p.name;

  // Hero Catálogo
  const heroAvatar = document.getElementById('heroAvatarImg');
  if (heroAvatar) {
    if (p.avatar) {
      heroAvatar.innerHTML = `<img src="${p.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">`;
    } else {
      heroAvatar.textContent = initial;
    }
  }

  const profileDisplayName = document.getElementById('profileDisplayName');
  if (profileDisplayName) profileDisplayName.textContent = p.name;

  const heroBioText = document.getElementById('heroBioText');
  if (heroBioText) heroBioText.textContent = p.bio || 'Sem descrição pessoal.';

  // Painel Meu Perfil
  const cardAvatar = document.getElementById('cardAvatarPreview');
  if (cardAvatar) {
    if (p.avatar) {
      cardAvatar.innerHTML = `<img src="${p.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">`;
    } else {
      cardAvatar.textContent = initial;
    }
  }

  const miniFormAvatar = document.getElementById('miniFormAvatar');
  if (miniFormAvatar) {
    if (p.avatar) {
      miniFormAvatar.innerHTML = `<img src="${p.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">`;
    } else {
      miniFormAvatar.textContent = initial;
    }
  }

  const cardProfileName = document.getElementById('cardProfileName');
  if (cardProfileName) cardProfileName.textContent = p.name;

  const cardProfileUsername = document.getElementById('cardProfileUsername');
  if (cardProfileUsername) cardProfileUsername.textContent = `@${p.username} ${p.isPrivate ? '🔒 (Privado)' : '🌐 (Público)'}`;

  const cardProfileTitle = document.getElementById('cardProfileTitle');
  if (cardProfileTitle) cardProfileTitle.textContent = `⭐ ${p.equippedTitle || 'Iniciante Curioso'}`;

  const cardProfileBio = document.getElementById('cardProfileBio');
  if (cardProfileBio) cardProfileBio.textContent = p.bio || 'Sem descrição adicionada.';

  // Preencher formulário de edição
  const editName = document.getElementById('editName');
  if (editName) editName.value = p.name;

  const editUsername = document.getElementById('editUsername');
  if (editUsername) editUsername.value = p.username;

  const editPassword = document.getElementById('editPassword');
  if (editPassword) editPassword.value = p.password;

  const editBio = document.getElementById('editBio');
  if (editBio) editBio.value = p.bio || '';

  const editIsPrivate = document.getElementById('editIsPrivate');
  if (editIsPrivate) editIsPrivate.checked = Boolean(p.isPrivate);

  // Dropdown de Títulos Disponíveis
  const editEquippedTitle = document.getElementById('editEquippedTitle');
  if (editEquippedTitle) {
    const availableTitles = getAvailableTitlesForUser(p);
    editEquippedTitle.innerHTML = availableTitles.map(title => `
      <option value="${title}" ${p.equippedTitle === title ? 'selected' : ''}>🎖️ ${title}</option>
    `).join('');
  }
}

// ==========================================================================
// Exclusão Definitiva de Perfil (Zona de Perigo / LGPD)
// ==========================================================================

function openDeleteAccountModal() {
  if (!appState.currentUser) return;

  const itemsCount = (appState.currentUser.items || []).length;
  const statsItemsEl = document.getElementById('deleteStatsItemsCount');
  if (statsItemsEl) statsItemsEl.textContent = itemsCount;

  const usernamePromptEl = document.getElementById('deleteConfirmUsernamePrompt');
  if (usernamePromptEl) usernamePromptEl.textContent = `@${appState.currentUser.username}`;

  const inputUser = document.getElementById('deleteConfirmInput');
  if (inputUser) inputUser.value = '';

  const inputPass = document.getElementById('deleteConfirmPassword');
  if (inputPass) inputPass.value = '';

  const errorEl = document.getElementById('deleteAccountError');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  openModal('deleteAccountModal');
}

function handleDeleteAccountConfirm() {
  if (!appState.currentUser) return;

  const inputUser = (document.getElementById('deleteConfirmInput')?.value || '').trim();
  const inputPass = (document.getElementById('deleteConfirmPassword')?.value || '').trim();
  const errorEl = document.getElementById('deleteAccountError');

  // Validação do nome de usuário
  const cleanExpectedUsername = appState.currentUser.username.toLowerCase();
  const cleanTypedUsername = inputUser.replace(/^@/, '').toLowerCase();

  if (!cleanTypedUsername) {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = `Digite seu @${appState.currentUser.username} para confirmar a intenção de exclusão.`;
    }
    return;
  }

  if (cleanTypedUsername !== cleanExpectedUsername) {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = `O nome de usuário digitado não corresponde à sua conta (@${appState.currentUser.username}).`;
    }
    return;
  }

  // Validação da senha de acesso
  if (!inputPass) {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Digite sua senha de acesso para validação de segurança.';
    }
    return;
  }

  if (inputPass !== appState.currentUser.password) {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Senha incorreta. A exclusão de conta requer confirmação da senha atual.';
    }
    return;
  }

  // Execução do Expurgo em Cascata
  const deletedUserId = appState.currentUser.id;
  const deletedUserName = appState.currentUser.name;

  // 1. Remove o usuário da base de usuários
  appState.users = appState.users.filter(u => u.id !== deletedUserId);
  saveUsersDatabase();

  // 2. Remove todas as conexões e solicitações de amizade vinculadas
  appState.connections = appState.connections.filter(c => c.requesterId !== deletedUserId && c.addresseeId !== deletedUserId);
  saveConnectionsDatabase();

  // 3. Remove bloqueios envolvendo o usuário
  appState.blocks = appState.blocks.filter(b => b.blockerId !== deletedUserId && b.blockedId !== deletedUserId);
  saveBlocksDatabase();

  // 4. Remove publicações e resenhas do usuário excluído no feed de atividades
  appState.activityFeed = appState.activityFeed.filter(a => a.userId !== deletedUserId);
  saveFeedDatabase();

  // 5. Sincroniza as listas de amigos dos usuários remanescentes
  syncUsersFriendsList();

  // 6. Fecha o modal de confirmação
  closeModal('deleteAccountModal');

  // 7. Encerra a sessão e retorna à tela de autenticação
  handleLogout();

  // 8. Notificação toast informativa
  showToast('Perfil Excluído', `A conta de ${deletedUserName} e todos os seus registros foram excluídos permanentemente.`, '🗑️');
}

window.openDeleteAccountModal = openDeleteAccountModal;
window.handleDeleteAccountConfirm = handleDeleteAccountConfirm;

// ==========================================================================
// Modais & Seletor de Estrelas
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function resetMediaForm() {
  document.getElementById('mediaForm').reset();
  document.getElementById('editItemId').value = '';
  document.getElementById('modalTitle').textContent = 'Novo Registro Cultural';

  const btnSave = document.getElementById('btnSaveMedia');
  if (btnSave) btnSave.textContent = 'Salvar e Ganhar XP';

  const btnDeleteModal = document.getElementById('btnDeleteModalItem');
  if (btnDeleteModal) btnDeleteModal.style.display = 'none';

  setCoverPreview('');
  switchCoverTab('url');
  setStarRating(5);

  const chkSpoiler = document.getElementById('itemIsSpoiler');
  if (chkSpoiler) chkSpoiler.checked = false;

  const initialCat = document.getElementById('itemCategory').value || 'filme';
  updateModalFieldsByCategory(initialCat);
}

function switchCoverTab(mode) {
  const tabUrl = document.getElementById('tabCoverUrl');
  const tabFile = document.getElementById('tabCoverFile');
  const urlContainer = document.getElementById('coverUrlContainer');
  const fileContainer = document.getElementById('coverFileContainer');

  if (mode === 'url') {
    if (tabUrl) tabUrl.classList.add('active');
    if (tabFile) tabFile.classList.remove('active');
    if (urlContainer) urlContainer.style.display = 'block';
    if (fileContainer) fileContainer.style.display = 'none';
  } else {
    if (tabFile) tabFile.classList.add('active');
    if (tabUrl) tabUrl.classList.remove('active');
    if (fileContainer) fileContainer.style.display = 'block';
    if (urlContainer) urlContainer.style.display = 'none';
  }
}

function setCoverPreview(src) {
  const hiddenInput = document.getElementById('itemCoverValue');
  const urlInput = document.getElementById('itemCoverUrl');
  const emptyBox = document.getElementById('coverPreviewEmpty');
  const imgBox = document.getElementById('coverPreviewImgContainer');
  const previewImg = document.getElementById('coverPreviewImg');
  const btnClear = document.getElementById('btnClearCover');

  const cleanSrc = (src || '').trim();
  if (hiddenInput) hiddenInput.value = cleanSrc;

  if (urlInput && !cleanSrc.startsWith('data:')) {
    urlInput.value = cleanSrc;
  }

  if (cleanSrc) {
    if (previewImg) previewImg.src = cleanSrc;
    if (emptyBox) emptyBox.style.display = 'none';
    if (imgBox) imgBox.style.display = 'flex';
    if (btnClear) btnClear.style.display = 'inline-block';
  } else {
    if (previewImg) previewImg.src = '';
    if (emptyBox) emptyBox.style.display = 'flex';
    if (imgBox) imgBox.style.display = 'none';
    if (btnClear) btnClear.style.display = 'none';
    if (urlInput) urlInput.value = '';
    const fileInput = document.getElementById('itemCoverFile');
    if (fileInput) fileInput.value = '';
  }
}

function setStarRating(rating) {
  appState.selectedRatingInput = Number(rating);
  document.getElementById('itemRating').value = rating;

  const stars = document.querySelectorAll('#starPicker .star-btn');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  const xpHint = document.getElementById('starXpHint');
  if (xpHint) {
    const xp = calculateItemXp(rating, 'comentário padrão');
    xpHint.textContent = `+${xp} XP`;
  }
}

function setupStarPicker() {
  const stars = document.querySelectorAll('#starPicker .star-btn');
  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      e.preventDefault();
      const val = star.getAttribute('data-value');
      setStarRating(val);
    });

    star.addEventListener('mouseenter', () => {
      const val = Number(star.getAttribute('data-value'));
      stars.forEach((s, idx) => {
        if (idx < val) s.classList.add('hover');
        else s.classList.remove('hover');
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

function showToast(title, message, icon = '✦', isAchievement = false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${isAchievement ? 'toast-achievement' : ''}`;
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  if (isAchievement) playCelebrationSound();

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}

// ==========================================================================
// Inicialização de Eventos
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  ConfettiEngine.init();

  // Alternador de Abas de Autenticação (Entrar / Cadastrar)
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabRegister = document.getElementById('tabAuthRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      loginError.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      loginError.style.display = 'none';
    });
  }

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  // Modal de Termos de Uso, Contrato e LGPD
  const btnOpenTermsModal = document.getElementById('btnOpenTermsModal');
  const btnCloseTermsModal = document.getElementById('btnCloseTermsModal');
  const btnCancelTermsModal = document.getElementById('btnCancelTermsModal');
  const btnAcceptTermsFromModal = document.getElementById('btnAcceptTermsFromModal');
  const termsModal = document.getElementById('termsModal');

  if (btnOpenTermsModal) {
    btnOpenTermsModal.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal('termsModal');
    });
  }

  if (btnCloseTermsModal) {
    btnCloseTermsModal.addEventListener('click', () => closeModal('termsModal'));
  }

  if (btnCancelTermsModal) {
    btnCancelTermsModal.addEventListener('click', () => closeModal('termsModal'));
  }

  if (btnAcceptTermsFromModal) {
    btnAcceptTermsFromModal.addEventListener('click', () => {
      const chk = document.getElementById('regAcceptTerms');
      if (chk) chk.checked = true;
      closeModal('termsModal');
      showToast('Termos Aceitos', 'Consentimento registrado conforme a LGPD. Prossiga com o cadastro.', '🛡️');
      const errorAlert = document.getElementById('loginError');
      if (errorAlert) errorAlert.style.display = 'none';
    });
  }

  if (termsModal) {
    termsModal.addEventListener('click', (e) => {
      if (e.target === termsModal) closeModal('termsModal');
    });
  }

  // Validação em Tempo Real de Nome de Usuário
  const regUsernameInput = document.getElementById('regUsername');
  const regUsernameFeedback = document.getElementById('regUsernameFeedback');
  if (regUsernameInput && regUsernameFeedback) {
    regUsernameInput.addEventListener('input', () => {
      loadUsersDatabase();
      const val = regUsernameInput.value.trim().toLowerCase();
      if (!val) {
        regUsernameFeedback.style.display = 'none';
        return;
      }
      const isTaken = appState.users.some(u => u.username && u.username.toLowerCase() === val);
      regUsernameFeedback.style.display = 'block';
      if (isTaken) {
        regUsernameFeedback.style.color = 'var(--danger)';
        regUsernameFeedback.textContent = `❌ @${val} já está cadastrado.`;
      } else {
        regUsernameFeedback.style.color = 'var(--success)';
        regUsernameFeedback.textContent = `✓ @${val} disponível!`;
      }
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.addEventListener('click', handleLogout);

  // Navegação Principal (Catálogo | Comunidade | Chats | Perfil)
  const btnViewCatalog = document.getElementById('btnViewCatalog');
  if (btnViewCatalog) btnViewCatalog.addEventListener('click', () => switchView('catalog'));

  const btnViewCommunity = document.getElementById('btnViewCommunity');
  if (btnViewCommunity) btnViewCommunity.addEventListener('click', () => switchView('community'));

  const btnViewChats = document.getElementById('btnViewChats');
  if (btnViewChats) btnViewChats.addEventListener('click', () => switchView('chats'));

  const btnViewProfile = document.getElementById('btnViewProfile');
  if (btnViewProfile) btnViewProfile.addEventListener('click', () => switchView('profile'));

  // Navegação Inferior para Celular (Mobile Bottom Dock)
  const mobileNavCatalog = document.getElementById('mobileNavCatalog');
  if (mobileNavCatalog) mobileNavCatalog.addEventListener('click', () => switchView('catalog'));

  const mobileNavCommunity = document.getElementById('mobileNavCommunity');
  if (mobileNavCommunity) mobileNavCommunity.addEventListener('click', () => switchView('community'));

  const mobileNavChats = document.getElementById('mobileNavChats');
  if (mobileNavChats) mobileNavChats.addEventListener('click', () => switchView('chats'));

  const mobileNavProfile = document.getElementById('mobileNavProfile');
  if (mobileNavProfile) mobileNavProfile.addEventListener('click', () => switchView('profile'));

  // Controles e Eventos do Módulo de Chats
  const chatFriendsSearchInput = document.getElementById('chatFriendsSearchInput');
  if (chatFriendsSearchInput) {
    chatFriendsSearchInput.addEventListener('input', (e) => {
      appState.chatSearchQuery = e.target.value;
      renderChatFriendsList();
    });
  }

  const chatFriendsListContainer = document.getElementById('chatFriendsListContainer');
  if (chatFriendsListContainer) {
    chatFriendsListContainer.addEventListener('click', (e) => {
      if (e.target.closest('.btn-chat-item-delete')) return;
      const item = e.target.closest('.chat-friend-item');
      if (item) {
        const friendId = item.getAttribute('data-friend-id');
        if (friendId) {
          selectChatFriend(friendId);
        }
      }
    });
    chatFriendsListContainer.addEventListener('keydown', (e) => {
      if (e.target.closest('.btn-chat-item-delete')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.chat-friend-item');
        if (item) {
          e.preventDefault();
          const friendId = item.getAttribute('data-friend-id');
          if (friendId) selectChatFriend(friendId);
        }
      }
    });
  }

  const chatMessageForm = document.getElementById('chatMessageForm');
  if (chatMessageForm) {
    chatMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chatMessageInput');
      if (input) {
        sendChatMessage(input.value);
      }
    });
  }

  // Botão do Header para Excluir Chat Ativo [RF-20]
  const btnActiveChatDeleteChat = document.getElementById('btnActiveChatDeleteChat');
  if (btnActiveChatDeleteChat) {
    btnActiveChatDeleteChat.addEventListener('click', () => {
      if (appState.selectedChatFriendId) {
        deleteChatWithFriend(appState.selectedChatFriendId);
      } else {
        showToast('Nenhum Chat Selecionado', 'Selecione uma conversa para excluir.', 'ℹ️');
      }
    });
  }

  const btnChatBackToList = document.getElementById('btnChatBackToList');
  if (btnChatBackToList) {
    btnChatBackToList.addEventListener('click', () => {
      const wrapper = document.querySelector('.chats-layout-wrapper');
      if (wrapper) wrapper.classList.remove('mobile-chat-open');
    });
  }

  document.querySelectorAll('.quick-reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      if (!emoji) return;
      const input = document.getElementById('chatMessageInput');
      if (input) {
        if (!input.value.trim()) {
          sendChatMessage(emoji);
        } else {
          input.value += ` ${emoji}`;
          input.focus();
        }
      }
    });
  });

  const navProfileShortcut = document.getElementById('navProfileShortcut');
  if (navProfileShortcut) navProfileShortcut.addEventListener('click', () => switchView('profile'));

  const brandHomeBtn = document.getElementById('brandHomeBtn');
  if (brandHomeBtn) brandHomeBtn.addEventListener('click', () => switchView('catalog'));

  // Sub-Abas do Catálogo (Meu Acervo | Minhas Listas | Missões)
  const subTabCatalog = document.getElementById('subTabCatalog');
  const subTabLists = document.getElementById('subTabLists');
  const subTabMissions = document.getElementById('subTabMissions');

  if (subTabCatalog) subTabCatalog.addEventListener('click', () => switchCatalogSubTab('catalog'));
  if (subTabLists) subTabLists.addEventListener('click', () => switchCatalogSubTab('lists'));
  if (subTabMissions) subTabMissions.addEventListener('click', () => switchCatalogSubTab('missions'));

  // Sub-Abas da Comunidade (Membros | Solicitações | Feed)
  const subTabCommunityMembers = document.getElementById('subTabCommunityMembers');
  const subTabCommunityRequests = document.getElementById('subTabCommunityRequests');
  const subTabCommunityFeed = document.getElementById('subTabCommunityFeed');

  if (subTabCommunityMembers) subTabCommunityMembers.addEventListener('click', () => switchCommunitySubTab('members'));
  if (subTabCommunityRequests) subTabCommunityRequests.addEventListener('click', () => switchCommunitySubTab('requests'));
  if (subTabCommunityFeed) subTabCommunityFeed.addEventListener('click', () => switchCommunitySubTab('feed'));

  // Busca na Comunidade
  const communitySearchInput = document.getElementById('communitySearchInput');
  if (communitySearchInput) {
    communitySearchInput.addEventListener('input', (e) => {
      appState.communitySearchQuery = e.target.value;
      renderCommunityGrid();
    });
  }

  // Modais de Criação de Lista
  const btnOpenCreateListModal = document.getElementById('btnOpenCreateListModal');
  if (btnOpenCreateListModal) btnOpenCreateListModal.addEventListener('click', () => openCreateListModal());

  const btnCloseCustomListModal = document.getElementById('btnCloseCustomListModal');
  if (btnCloseCustomListModal) btnCloseCustomListModal.addEventListener('click', () => closeModal('customListModal'));

  const btnCancelCustomList = document.getElementById('btnCancelCustomList');
  if (btnCancelCustomList) btnCancelCustomList.addEventListener('click', () => closeModal('customListModal'));

  const customListForm = document.getElementById('customListForm');
  if (customListForm) customListForm.addEventListener('submit', saveCustomList);

  const btnCloseViewListModal = document.getElementById('btnCloseViewListModal');
  if (btnCloseViewListModal) btnCloseViewListModal.addEventListener('click', () => closeModal('viewCustomListModal'));

  // Modal de Retrospectiva Wrapped
  const btnOpenWrapped = document.getElementById('btnOpenWrapped');
  if (btnOpenWrapped) btnOpenWrapped.addEventListener('click', openWrappedModal);

  const btnCardOpenWrapped = document.getElementById('btnCardOpenWrapped');
  if (btnCardOpenWrapped) btnCardOpenWrapped.addEventListener('click', openWrappedModal);

  const btnDashboardWrapped = document.getElementById('btnDashboardWrapped');
  if (btnDashboardWrapped) btnDashboardWrapped.addEventListener('click', openWrappedModal);

  const btnCloseWrapped = document.getElementById('btnCloseWrapped');
  if (btnCloseWrapped) btnCloseWrapped.addEventListener('click', () => closeModal('wrappedModal'));

  const btnWrappedPrev = document.getElementById('btnWrappedPrev');
  if (btnWrappedPrev) {
    btnWrappedPrev.addEventListener('click', () => {
      if (appState.currentWrappedSlide > 0) {
        appState.currentWrappedSlide--;
        renderWrappedSlide(appState.currentWrappedSlide);
      }
    });
  }

  const btnWrappedNext = document.getElementById('btnWrappedNext');
  if (btnWrappedNext) {
    btnWrappedNext.addEventListener('click', () => {
      if (appState.currentWrappedSlide < 3) {
        appState.currentWrappedSlide++;
        renderWrappedSlide(appState.currentWrappedSlide);
      } else {
        closeModal('wrappedModal');
      }
    });
  }

  const btnWrappedShare = document.getElementById('btnWrappedShare');
  if (btnWrappedShare) btnWrappedShare.addEventListener('click', shareWrappedSummary);

  // Modal de Importação / Exportação CSV
  const btnOpenCsvModal = document.getElementById('btnOpenCsvModal');
  if (btnOpenCsvModal) {
    btnOpenCsvModal.addEventListener('click', () => {
      const feedback = document.getElementById('csvImportFeedback');
      if (feedback) feedback.style.display = 'none';
      openModal('csvModal');
    });
  }

  const btnCloseCsvModal = document.getElementById('btnCloseCsvModal');
  if (btnCloseCsvModal) btnCloseCsvModal.addEventListener('click', () => closeModal('csvModal'));

  const tabCsvImport = document.getElementById('tabCsvImport');
  const tabCsvExport = document.getElementById('tabCsvExport');
  const csvImportPane = document.getElementById('csvImportPane');
  const csvExportPane = document.getElementById('csvExportPane');

  if (tabCsvImport && tabCsvExport) {
    tabCsvImport.addEventListener('click', () => {
      tabCsvImport.classList.add('active');
      tabCsvExport.classList.remove('active');
      csvImportPane.style.display = 'block';
      csvExportPane.style.display = 'none';
    });

    tabCsvExport.addEventListener('click', () => {
      tabCsvExport.classList.add('active');
      tabCsvImport.classList.remove('active');
      csvExportPane.style.display = 'block';
      csvImportPane.style.display = 'none';
    });
  }

  const btnDownloadCsvTemplate = document.getElementById('btnDownloadCsvTemplate');
  if (btnDownloadCsvTemplate) btnDownloadCsvTemplate.addEventListener('click', downloadCsvTemplate);

  const btnLoadDemoData = document.getElementById('btnLoadDemoData');
  if (btnLoadDemoData) btnLoadDemoData.addEventListener('click', loadDemoData);

  const btnExportCsv = document.getElementById('btnExportCsv');
  if (btnExportCsv) btnExportCsv.addEventListener('click', () => exportData('csv'));

  const btnExportJson = document.getElementById('btnExportJson');
  if (btnExportJson) btnExportJson.addEventListener('click', () => exportData('json'));

  const btnSelectCsvFile = document.getElementById('btnSelectCsvFile');
  const csvFileInput = document.getElementById('csvFileInput');
  if (btnSelectCsvFile && csvFileInput) {
    btnSelectCsvFile.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) importFromCsv(e.target.files[0]);
    });
  }

  const csvDropzone = document.getElementById('csvDropzone');
  if (csvDropzone) {
    csvDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      csvDropzone.style.borderColor = 'var(--accent-primary)';
    });
    csvDropzone.addEventListener('dragleave', () => {
      csvDropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
    });
    csvDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      csvDropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
      if (e.dataTransfer.files[0]) importFromCsv(e.dataTransfer.files[0]);
    });
  }

  // Mudança de Categoria no Modal de Mídia (Atualiza campos de status, episódios, provedores)
  const itemCategorySelect = document.getElementById('itemCategory');
  if (itemCategorySelect) {
    itemCategorySelect.addEventListener('change', (e) => {
      updateModalFieldsByCategory(e.target.value);
    });
  }

  // Filtro de Status Específico na Controls-Bar
  const statusFilterSelect = document.getElementById('statusFilterSelect');
  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', (e) => {
      appState.selectedStatus = e.target.value;
      renderMediaGrid();
    });
  }

  // Upload e Remoção de Foto de Perfil
  const btnTriggerUpload = document.getElementById('btnTriggerUpload');
  const avatarFileInput = document.getElementById('avatarFileInput');
  if (btnTriggerUpload && avatarFileInput) {
    btnTriggerUpload.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2.5 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem de até 2.5 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (appState.currentUser) {
          appState.currentUser.avatar = event.target.result;
          renderProfileUI();
          showToast('Foto Carregada!', 'Prévia atualizada. Salve para confirmar.', '📷');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const btnRemovePhoto = document.getElementById('btnRemovePhoto');
  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener('click', () => {
      if (appState.currentUser) {
        appState.currentUser.avatar = '';
        renderProfileUI();
        showToast('Foto Removida', 'O perfil usará sua inicial.', 'ℹ️');
      }
    });
  }

  // Formulário de Edição de Perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!appState.currentUser) return;

      const newName = document.getElementById('editName').value.trim();
      const newUsername = document.getElementById('editUsername').value.trim().toLowerCase();
      const newPassword = document.getElementById('editPassword').value.trim();
      const newBio = document.getElementById('editBio').value.trim();
      const isPrivate = document.getElementById('editIsPrivate').checked;
      const equippedTitle = document.getElementById('editEquippedTitle').value;

      if (!newName || !newUsername || !newPassword) {
        alert('Nome, usuário e senha são obrigatórios!');
        return;
      }

      const duplicate = appState.users.some(u => 
        u.id !== appState.currentUser.id && 
        u.username && u.username.toLowerCase() === newUsername
      );

      if (duplicate) {
        alert('Este nome de usuário já está sendo utilizado.');
        return;
      }

      appState.currentUser.name = newName;
      appState.currentUser.username = newUsername;
      appState.currentUser.password = newPassword;
      appState.currentUser.bio = newBio;
      appState.currentUser.isPrivate = isPrivate;
      appState.currentUser.equippedTitle = equippedTitle;

      saveCurrentUser();
      ConfettiEngine.trigger(2000);
      showToast('Perfil Atualizado!', 'Alterações salvas com sucesso.', '✓');
    });
  }

  // Seletor de Estrelas
  setupStarPicker();
  setStarRating(5);

  // Modais de Criação e Edição de Mídia
  const btnOpenModal = document.getElementById('btnOpenModal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      resetMediaForm();
      openModal('mediaModal');
    });
  }

  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) btnCloseModal.addEventListener('click', () => closeModal('mediaModal'));

  const btnCancelModal = document.getElementById('btnCancelModal');
  if (btnCancelModal) btnCancelModal.addEventListener('click', () => closeModal('mediaModal'));

  // Modal de Conquistas
  const btnOpenAchievements = document.getElementById('btnOpenAchievements');
  if (btnOpenAchievements) {
    btnOpenAchievements.addEventListener('click', () => {
      renderAchievementsModal();
      openModal('achievementsModal');
    });
  }

  const btnCloseAchievements = document.getElementById('btnCloseAchievements');
  if (btnCloseAchievements) {
    btnCloseAchievements.addEventListener('click', () => closeModal('achievementsModal'));
  }

  const achTabButtons = document.querySelectorAll('#achievementsTabs .tab-btn');
  achTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      achTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.selectedAchCategory = btn.getAttribute('data-ach-cat');
      renderAchievementsModal();
    });
  });

  // Modal de Catálogo de Membro
  const btnCloseUserCatalogModal = document.getElementById('btnCloseUserCatalogModal');
  if (btnCloseUserCatalogModal) {
    btnCloseUserCatalogModal.addEventListener('click', () => closeModal('userCatalogModal'));
  }

  // Controles de Capa
  const tabCoverUrl = document.getElementById('tabCoverUrl');
  const tabCoverFile = document.getElementById('tabCoverFile');
  const itemCoverUrl = document.getElementById('itemCoverUrl');
  const btnTriggerCoverFile = document.getElementById('btnTriggerCoverFile');
  const itemCoverFile = document.getElementById('itemCoverFile');
  const btnClearCover = document.getElementById('btnClearCover');

  if (tabCoverUrl && tabCoverFile) {
    tabCoverUrl.addEventListener('click', () => switchCoverTab('url'));
    tabCoverFile.addEventListener('click', () => switchCoverTab('file'));
  }

  if (itemCoverUrl) {
    itemCoverUrl.addEventListener('input', (e) => {
      setCoverPreview(e.target.value.trim());
    });
  }

  if (btnTriggerCoverFile && itemCoverFile) {
    btnTriggerCoverFile.addEventListener('click', () => itemCoverFile.click());

    itemCoverFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2.5 * 1024 * 1024) {
        alert('Selecione uma imagem de até 2.5 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnClearCover) {
    btnClearCover.addEventListener('click', () => {
      setCoverPreview('');
    });
  }

  // Submissão do Formulário de Registro de Mídia
  const mediaForm = document.getElementById('mediaForm');
  if (mediaForm) {
    mediaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!appState.currentUser) return;

      const editId = document.getElementById('editItemId').value;
      const title = document.getElementById('itemTitle').value.trim();
      const category = document.getElementById('itemCategory').value;
      const status = document.getElementById('itemStatus').value;
      const rating = Number(document.getElementById('itemRating').value) || 5;
      const comment = document.getElementById('itemComment').value.trim();
      const isSpoiler = Boolean(document.getElementById('itemIsSpoiler')?.checked);
      const coverImage = (document.getElementById('itemCoverValue').value || '').trim();

      // Progresso e Horas
      const progCurrent = Number(document.getElementById('itemProgressCurrent').value) || 0;
      const progTotal = Number(document.getElementById('itemProgressTotal').value) || 0;
      const season = Number(document.getElementById('itemSeason')?.value) || 1;
      const hours = Number(document.getElementById('itemHoursSpent').value) || (category === 'jogo' ? 40 : 2);
      const isRewatch = document.getElementById('itemIsRewatch').checked;

      // Diário de Datas
      const startedAt = document.getElementById('itemDateStarted').value;
      const finishedAt = document.getElementById('itemDateFinished').value || new Date().toLocaleDateString('pt-BR');

      const xp = calculateItemXp(rating, comment, status);
      let items = appState.currentUser.items || [];

      if (editId) {
        const index = items.findIndex(i => i.id === editId);
        if (index !== -1) {
          items[index] = {
            ...items[index],
            title,
            category,
            status,
            rating,
            comment,
            isSpoiler,
            coverImage,
            xpGained: xp,
            progress: { current: progCurrent, total: progTotal, season, hours },
            providers: [...appState.selectedProviders],
            isRewatch,
            consumptionLogs: [{ startedAt, finishedAt, isRewatch }]
          };
          saveCurrentUser();
          renderMediaGrid();
          renderProfileDashboard();
          showToast('Registro Atualizado!', `"${title}" foi atualizado.`, '✓');
        }
      } else {
        const newItem = {
          id: 'item_' + Date.now(),
          title,
          category,
          status,
          rating,
          comment,
          isSpoiler,
          coverImage,
          xpGained: xp,
          progress: { current: progCurrent, total: progTotal, season, hours },
          providers: [...appState.selectedProviders],
          isRewatch,
          consumptionLogs: [{ startedAt, finishedAt, isRewatch }],
          createdAt: new Date().toLocaleDateString('pt-BR')
        };
        items.unshift(newItem);
        appState.currentUser.items = items;
        saveCurrentUser();
        renderMediaGrid();
        renderProfileDashboard();
        ConfettiEngine.trigger(2200);
        showToast(
          status === 'platinado' ? '🏆 NOVO PLATINADO REGISTRADO!' : 'Novo Registro Adicionado!',
          `Você ganhou <strong>+${xp} XP</strong> com "${title}"!`,
          status === 'platinado' ? '🏆' : '⚡'
        );

        // Adiciona evento ao feed de atividades
        addActivityFeedEvent({
          type: status === 'platinado' ? 'platina' : 'item',
          title: status === 'platinado' ? 'conquistou o status PLATINADO 🏆 em' : `adicionou "${title}" ao catálogo`,
          mediaTitle: title,
          coverImage,
          rating,
          comment,
          isSpoiler
        });
      }

      closeModal('mediaModal');
    });
  }

  // Sub-aba de Usuários Bloqueados na Comunidade
  const subTabCommunityBlocked = document.getElementById('subTabCommunityBlocked');
  if (subTabCommunityBlocked) {
    subTabCommunityBlocked.addEventListener('click', () => switchCommunitySubTab('blocked'));
  }

  // Modal de Denúncia de Conteúdo (Reports)
  const btnCloseReportModal = document.getElementById('btnCloseReportModal');
  const btnCancelReportModal = document.getElementById('btnCancelReportModal');
  const reportForm = document.getElementById('reportForm');

  if (btnCloseReportModal) {
    btnCloseReportModal.addEventListener('click', () => closeModal('reportModal'));
  }
  if (btnCancelReportModal) {
    btnCancelReportModal.addEventListener('click', () => closeModal('reportModal'));
  }
  if (reportForm) {
    reportForm.addEventListener('submit', handleReportSubmit);
  }

  // Modal de Exclusão de Perfil (Zona de Perigo)
  const btnOpenDeleteAccountModal = document.getElementById('btnOpenDeleteAccountModal');
  if (btnOpenDeleteAccountModal) {
    btnOpenDeleteAccountModal.addEventListener('click', openDeleteAccountModal);
  }

  const btnCloseDeleteAccountModal = document.getElementById('btnCloseDeleteAccountModal');
  if (btnCloseDeleteAccountModal) {
    btnCloseDeleteAccountModal.addEventListener('click', () => closeModal('deleteAccountModal'));
  }

  const btnCancelDeleteAccount = document.getElementById('btnCancelDeleteAccount');
  if (btnCancelDeleteAccount) {
    btnCancelDeleteAccount.addEventListener('click', () => closeModal('deleteAccountModal'));
  }

  const btnConfirmDeleteAccount = document.getElementById('btnConfirmDeleteAccount');
  if (btnConfirmDeleteAccount) {
    btnConfirmDeleteAccount.addEventListener('click', handleDeleteAccountConfirm);
  }

  // Abas de Categoria do Catálogo
  const tabButtons = document.querySelectorAll('.controls-bar .category-tabs .tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.selectedCategory = btn.getAttribute('data-category');
      renderMediaGrid();
    });
  });

  // Campo de Busca no Catálogo
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderMediaGrid();
    });
  }

  // Inicializar Sessão
  checkSession();

  // Modal de Acesso pelo Celular & QR Code
  initMobileAccessModule();
});

// ==========================================================================
// Módulo de Acesso Mobile (Wi-Fi & QR Code Dinâmico)
// ==========================================================================

let qrCodeInstance = null;

async function getMobileAccessUrl() {
  // Se já estiver sendo servido via HTTP/HTTPS e não em localhost
  if (window.location.protocol.startsWith('http')) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }

  // Tenta consultar a API do servidor local para pegar o IP exato
  try {
    const res = await fetch('/api/info', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return data.url;
    }
  } catch (e) {}

  // Fallback padrão com o IP da rede local identificado
  return 'http://192.168.0.17:8080';
}

async function openMobileAccessModal() {
  const url = await getMobileAccessUrl();
  const inputEl = document.getElementById('mobileAccessUrlInput');
  if (inputEl) inputEl.value = url;

  const container = document.getElementById('mobileQrContainer');
  if (container) {
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      qrCodeInstance = new QRCode(container, {
        text: url,
        width: 190,
        height: 190,
        colorDark: '#080a0f',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      container.innerHTML = `<div style="padding: 1rem; color: #111; font-size: 0.85rem; word-break: break-all;">${url}</div>`;
    }
  }

  openModal('mobileAccessModal');
}

function copyMobileAccessUrl() {
  const inputEl = document.getElementById('mobileAccessUrlInput');
  if (!inputEl) return;
  const url = inputEl.value;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link Copiado!', 'Endereço copiado para a área de transferência.', '📋');
    }).catch(() => {
      inputEl.select();
      document.execCommand('copy');
      showToast('Link Copiado!', 'Endereço copiado para a área de transferência.', '📋');
    });
  } else {
    inputEl.select();
    document.execCommand('copy');
    showToast('Link Copiado!', 'Endereço copiado para a área de transferência.', '📋');
  }
}

function initMobileAccessModule() {
  const btnOpenMobileModal = document.getElementById('btnOpenMobileModal');
  const btnCloseMobileModal = document.getElementById('btnCloseMobileModal');
  const btnOkMobileModal = document.getElementById('btnOkMobileModal');
  const btnCopyMobileUrl = document.getElementById('btnCopyMobileUrl');

  if (btnOpenMobileModal) btnOpenMobileModal.addEventListener('click', openMobileAccessModal);
  if (btnCloseMobileModal) btnCloseMobileModal.addEventListener('click', () => closeModal('mobileAccessModal'));
  if (btnOkMobileModal) btnOkMobileModal.addEventListener('click', () => closeModal('mobileAccessModal'));
  if (btnCopyMobileUrl) btnCopyMobileUrl.addEventListener('click', copyMobileAccessUrl);

  // Registro de Service Worker para suporte PWA no celular
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
