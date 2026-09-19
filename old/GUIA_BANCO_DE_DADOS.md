# 🚀 Guia Prático de Implantação do Banco de Dados SQL: Keeplay v2.0

Este guia foi elaborado para orientar você no processo de colocar o **Keeplay online com banco de dados centralizado**, garantindo que as contas de usuários, itens do acervo, amizades, reações, conquistas e **mensagens de chat em tempo real** fiquem permanentemente sincronizadas entre todos os membros na web.

---

## 📁 1. Arquivos de Banco de Dados Gerados

No projeto, você tem à disposição dois scripts prontos para produção:

| Arquivo | Dialeto SQL | Onde Usar (Recomendado) |
| :--- | :--- | :--- |
| [`schema.sql`](file:///c:/Users/Rafael/Documents/Projeto/schema.sql) | **PostgreSQL** | **Supabase**, **Neon.tech**, **Railway**, **Render**, AWS RDS PostgreSQL |
| [`schema_mysql.sql`](file:///c:/Users/Rafael/Documents/Projeto/schema_mysql.sql) | **MySQL 8.0+ / MariaDB** | **phpMyAdmin**, **Hostinger**, cPanel, PlanetScale, Locaweb |

Ambos os scripts contêm:
- **13+ tabelas relacionais** estruturadas com integridade referencial (`ON DELETE CASCADE`);
- **Tabela de Chats e Mensagens Diretas (`chat_messages`)** com índices otimizados para ordenação cronológica e contadores de mensagens não lidas;
- **Views analíticas** (`v_user_stats` e `v_chat_conversations`);
- **Carga de dados inicial (Seeds)**: Usuários de demonstração (`Rafael`, `Maria Eduarda`, `Lucas`, `Carol`), conexões de amizade, mensagens trocadas, itens no catálogo e feed social.

---

## 🌐 2. Qual serviço de banco de dados escolher para subir online?

### Opção 1: Supabase (⭐ Mais Recomendada para este projeto)
- **Por que escolher?**: Oferece **PostgreSQL gratuito na nuvem**, painel visual idêntico ao phpMyAdmin, e possui uma API pronta que permite que o seu site em HTML/JS conecte diretamente ao banco de dados com segurança (usando Row Level Security - RLS), sem que você seja obrigado a programar um servidor Node.js/Python do zero se não quiser. Além disso, o Supabase já tem suporte nativo a **WebSockets Realtime para chat instantâneo**!
- **Custo**: Gratuito.
- **Link**: [https://supabase.com](https://supabase.com)

### Opção 2: Neon Serverless Postgres
- **Por que escolher?**: Banco PostgreSQL Serverless de altíssima velocidade com plano gratuito generoso.
- **Link**: [https://neon.tech](https://neon.tech)

### Opção 3: Hospedagem com phpMyAdmin / cPanel (Hostinger, KingHost, etc.)
- **Por que escolher?**: Se você já contratou uma hospedagem PHP/MySQL tradicional.
- **Arquivo a usar**: [`schema_mysql.sql`](file:///c:/Users/Rafael/Documents/Projeto/schema_mysql.sql).

---

## 🛠️ 3. Passo a Passo: Subindo o Banco no Supabase (Em 3 Minutos)

1. **Crie sua conta**:
   - Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita (pode usar o GitHub ou e-mail).
2. **Crie um Novo Projeto**:
   - Clique em **"New Project"**.
   - Escolha um nome (ex: `keeplay-database`).
   - Defina uma senha forte para o banco de dados e escolha a região mais próxima (**São Paulo / South America**).
3. **Acesse o SQL Editor**:
   - No menu lateral esquerdo do painel, clique no ícone **"SQL Editor"** (ícone `>_`).
   - Clique em **"New Query"**.
4. **Execute o Script**:
   - Abra o arquivo [`schema.sql`](file:///c:/Users/Rafael/Documents/Projeto/schema.sql) deste projeto.
   - Copie todo o conteúdo do arquivo e cole na caixa do SQL Editor.
   - Clique no botão verde **"Run"** (no canto inferior direito).
5. **Pronto! 🎉**:
   - Clique em **"Table Editor"** no menu lateral para visualizar todas as suas tabelas (`users`, `chat_messages`, `media_items`, `user_connections`, etc.) já criadas e populadas com os dados demonstrativos!

---

## 🛠️ 4. Passo a Passo: Subindo no MySQL / phpMyAdmin (Hostinger, cPanel)

1. Acesse o painel da sua hospedagem e abra o **phpMyAdmin**.
2. Selecione a base de dados criada para o site.
3. Clique na aba superior **"Importar"** (ou **"Import"**).
4. Clique em **"Escolher arquivo"** e selecione o arquivo [`schema_mysql.sql`](file:///c:/Users/Rafael/Documents/Projeto/schema_mysql.sql).
5. Certifique-se de que a codificação está em `utf-8` e clique em **"Executar"**.
6. Todas as tabelas, índices e dados iniciais serão criados automaticamente.

---

## ☁️ 4.1. TiDB Cloud (Implantação de Produção Ativa)

O banco de dados de produção do Keeplay foi implantado com sucesso no cluster **TiDB Cloud Serverless** (AWS São Paulo `sa-east-1`).

- **Status**: ✅ **Ativo e Populado em Produção**
- **Host**: `gateway01.sa-east-1.prod.aws.tidbcloud.com`
- **Porta**: `4000`
- **Base de Dados**: `keeplay`
- **Dialeto**: MySQL 8.0+ / TiDB UTF8MB4
- **Arquivo de Conexão**: [`conexao_db.txt`](file:///c:/Users/Rafael/Documents/Projeto/conexao_db.txt)
- **Tabelas Geradas**: 18 tabelas relacionais + 2 views analíticas (`v_user_stats`, `v_chat_conversations`) + Seeds iniciais.

### Exemplo de Conexão no Backend (Node.js com mysql2):
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: 'mysql://4Db9TkTCgRce3Xz.root:V0fk1CTSF29NoFzv@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/keeplay',
  ssl: {
    rejectUnauthorized: true
  }
});

// Testar conexão
async function testarConexao() {
  const [rows] = await pool.query('SELECT * FROM v_user_stats');
  console.log('Estatísticas dos Usuários:', rows);
}
```

---

## 🔌 5. Como o Site se Conecta ao Banco Online?

Atualmente, o Keeplay armazena os dados no `localStorage` do navegador de cada pessoa. Para que todos os usuários compartilhem a mesma base de dados online (ver amigos reais, trocar mensagens de chat pela internet e ver o feed dos outros), você tem duas rotas de integração:

### Rota A: Conexão Direta com Supabase no Front-end (Sem Backend Node.js)
Basta adicionar a biblioteca do Supabase no `<head>` do [`index.html`](file:///c:/Users/Rafael/Documents/Projeto/index.html):
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
E inicializar o cliente no JavaScript com as chaves públicas do seu projeto Supabase:
```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-publica-anon';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exemplo: Buscar mensagens de chat do banco online
async function carregarMensagensOnline(amigoId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`and(sender_id.eq.${appState.currentUser.id},receiver_id.eq.${amigoId}),and(sender_id.eq.${amigoId},receiver_id.eq.${appState.currentUser.id})`)
    .order('created_at', { ascending: true });
    
  return data;
}

// Exemplo: Enviar mensagem de chat online
async function enviarMensagemOnline(destinatarioId, texto) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      id: 'msg_' + Date.now(),
      sender_id: appState.currentUser.id,
      receiver_id: destinatarioId,
      message_text: texto,
      is_read: false
    }]);
}

// Exemplo: Chat em tempo real (Realtime WebSocket!)
supabase
  .channel('chat_messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
    console.log('Nova mensagem recebida online:', payload.new);
    // Adiciona na conversa instantaneamente
  })
  .subscribe();
