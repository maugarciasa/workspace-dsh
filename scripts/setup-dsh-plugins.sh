#!/usr/bin/env bash
#
# setup-dsh-plugins.sh - Provisiona todos os plugins do DSH (Linux / macOS)
#
# Uso: bash scripts/setup-dsh-plugins.sh [--force]
#   --force  sobrescreve pins existentes no package.json do perfil que divergirem
#            dos valores gerenciados por este script.
#

set -euo pipefail

# O DSH exporta DSH_PROFILE_DIR apontando para o perfil ativo. Instalações via CLI
# usam `web`; o app Electron (desktop) usa `desktop`. Sem a variável, cai no `web`
# histórico para não quebrar quem roda `dsh web`.
PROFILE_DIR="${DSH_PROFILE_DIR:-${HOME}/.dsh/profiles/web}"

FORCE=0
for arg in "$@"; do
  case "${arg}" in
    -f|--force) FORCE=1 ;;
    *) echo "Opção desconhecida: ${arg}" >&2; exit 2 ;;
  esac
done

echo "==> Configurando ecossistema completo de plugins do DSH em ${PROFILE_DIR}..."

# Instalar num perfil que o DSH não inicializa é o erro mais caro possível aqui:
# o script termina "com sucesso" e nenhum plugin aparece na interface.
if [ -n "${DSH_PROFILE_DIR:-}" ]; then
  target="$(cd "${PROFILE_DIR}" 2>/dev/null && pwd || printf '%s' "${PROFILE_DIR}")"
  active="$(cd "${DSH_PROFILE_DIR}" 2>/dev/null && pwd || printf '%s' "${DSH_PROFILE_DIR}")"
  if [ "${target}" != "${active}" ]; then
    echo "AVISO: o perfil ativo do DSH é '${active}', mas este script vai escrever em '${target}'." >&2
    echo "AVISO: os plugins NÃO vão aparecer até você rodar de novo com DSH_PROFILE_DIR apontando para o alvo." >&2
  fi
fi

mkdir -p "${PROFILE_DIR}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 1. Copiar plugins locais de UI. Eles entram como dependência `file:` no
# package.json do perfil (passo 3), porque o DSH resolve o `name` do patch por
# resolução Node — que só consulta node_modules, nunca <perfil>/plugins.
if [ -d "${REPO_ROOT}/plugins" ]; then
  mkdir -p "${PROFILE_DIR}/plugins"
  cp -r "${REPO_ROOT}/plugins/"* "${PROFILE_DIR}/plugins/"
fi

# 2. Configurar cordis.patch.yml (merge, nunca sobrescrever)
# Este arquivo costuma já existir com ajustes do usuário (modelo padrão, UI, etc.),
# então um `insert` só é acrescentado quando o id correspondente ainda não está lá.
PATCH_FILE="${PROFILE_DIR}/cordis.patch.yml"
if [ ! -f "${PATCH_FILE}" ]; then
  printf '%s\n' '# Your patch layer for this dsh profile, applied after every bundle layer:' > "${PATCH_FILE}"
fi

MISSING_INSERTS=""
for entry in "distill-ui:dsh-distill-ui" "credits-hero:dsh-credits-hero"; do
  id="${entry%%:*}"
  name="${entry#*:}"
  if ! grep -qE "^[[:space:]]*-[[:space:]]*id:[[:space:]]*${id}[[:space:]]*$" "${PATCH_FILE}"; then
    MISSING_INSERTS="${MISSING_INSERTS}    - id: ${id}
      name: '${name}'
"
  fi
done

if [ -z "${MISSING_INSERTS}" ]; then
  echo "cordis.patch.yml já registra dsh-distill-ui e dsh-credits-hero. Nada a fazer."
else
  printf -- '- insert:\n%b' "${MISSING_INSERTS}" >> "${PATCH_FILE}"
  echo "cordis.patch.yml atualizado com os inserts que faltavam."
fi

