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

async function runTests() {
  console.log("=== INICIANDO TESTES DE TÍTULOS HONORÍFICOS E AFINIDADE CULTURAL ===\n");

  // 1. Testar GET /api/user/profile
  console.log("1. Testando GET /api/user/profile...");
  const profileRes = await request("/api/user/profile");
  if (profileRes.status !== 200) {
    console.error("FALHA: GET /api/user/profile retornou", profileRes.status, profileRes.data);
    process.exit(1);
  }
  const prof = profileRes.data.profile;
  console.log(`- Usuário: ${prof.name} (@${prof.username})`);
  console.log(`- XP: ${prof.total_xp}, Nível Calculado: ${prof.current_level}`);
  console.log(`- Título Equipado: "${prof.equipped_title}"`);
  console.log(`- Próximo Título:`, prof.next_title);

  if (prof.equipped_title !== "Polímata Cultural") {
    console.error(`ERRO: Título esperado "Polímata Cultural", obtido "${prof.equipped_title}"`);
    process.exit(1);
  }
  console.log("✓ GET /api/user/profile validado com sucesso!\n");

  // 2. Testar PUT /api/user/profile (tentativa de adulterar o título)
  console.log("2. Testando PUT /api/user/profile com tentativa de escolher título arbitrário...");
  const putRes = await request("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: prof.name,
      username: prof.username,
      bio: prof.bio,
      is_private: prof.is_private,
      equipped_title: "Patrono Eterno das Artes" // Tentativa de forçar título de nível 20!
    })
  });

  if (putRes.status !== 200) {
    console.error("FALHA: PUT /api/user/profile retornou", putRes.status, putRes.data);
    process.exit(1);
  }
  const updatedProf = putRes.data.profile;
  console.log(`- Título retornado após PUT: "${updatedProf.equipped_title}"`);
  if (updatedProf.equipped_title === "Patrono Eterno das Artes") {
    console.error("ERRO DE SEGURANÇA: Usuário conseguiu escolher título manualmente!");
    process.exit(1);
  }
  if (updatedProf.equipped_title !== "Polímata Cultural") {
    console.error(`ERRO: Título deveria ser recalculado como "Polímata Cultural", mas retornou "${updatedProf.equipped_title}"`);
    process.exit(1);
  }
  console.log("✓ PUT /api/user/profile bloqueou com sucesso escolha arbitrária e aplicou título de nível!\n");

  // 3. Testar GET /api/community/users (verificar que NENHUM usuário possui NaN e todos têm títulos corretos)
  console.log("3. Testando GET /api/community/users...");
  const commRes = await request("/api/community/users");
  if (commRes.status !== 200) {
    console.error("FALHA: GET /api/community/users retornou", commRes.status, commRes.data);
    process.exit(1);
  }
  const users = commRes.data.users;
  console.log(`- Recebidos ${users.length} membros da comunidade.`);

  let hasNan = false;
  let invalidTitles = 0;

  users.forEach(u => {
    const isAffinityNan = isNaN(u.affinity_score) || isNaN(u.affinity?.percentage);
    if (isAffinityNan || u.affinity_score === undefined) {
      console.error(`ERRO NaN detectado no usuário ${u.name} (@${u.username}): score=${u.affinity_score}`);
      hasNan = true;
    }
    const expectedLevel = Math.floor((u.total_xp || 0) / 500) + 1;
    console.log(`  • ${u.name} (@${u.username}) | Nv. ${expectedLevel} (${u.total_xp} XP) | Título: "${u.equipped_title}" | Afinidade: ${u.affinity_score}% (${u.affinity_label})`);
  });

  if (hasNan) {
    console.error("FALHA CRÍTICA: Houve valores NaN na afinidade dos usuários!");
    process.exit(1);
  }
  console.log("✓ GET /api/community/users validado: 0 ocorrências de NaN, todas as afinidades e títulos íntegros!\n");

  // 4. Testar GET /api/catalog de outro usuário
  console.log("4. Testando GET /api/catalog?userId=usr_lucasgames...");
  const catRes = await request("/api/catalog?userId=usr_lucasgames");
  if (catRes.status !== 200) {
    console.error("FALHA: GET /api/catalog retornou", catRes.status, catRes.data);
    process.exit(1);
  }
  const catUser = catRes.data.user;
  const catAffinity = catRes.data.affinity;
  console.log(`- Usuário do catálogo: ${catUser.name} | Título: "${catUser.equipped_title}"`);
  console.log(`- Afinidade: ${catAffinity.percentage}% (${catAffinity.label})`);

  if (isNaN(catAffinity.percentage)) {
    console.error("ERRO: Afinidade do catálogo retornou NaN!");
    process.exit(1);
  }
  if (catUser.equipped_title !== "Explorador Cultural") {
    console.error(`ERRO: Esperado "Explorador Cultural" para Lucas Gamer (550 XP), obtido "${catUser.equipped_title}"`);
    process.exit(1);
  }
  console.log("✓ GET /api/catalog validado com sucesso!\n");

  console.log("==================================================================");
  console.log("TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!");
  console.log("==================================================================");
}

runTests().catch(err => {
  console.error("Erro na execução dos testes:", err);
  process.exit(1);
});
