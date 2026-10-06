// Verificação de consistência das versões de plugin, do perfil alvo e do
// desgaste dos plugins locais contra o DSH instalado.
//
// O modo de falha que motivou este script: o pino do `dsh-better-sidebar` ficou
// em `~0.19.1` enquanto o runtime do DSH avançou para 0.2.x. O plugin passou a ser
// recusado pelo gate de peers do DSH e desabilitado no boot — mas nenhum teste
// pegava isso, porque o CI só validava o frontmatter do SKILL.md.
//
// Tudo aqui é offline e determinístico: lê os scripts, os plugins e a doc do repo.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
const pass = (msg) => console.log(" [PASS] " + msg);
const fail = (msg) => {
  console.error(" [FAIL] " + msg);
  failures += 1;
};

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// O pino precisa ser idêntico entre as duas plataformas, senão Windows e
// Linux/macOS instalam versões diferentes do mesmo plugin.
function extractPin(source, name, separator) {
  const pattern = new RegExp(`"${name}"\\s*${separator}\\s*"([^"]+)"`);
  return source.match(pattern)?.[1];
}

const psSetup = read("scripts/setup-dsh-plugins.ps1");
const shSetup = read("scripts/setup-dsh-plugins.sh");
const readme = read("README.md");
const pluginsDoc = read("references/dsh-plugins.md");

const psPin = extractPin(psSetup, "dsh-better-sidebar", "=");
const shPin = extractPin(shSetup, "dsh-better-sidebar", ":");

if (!psPin) {
  fail("não encontrei o pino de dsh-better-sidebar em scripts/setup-dsh-plugins.ps1");
} else if (!shPin) {
  fail("não encontrei o pino de dsh-better-sidebar em scripts/setup-dsh-plugins.sh");
} else if (psPin !== shPin) {
  fail(`pino divergente entre plataformas: .ps1 usa '${psPin}' e .sh usa '${shPin}'`);
} else {
  pass(`pino de dsh-better-sidebar consistente entre plataformas ('${psPin}')`);
}

// A documentação tem que registrar a linha fixada, senão o próximo a mexer não
// tem como saber qual versão do DSH aquele pino pressupõe.
if (psPin) {
  const minorLine = psPin.replace(/^[\^~>=<\s]*/, "").split(".").slice(0, 2).join(".");
  for (const [label, content] of [
    ["README.md", readme],
    ["references/dsh-plugins.md", pluginsDoc],
  ]) {
    if (content.includes(minorLine)) {
      pass(`${label} documenta a linha ${minorLine}.x`);
    } else {
      fail(`${label} não menciona a linha ${minorLine}.x fixada nos scripts`);
    }
  }
}

// O perfil alvo nunca pode ser hardcoded: o app desktop usa `desktop` e o CLI
// usa `web`. Fixar um deles faz o provisionamento acertar o perfil errado em
// silêncio — o script termina com sucesso e nenhum plugin aparece.
for (const [label, content] of [
  ["scripts/setup-dsh-plugins.ps1", psSetup],
  ["scripts/setup-dsh-plugins.sh", shSetup],
]) {
  if (content.includes("DSH_PROFILE_DIR")) {
    pass(`${label} resolve o perfil por DSH_PROFILE_DIR`);
  } else {
    fail(`${label} não consulta DSH_PROFILE_DIR e vai escrever num perfil fixo`);
  }
}

// Estes campos existem no manifesto do DSH e são a única forma de um plugin
// local (que não está no registry) virar uma entrada resolvível do Loader.
for (const [label, content] of [
  ["scripts/setup-dsh-plugins.ps1", psSetup],
  ["scripts/setup-dsh-plugins.sh", shSetup],
]) {
  if (content.includes("file:plugins/dsh-distill-ui")) {
    pass(`${label} declara os plugins locais como dependência file:`);
  } else {
    fail(`${label} não declara os plugins locais como dependência file: (copiar para plugins/ não resolve)`);
  }
  if (/bundles[\s\S]{0,400}?"dsh-distill-ui"/.test(content)) {
    fail(`${label} colocou um plugin local em dsh.profile.bundles (duplica o id do cordis.patch.yml)`);
  }
}

// Os overlays de terceiros com YAML inválido fazem o DSH pular o bundle inteiro.
// O setup precisa conter o reparo, senão o plugin silenciosamente não carrega.
for (const [label, content] of [
  ["scripts/setup-dsh-plugins.ps1", psSetup],
  ["scripts/setup-dsh-plugins.sh", shSetup],
]) {
  if (content.includes("Overlay corrigido")) {
    pass(`${label} repara overlays com YAML inválido`);
  } else {
    fail(`${label} não repara overlays com YAML inválido (o DSH pula o bundle)`);
  }
  // Needles que não existem mais no 0.24.1 só geram aviso de no-op a cada execução.
  for (const dead of ["browserInterceptLinks", "browserInterceptHttp", "browserAllowedLoopback"]) {
    if (content.includes(`'${dead}`) || content.includes(`"${dead}`)) {
      fail(`${label} ainda referencia '${dead}', removido do dsh-better-sidebar 0.21+`);
    }
  }
}