# 3. Manifesto do perfil.
# Fazer isso em node evita o BOM do PowerShell e mantém as plataformas idênticas.
command -v node >/dev/null 2>&1 || { echo "Erro: node é necessário (>=18)." >&2; exit 1; }

node - "${PROFILE_DIR}" "${FORCE}" <<'NODE'
const fs = require("fs");
const path = require("path");

const [, , profileDir, forceFlag] = process.argv;
const force = forceFlag === "1";

// A API de ícones das primitives mudou duas vezes: 0.19.x usa Icon*16/14, 0.21.x
// usa Icon*Regular, e só a linha 0.24.x declara peer
// @deepseek-ai/dsh-client-ui-primitives ^0.2.0-rc.1 — o range que satisfaz o DSH
// 0.2.0-rc.2. Com um pin incompatível o DSH desabilita a linha no boot
// (evaluatePluginCompatibility) e o visualizador de arquivos quebra com React #130.
const desiredDependencies = {
  "@dawsondx/dsh-web-open": "^0.1.2",
  "@khalilhsu/dsh-ui-query-navigator": "^0.1.1",
  "@linxin666/dsh-client-ui-skill-explorer": "^0.4.2",
  "dsh-agy": "^0.4.0",
  "dsh-better-sidebar": "^0.24.1",
  "dsh-git-graph": "github:1841220388zzzcccxxx-star/dsh-git-graph",
  "dsh-locale-pt-br": "github:tonnymoura/dsh-locale-pt-br",
  "dsh-plugin-subscriptions": "^0.9.6",
  "dsh-undo-savepoint": "^0.4.9",
  // Plugins locais entram como dependência `file:`: isso cria a entrada em
  // node_modules, que é o único caminho de resolução que o Loader do DSH consulta.
  "dsh-distill-ui": "file:plugins/dsh-distill-ui",
  "dsh-credits-hero": "file:plugins/dsh-credits-hero",
};

// Os dois plugins locais NÃO entram em `bundles`: eles já são registrados pelo
// insert do cordis.patch.yml do perfil (passo 2). Adicioná-los aqui faria o DSH
// carregar também o cordis.patch.yml interno deles, duplicando os ids.
const desiredBundles = [
  "@deepseek-ai/dsh-base",
  "@deepseek-ai/dsh-web-app",
  "dsh-agy",
  "dsh-locale-pt-br",
  "dsh-better-sidebar",
  "@linxin666/dsh-client-ui-skill-explorer",
  "@dawsondx/dsh-web-open",
  "dsh-undo-savepoint",
  "dsh-git-graph",
  "@khalilhsu/dsh-ui-query-navigator",
  "dsh-plugin-subscriptions",
];

const pkgPath = path.join(profileDir, "package.json");
let pkg = {};
if (fs.existsSync(pkgPath)) {
  const raw = fs.readFileSync(pkgPath, "utf8").replace(/^\uFEFF/, "");
  if (raw.trim() !== "") pkg = JSON.parse(raw);
}

if (!pkg.name) pkg.name = `dsh-profile-${path.basename(profileDir)}`;
pkg.private = true;
pkg.dependencies = pkg.dependencies ?? {};

const added = [];
const updated = [];
const conflicts = [];
for (const [name, range] of Object.entries(desiredDependencies)) {
  const current = pkg.dependencies[name];
  if (current === undefined) {
    pkg.dependencies[name] = range;
    added.push(`${name}@${range}`);
  } else if (current !== range) {
    if (force) {
      pkg.dependencies[name] = range;
      updated.push(`${name}: ${current} -> ${range}`);
    } else {
      conflicts.push(`${name}: mantido '${current}' (desejado '${range}')`);
    }
  }
}

pkg.dsh = pkg.dsh ?? {};
pkg.dsh.profile = pkg.dsh.profile ?? {};
const bundles = Array.isArray(pkg.dsh.profile.bundles) ? pkg.dsh.profile.bundles : [];
const addedBundles = [];
for (const bundle of desiredBundles) {
  if (!bundles.includes(bundle)) {
    bundles.push(bundle);
    addedBundles.push(bundle);
  }
}
pkg.dsh.profile.bundles = bundles;
pkg.dsh.profile.patchReload = "live";

