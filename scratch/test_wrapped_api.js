const jwt = require("jsonwebtoken");
const http = require("http");

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

async function testWrapped() {
  console.log("=== TESTANDO NOVO ENDPOINT DE WRAPPED ===");

  // 1. Testar GET /api/wrapped
  const res = await request("/api/wrapped");
  console.log("GET /api/wrapped Status:", res.status);
  if (res.status !== 200) {
    console.error("Erro no GET:", res.data);
    process.exit(1);
  }

  const { user, archetype, stats, slides, share_summary_text } = res.data;
  console.log("Usuário:", user.name, "Nível:", user.current_level, "Título:", user.equipped_title);
  console.log("Arquétipo:", archetype.name, archetype.icon, "-", archetype.badge);
  console.log("Obras:", stats.total_items, "Horas:", stats.total_hours, "Troféus:", stats.achievements_count);
  console.log(`Slides gerados: ${slides.length}`);
  slides.forEach((s, idx) => {
    console.log(`  [Slide ${idx + 1}] ${s.icon} ${s.title} (${s.type})`);
  });
  console.log("\nTexto de compartilhamento:");
  console.log(share_summary_text);

  console.log("\n✓ Teste de GET /api/wrapped passou com sucesso!");
  process.exit(0);
}

testWrapped().catch(e => {
  console.error("Falha no teste:", e);
  process.exit(1);
});