```

### Rota B: Servidor Backend Próprio (Node.js / Express / Fastify)
Caso prefira hospedar uma API própria (ex: no Railway, Render ou VPS):
1. Crie uma aplicação Node.js com Express;
2. Conecte ao banco usando a biblioteca `pg` (PostgreSQL) ou `mysql2` (MySQL);
3. Crie os endpoints REST listados na seção 4 do documento [`DOCUMENTACAO_SISTEMA.md`](file:///c:/Users/Rafael/Documents/Projeto/DOCUMENTACAO_SISTEMA.md);
4. O `app.js` fará chamadas `fetch('https://sua-api.com/api/...')` em vez de ler do `localStorage`.

---

## 🔒 6. Recomendações de Segurança para Produção

1. **Senhas Criptografadas**:
   - Em produção, nunca salve senhas em texto puro. Utilize bibliotecas como `bcrypt` ou o módulo nativo de autenticação do Supabase Auth (`supabase.auth.signUp()`), que já cuida de criptografia e tokens JWT automaticamente.
2. **Backups Periódicos**:
   - Tanto o Supabase quanto os painéis cPanel permitem ativar backups automáticos diários.
3. **Variáveis de Ambiente**:
   - Se for utilizar um backend próprio, armazene as credenciais do banco (`DATABASE_URL`, senhas) em arquivos `.env` e nunca os envie para repositórios públicos.