// Sem BOM: o DSH lê o manifesto com JSON.parse sem remover BOM.
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log(`package.json do perfil atualizado: ${added.length} dependência(s) nova(s), ${updated.length} atualizada(s), ${addedBundles.length} bundle(s).`);
for (const item of added) console.log(`  + ${item}`);
for (const item of updated) console.log(`  ~ ${item}`);
if (conflicts.length > 0) {
  console.log("AVISO: pins existentes divergem do desejado (use --force para sobrescrever):");
  for (const item of conflicts) console.log(`  ! ${item}`);
}
NODE

# 4. Instalar dependências
cd "${PROFILE_DIR}"
if command -v pnpm >/dev/null 2>&1; then
  echo "Instalando com pnpm..."
  pnpm install
elif command -v npm >/dev/null 2>&1; then
  echo "AVISO: pnpm não encontrado; usando npm. O npm ignora pnpm-workspace.yaml (nodeLinker: hoisted, autoInstallPeers: false), então o layout de node_modules pode divergir do esperado." >&2
  # Plugins de terceiros declaram ranges de peer conflitantes entre si, e o
  # npm >= 7 aborta com ERESOLVE. O gate de compatibilidade do DSH revalida
  # os peers no boot de qualquer forma, entao aceitar o conflito e seguro.
  npm install || {
    echo "AVISO: npm install falhou (peers conflitantes); repetindo com --legacy-peer-deps." >&2
    npm install --legacy-peer-deps
  }
else
  echo "Erro: pnpm ou npm é necessário para instalar os plugins." >&2
  exit 1
fi

# 5. Patches pós-instalação — DEPOIS do install, porque os alvos só existem em
# node_modules a partir daí.
node - "${PROFILE_DIR}" <<'NODE'
const fs = require("fs");
const path = require("path");

const [, , profileDir] = process.argv;

// ---------------------------------------------------------------------------
// dsh-better-sidebar
//
// Verificado contra o 0.24.1 publicado: os needles de `fence seguro`,
// `browserInterceptLinks`, `browserInterceptHttp` e `browserAllowedLoopback`
// NÃO existem mais — essas opções foram removidas do plugin (a allowlist de
// loopback virou configuração na própria interface, em "Allowed local
// addresses"). Mantê-los aqui só gerava um aviso de no-op a cada execução.
//
// Cada needle é um literal específico de versão. Se o pin do plugin mudar, o
// needle pode desaparecer — por isso contamos o que casou de fato em vez de
// anunciar sucesso sobre um no-op silencioso.
// ---------------------------------------------------------------------------
const sidebarPatches = [
  { name: "autoOpenSubagent: false", from: "autoOpenSubagent: true,", to: "autoOpenSubagent: false," },
  { name: "autoOpenJobs: false", from: "autoOpenJobs: true,", to: "autoOpenJobs: false," },
  { name: "aba subagent desabilitada", from: "const isTabEnabled = (id) => store.getPrefs().tabsEnabled[id] !== false;", to: 'const isTabEnabled = (id) => id !== "subagent" && store.getPrefs().tabsEnabled[id] !== false;' },
];
const tasksPagePattern = /function activateTasksPage\(ctx, sessionId, options\) \{[\s\S]*?if \(park\) column\?\.toggleExpanded\?\.\(\);\s*\}/;
const tasksPageStub = "function activateTasksPage(ctx, sessionId, options) { return; }";

const sidebarFiles = [
  path.join(profileDir, "node_modules", "dsh-better-sidebar", "lib", "index.js"),
  path.join(profileDir, "node_modules", "dsh-better-sidebar", "lib", "client.js"),
  path.join(profileDir, "node_modules", "dsh-better-sidebar", "lib", "client-registry.js"),
];