// `pwsh` (PowerShell 7) não existe em toda máquina Windows; chamá-lo direto
// aborta o script com CommandNotFound.
for (const rel of ["install.ps1", "scripts/menu.ps1"]) {
  const content = read(rel);
  if (/^\s*(&|\.)?\s*pwsh\s+-File/m.test(content)) {
    fail(`${rel} invoca 'pwsh -File' sem fallback para Windows PowerShell 5.1`);
  } else {
    pass(`${rel} não depende de pwsh estar instalado`);
  }
}

// Sem BOM, o Windows PowerShell 5.1 lê .ps1 como Windows-1252. As aspas
// "inteligentes" (U+2018/2019/201C/201D) e os travessões (U+2013/2014) viram
// bytes que o 5.1 decodifica como aspas — e ele as aceita como delimitador de
// string. Um travessão dentro de uma string literal fecha a string no meio e o
// script deixa de compilar. Já aconteceu neste repositório.
const psFiles = [
  "install.ps1",
  "scripts/menu.ps1",
  "scripts/setup-dsh-plugins.ps1",
  "scripts/sync-junctions.ps1",
  "scripts/test-environment.ps1",
];
const UNSAFE_PUNCTUATION = /[\u2013\u2014\u2018\u2019\u201C\u201D]/;
const BOM = "\uFEFF";
for (const rel of psFiles) {
  const content = read(rel);
  if (!content.startsWith(BOM)) {
    fail(`${rel} está sem BOM UTF-8; o PowerShell 5.1 vai ler como Windows-1252 e mostrar acentos corrompidos`);
    continue;
  }
  const match = UNSAFE_PUNCTUATION.exec(content);
  if (match) {
    const line = content.slice(0, match.index).split("\n").length;
    fail(`${rel}:${line} usa pontuação não-ASCII (U+${match[0].codePointAt(0).toString(16).toUpperCase()}); use '-' ou '--'`);
  } else {
    pass(`${rel} tem BOM UTF-8 e não usa pontuação que quebra o PowerShell 5.1`);
  }
}

// ---------------------------------------------------------------------------
// Plugins locais
//
// Duas classes de desgaste que quebram em silêncio quando o DSH muda de versão:
//  - classes CSS-module hasheadas (`.o3BgMG_root`), cujo hash muda a cada build;
//  - tokens de design renomeados (`--dsw-alias-bg-hover` virou
//    `--dsw-alias-interactive-bg-hover`).
// A lista abaixo é o conjunto VERIFICADO de tokens que existem no DSH 0.2.0-rc.2.
// ---------------------------------------------------------------------------
const KNOWN_DSW_TOKENS = new Set([
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-overlay",
  "--dsw-alias-border-l1",
  "--dsw-alias-border-l2",
  "--dsw-alias-interactive-bg-active",
  "--dsw-alias-interactive-bg-hover",
  "--dsw-alias-label-caption",
  "--dsw-alias-label-primary",
  "--dsw-alias-label-secondary",
  "--dsw-alias-label-tertiary",
  "--dsw-alias-markdown-code-block",
  "--dsw-alias-state-business-primary",
]);

const localPlugins = ["plugins/dsh-distill-ui/lib/client.js", "plugins/dsh-credits-hero/lib/client.js"];
const HASHED_CLASS = /\.[A-Za-z]{5,9}_[A-Za-z][A-Za-z0-9]*/g;

for (const rel of localPlugins) {
  const content = read(rel);

  const hashed = [...new Set(content.match(HASHED_CLASS) ?? [])].sort();
  if (hashed.length > 0) {
    fail(`${rel} usa classe CSS-module hasheada (${hashed.slice(0, 3).join(", ")}); o hash muda a cada build do DSH`);
  } else {
    pass(`${rel} não depende de nomes de classe hasheados`);
  }

  const unknown = [...new Set(content.match(/--dsw-[a-z0-9-]+/g) ?? [])]
    .filter((token) => !KNOWN_DSW_TOKENS.has(token))
    .sort();
  if (unknown.length > 0) {
    fail(`${rel} usa token(ns) de design fora da lista verificada do DSH 0.2.0-rc.2: ${unknown.join(", ")}`);
  } else {
    pass(`${rel} usa apenas tokens --dsw-* verificados no DSH 0.2.0-rc.2`);
  }
}

if (failures > 0) {
  console.error(`\nVerificação de compatibilidade do DSH falhou (${failures} problema(s)).`);
  process.exit(1);
}
console.log("\nConsistência de versões, perfil e plugins locais: tudo certo.");
