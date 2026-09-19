const jwt = require("jsonwebtoken");
const http = require("http");
const pool = require("../src/lib/db.js").default;

const JWT_SECRET = process.env.JWT_SECRET || "keeplay-secret-key-123";
const token = jwt.sign({ id: "usr_rafael", username: "rafael" }, JWT_SECRET, { expiresIn: "7d" });

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        ...options,
        headers: {
          Cookie: `keeplay_token=${token}`,
          ...(options.headers || {})
        }
      },
      (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTest() {
  console.log("=== INICIANDO TESTE DE COMPARTILHAMENTO DO WRAPPED NO TIDB CLOUD ===\n");

  // 1. Obter dados do Wrapped
  console.log("1. Buscando dados do Wrapped...");
  const getRes = await request("/api/wrapped");
  if (getRes.status !== 200) {
    console.error("FALHA no GET /api/wrapped:", getRes.status, getRes.data);
    process.exit(1);
  }
  const { user, archetype, stats, top_media, share_summary_text } = getRes.data;
  console.log(`- Usuário: ${user.name} (@${user.username}) | XP anterior: ${user.total_xp}`);
  console.log(`- Arquétipo identificado: ${archetype.name} ${archetype.icon}`);
  console.log(`- Obra mais marcante: ${top_media ? top_media.title : 'N/A'}`);

  // 2. Testar Compartilhamento para o Feed (POST /api/wrapped)
  console.log("\n2. Publicando Wrapped no Feed da Comunidade (TiDB Cloud)...");
  const postRes = await request("/api/wrapped", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shareText: share_summary_text,
      archetype,
      topMedia: top_media
    })
  });

  if (postRes.status !== 200) {
    console.error("FALHA no POST /api/wrapped:", postRes.status, postRes.data);
    process.exit(1);
  }
  console.log("POST /api/wrapped Sucesso:", postRes.data);
  const feedId = postRes.data.feed_id;

  // 3. Verificar persistência direta no TiDB Cloud na tabela activity_feed
  console.log("\n3. Verificando persistência no TiDB Cloud (activity_feed)...");
  const [dbRows] = await pool.query("SELECT * FROM activity_feed WHERE id = ?", [feedId]);
  if (dbRows.length === 0) {
    console.error("ERRO: Registro não encontrado na tabela activity_feed do TiDB!");
    process.exit(1);
  }
  const feedPost = dbRows[0];
  console.log("- Registro encontrado no TiDB Cloud:");
  console.log(`  • ID: ${feedPost.id}`);
  console.log(`  • User ID: ${feedPost.user_id}`);
  console.log(`  • Activity Type: ${feedPost.activity_type}`);
  console.log(`  • Título: ${feedPost.title}`);
  console.log(`  • Media Título: ${feedPost.media_title}`);
  console.log(`  • Comentário / Resumo:\n${feedPost.comment}`);

  // 4. Testar visualização no feed via API pública de comunidade (/api/community)
  console.log("\n4. Testando GET /api/community...");
  const commRes = await request("/api/community");
  if (commRes.status !== 200) {
    console.error("FALHA no GET /api/community:", commRes.status, commRes.data);
    process.exit(1);
  }
  const postInFeed = commRes.data.feed.find(f => f.id === feedId);
  if (!postInFeed) {
    console.error("ERRO: Publicação do Wrapped não apareceu no feed retornado pela API!");
    process.exit(1);
  }
  console.log("- Post do Wrapped encontrado com sucesso no feed:");
  console.log(`  • Autor: ${postInFeed.user_name} (@${postInFeed.user_username})`);
  console.log(`  • Tipo de atividade: ${postInFeed.activity_type}`);
  console.log(`  • Curtidas: ${postInFeed.likes_count}`);

  console.log("\n==================================================================");
  console.log("TESTE DE COMPARTILHAMENTO DO WRAPPED CONCLUÍDO COM 100% DE SUCESSO!");
  console.log("==================================================================");
  process.exit(0);
}

runTest().catch(e => {
  console.error("Erro no teste:", e);
  process.exit(1);
});