const hits = new Map(sidebarPatches.map((patch) => [patch.name, 0]));
hits.set("activateTasksPage stub", 0);
let patchedFiles = 0;
let sidebarFound = false;

for (const file of sidebarFiles) {
  if (!fs.existsSync(file)) continue;
  sidebarFound = true;
  const original = fs.readFileSync(file, "utf8");
  let text = original;
  for (const patch of sidebarPatches) {
    if (text.includes(patch.from)) {
      text = text.split(patch.from).join(patch.to);
      hits.set(patch.name, hits.get(patch.name) + 1);
    } else if (text.includes(patch.to)) {
      // Ja aplicado numa execucao anterior: o needle original nao existe mais,
      // entao ausencia de `from` NAO significa que o patch falhou.
      hits.set(patch.name, hits.get(patch.name) + 1);
    }
  }
  if (tasksPagePattern.test(text)) {
    text = text.replace(tasksPagePattern, tasksPageStub);
    hits.set("activateTasksPage stub", hits.get("activateTasksPage stub") + 1);
  } else if (text.includes(tasksPageStub)) {
    hits.set("activateTasksPage stub", hits.get("activateTasksPage stub") + 1);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    patchedFiles += 1;
  }
}

if (!sidebarFound) {
  console.log("AVISO: dsh-better-sidebar não foi encontrado em node_modules; os patches de comportamento não foram aplicados.");
} else {
  console.log(`Patches do dsh-better-sidebar: ${patchedFiles} arquivo(s) alterado(s).`);
  const missed = [...hits.entries()].filter(([, count]) => count === 0).map(([name]) => name).sort();
  if (missed.length > 0) {
    console.log("AVISO: estes patches não casaram em nenhum arquivo (needle de outra versão do plugin):");
    for (const name of missed) console.log(`  ! ${name}`);
    console.log("AVISO: o dsh-better-sidebar vai rodar com o comportamento padrão nesses pontos.");
  }
}

// ---------------------------------------------------------------------------
// Overlays com YAML inválido publicado por plugins de terceiros
//
// Em YAML, `@` é indicador reservado: `name: @escopo/pacote` sem aspas não é um
// escalar válido. O DSH falha ao parsear o overlay e PULA O BUNDLE INTEIRO:
//   dsh: skipping profile bundle "@dawsondx/dsh-web-open": YAMLException ...
// @dawsondx/dsh-web-open@0.1.2 publica exatamente isso. Aspamos qualquer
// `name:` que comece com `@` — genérico, pega o próximo caso também.
// ---------------------------------------------------------------------------
function fixBrokenOverlays(root) {
  const candidates = [];
  const nm = path.join(root, "node_modules");
  if (!fs.existsSync(nm)) return 0;

  for (const entry of fs.readdirSync(nm, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("@")) {
      const scopeDir = path.join(nm, entry.name);
      for (const scoped of fs.readdirSync(scopeDir, { withFileTypes: true })) {
        if (!scoped.isDirectory()) continue;
        candidates.push(path.join(scopeDir, scoped.name, "cordis.patch.yml"));
      }
    } else {
      candidates.push(path.join(nm, entry.name, "cordis.patch.yml"));
    }
  }

  let fixed = 0;
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, "utf8");
    // Captura `name: @algo` sem aspas, preservando a indentação e o resto da linha.
    const after = before.replace(/^(\s*name:\s*)(@\S+)\s*$/gm, "$1'$2'");
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      console.log(`Overlay corrigido (YAML): ${path.relative(root, file)}`);
      fixed += 1;
    }
  }
  return fixed;
}

const overlaysFixed = fixBrokenOverlays(profileDir);
if (overlaysFixed === 0) {
  console.log("Nenhum overlay com YAML inválido encontrado.");
}
NODE

echo ""
echo "==> Todos os plugins foram instalados com sucesso!"
echo "    Reinicie o DeepSeek Harness para carregar as alterações."
