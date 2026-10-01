<#
.SYNOPSIS
  Diagnóstico de saúde e integridade do ambiente de agentes de IA (Mau / Windows 11).
.DESCRIPTION
  Verifica ferramentas instaladas (RTK, gh CLI, DSH), estado das Junctions NTFS,
  sincronização de skills e políticas de segurança do Git.
#>

[CmdletBinding()]
param()

$passes = 0
$warnings = 0
$errors = 0

function Write-Check([string]$name, [bool]$ok, [string]$detail, [bool]$isWarning = $false) {
  if ($ok) {
    $script:passes++
    Write-Host " [PASS] " -ForegroundColor Green -NoNewline
    Write-Host "$name - $detail"
  } elseif ($isWarning) {
    $script:warnings++
    Write-Host " [WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host "$name - $detail"
  } else {
    $script:errors++
    Write-Host " [FAIL] " -ForegroundColor Red -NoNewline
    Write-Host "$name - $detail"
  }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Diagnóstico do Ambiente de Agentes & Skills (Workspace DSH)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Checagem do RTK (Rust Token Killer)
Write-Host "--- 1. Ferramental de Otimização de Tokens ---" -ForegroundColor DarkCyan
$rtkCmd = Get-Command rtk -ErrorAction SilentlyContinue
if ($rtkCmd) {
  $rtkVer = (& rtk --version 2>&1)
  Write-Check "RTK CLI" $true "Instalado ($rtkVer)"
} else {
  Write-Check "RTK CLI" $false "Não encontrado no PATH (instale via scoop: scoop install rtk)" $true
}

$rtkDbPath = if ($env:RTK_DB_PATH) { $env:RTK_DB_PATH } else { "$HOME\.rtk\history.db" }
if (Test-Path $rtkDbPath) {
  Write-Check "RTK History DB" $true "Localizado em $rtkDbPath"
} else {
  Write-Check "RTK History DB" $false "Arquivo não encontrado em $rtkDbPath" $true
}

# 2. Checagem do GitHub CLI
Write-Host ""
Write-Host "--- 2. Controle de Versão & Autenticação ---" -ForegroundColor DarkCyan
$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCmd) {
  $ghStatus = (& gh auth status 2>&1) -join " "
  if ($ghStatus -match "Logged in to github.com") {
    Write-Check "GitHub CLI (gh)" $true "Autenticado com sucesso"
  } else {
    Write-Check "GitHub CLI (gh)" $false "Não autenticado (rode: gh auth login)"
  }
} else {
  Write-Check "GitHub CLI (gh)" $false "Binário gh não encontrado no PATH"
}

# 3. Checagem das Junctions Globais (C:dev)
Write-Host ""
Write-Host "--- 3. Junctions de Trabalho (C:\dev) ---" -ForegroundColor DarkCyan
$devClaude = "C:\dev\claude-config"
if (Test-Path $devClaude) {
  $item = Get-Item $devClaude
  $isJunction = ($item.LinkType -eq "Junction")
  Write-Check "Junction C:\dev\claude-config" $isJunction "Aponta para $($item.Target)"
} else {
  Write-Check "Junction C:\dev\claude-config" $false "Caminho não encontrado em $devClaude" $true
}

$devSkills = "C:\dev\agents-skills"
if (Test-Path $devSkills) {
  $item = Get-Item $devSkills
  $isJunction = ($item.LinkType -eq "Junction")
  Write-Check "Junction C:\dev\agents-skills" $isJunction "Aponta para $($item.Target)"
} else {
  Write-Check "Junction C:\dev\agents-skills" $false "Caminho não encontrado em $devSkills" $true
}

# 4. Checagem da Sincronização de Skills
Write-Host ""
Write-Host "--- 4. Ecossistema de Skills (~/.agents vs ~/.claude vs ~/.dsh) ---" -ForegroundColor DarkCyan
$agentsDir = "$HOME\.agents\skills"
$claudeDir = "$HOME\.claude\skills"
$dshDir = "$HOME\.dsh\skills"

$agentsCount = (Get-ChildItem -Path $agentsDir -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
$claudeCount = (Get-ChildItem -Path $claudeDir -ErrorAction SilentlyContinue | Measure-Object).Count
$dshCount = (Get-ChildItem -Path $dshDir -ErrorAction SilentlyContinue | Measure-Object).Count

Write-Check "Skills em ~/.agents/skills" ($agentsCount -gt 0) "Total: $agentsCount instaladas"
Write-Check "Skills em ~/.claude/skills" ($claudeCount -gt 0) "Total: $claudeCount visíveis para o Claude Code"

# Checar se workspace-dsh está linkada corretamente
$wsClaude = Join-Path $claudeDir "workspace-dsh"
if (Test-Path $wsClaude) {
  $wsItem = Get-Item $wsClaude
  Write-Check "workspace-dsh no Claude Code" ($wsItem.LinkType -eq "Junction") "Junction ativa para $($wsItem.Target)"
} else {
  Write-Check "workspace-dsh no Claude Code" $false "Falta junction em ~/.claude/skills/workspace-dsh"
}

$wsDsh = Join-Path $dshDir "workspace-dsh"
if (Test-Path $wsDsh) {
  $wsItem = Get-Item $wsDsh
  Write-Check "workspace-dsh no DSH" ($wsItem.LinkType -eq "Junction") "Junction ativa para $($wsItem.Target)"
} else {
  Write-Check "workspace-dsh no DSH" $false "Falta junction em ~/.dsh/skills/workspace-dsh" $true
}

# 5. Git Branch Safety (Workspace atual)
Write-Host ""
Write-Host "--- 5. Segurança do Repositório Atual ---" -ForegroundColor DarkCyan
$gitBranch = (& git branch --show-current 2>&1)
if ($gitBranch) {
  if ($gitBranch -eq "main" -or $gitBranch -eq "master") {
    Write-Check "Branch Git Atual" $false "Você está na branch '$gitBranch'! Lembre-se: mudanças devem ser feitas em branch temática." $true
  } else {
    Write-Check "Branch Git Atual" $true "Branch de trabalho segura: '$gitBranch'"
  }
} else {
  Write-Check "Branch Git Atual" $true "Diretório não é repositório Git ou Git indisponível"
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Resumo: $passes Aprovados | $warnings Avisos | $errors Falhas" -ForegroundColor $(if ($errors -gt 0) { "Red" } elseif ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "==========================================================" -ForegroundColor Cyan
