import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

console.log("==> Validando especificação Agent Skills (agentskills.io)...");

let hasErrors = false;

function error(msg) {
  console.error(" [FAIL] " + msg);
  hasErrors = true;
}

function pass(msg) {
  console.log(" [PASS] " + msg);
}

async function validate() {
  const root = process.cwd();
  const skillFile = path.join(root, "SKILL.md");

  // 1. Verificar existência do SKILL.md
  try {
    await fs.access(skillFile);
    pass("Arquivo SKILL.md encontrado na raiz.");
  } catch {
    error("Arquivo SKILL.md não encontrado na raiz do repositório.");
    process.exit(1);
  }

  const content = await fs.readFile(skillFile, "utf-8");

  // 2. Extrair frontmatter
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    error("SKILL.md não contém YAML frontmatter válido delimitado por '---'.");
    process.exit(1);
  }

  const frontmatter = match[1];
  const fmLength = Buffer.byteLength(frontmatter, "utf-8");

  // 3. Tamanho do frontmatter (limite de 1024 caracteres por especificação agentskills.io)
  if (fmLength > 1024) {
    error(`Frontmatter excede 1024 caracteres (atual: ${fmLength} bytes).`);
  } else {
    pass(`Tamanho do Frontmatter dentro do limite (${fmLength}/1024 bytes).`);
  }

  // 4. Validar campo 'name'
  const nameMatch = frontmatter.match(/^name:\s*([^\r\n]+)/m);
  if (!nameMatch) {
    error("Campo obrigatório 'name' ausente no frontmatter.");
  } else {
    const name = nameMatch[1].trim();
    if (!/^[a-z0-9-]+$/.test(name)) {
      error(`Campo 'name' inválido: '${name}'. Deve conter apenas letras minúsculas, números e hífens.`);
    } else if (name.length > 64) {
      error(`Campo 'name' muito longo (${name.length}/64 caracteres).`);
    } else {
      pass(`Campo 'name' válido: '${name}'.`);
    }
  }

  // 5. Validar campo 'description'
  const descMatch = frontmatter.match(/^description:\s*([^\r\n]+(?:\r?\n\s+[^\r\n]+)*)/m);
  if (!descMatch) {
    error("Campo obrigatório 'description' ausente no frontmatter.");
  } else {
    const desc = descMatch[1].replace(/\r?\n\s+/g, " ").trim();
    if (desc.length < 10) {
      error("Campo 'description' muito curto.");
    } else if (desc.length > 1024) {
      error(`Campo 'description' muito longo (${desc.length}/1024 caracteres).`);
    } else {
      pass(`Campo 'description' válido (${desc.length} caracteres).`);
    }
  }

  // 6. Validar links relativos em Markdown no SKILL.md
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const targetUrl = linkMatch[2];
    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("#")) {
      continue;
    }
    const cleanTarget = targetUrl.split("#")[0];
    if (!cleanTarget) continue;
    const targetPath = path.resolve(root, cleanTarget);
    try {
      await fs.access(targetPath);
      pass(`Link relativo válido: ${cleanTarget}`);
    } catch {
      error(`Link quebrado detectado no SKILL.md: ${cleanTarget}`);
    }
  }

  
  // 7. Validar suíte de benchmark / evals (se presente)
  const evalsFile = path.join(root, "evals", "evals.json");
  try {
    const rawEvals = await fs.readFile(evalsFile, "utf-8");
    const jsonEvals = JSON.parse(rawEvals);
    if (Array.isArray(jsonEvals.evals) && jsonEvals.evals.length > 0) {
      pass(`Suíte de benchmark / evals válida (${jsonEvals.evals.length} cenários de teste).`);
    } else {
      error("evals/evals.json não contém uma lista de evals válida.");
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      error("Erro ao ler/parsear evals/evals.json: " + err.message);
    }
  }

  if (hasErrors) {
    console.error("\nValidação falhou. Corrija os erros acima.");
    process.exit(1);
  } else {
    console.log("\nParabéns! Todos os testes de especificação passaram com sucesso.");
  }
}

validate().catch((err) => {
  console.error("Erro inesperado durante validação:", err);
  process.exit(1);
});
