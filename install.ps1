<#
.SYNOPSIS
  Instalador One-Liner do Workspace DSH para Windows.
  Uso: irm https://raw.githubusercontent.com/maugarciasa/workspace-dsh/main/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"

# --- Resolução de dependências externas -------------------------------------
# `git` e `pwsh` não estão garantidos no PATH: o Git for Windows pode estar
# instalado sem entrar no PATH, e o PowerShell 7 (`pwsh`) pode simplesmente não
# existir (só o Windows PowerShell 5.1). Sem isso o instalador morre no primeiro
# passo com um CommandNotFoundException pouco óbvio.

function Resolve-GitCommand {
  $cmd = Get-Command git -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    (Join-Path $env:ProgramFiles "Git\cmd\git.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Git\cmd\git.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\Git\cmd\git.exe")
  )
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) { return $candidate }
  }
  return $null
}

function Resolve-PowerShellCommand {
  $pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
  if ($pwshCmd) { return $pwshCmd.Source }
  $psCmd = Get-Command powershell -ErrorAction SilentlyContinue
  if ($psCmd) { return $psCmd.Source }
  return $null
}

function Invoke-ScriptFile([string]$Shell, [string]$ScriptPath) {
  & $Shell -NoProfile -ExecutionPolicy Bypass -File $ScriptPath
}

$gitExe = Resolve-GitCommand
if (-not $gitExe) {
  throw "git não encontrado. Instale o Git for Windows (https://git-scm.com/download/win) e rode novamente."
}
# Garante que o git resolvido também sirva para chamadas internas dos scripts.
$gitDir = Split-Path -Parent $gitExe
if ($env:PATH -notlike "*$gitDir*") { $env:PATH = "$gitDir;$env:PATH" }

$shellExe = Resolve-PowerShellCommand
if (-not $shellExe) { throw "Nenhum PowerShell encontrado para executar os scripts auxiliares." }
if ((Split-Path $shellExe -Leaf) -ne "pwsh.exe") {
  Write-Host "Nota: PowerShell 7 (pwsh) não encontrado; usando $shellExe." -ForegroundColor Yellow
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Instalador One-Liner do Workspace DSH (Windows)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$targetDir = "$HOME\.agents\skills\workspace-dsh"
$claudeDir = "$HOME\.claude\skills\workspace-dsh"
$dshDir = "$HOME\.dsh\skills\workspace-dsh"
$repoUrl = "https://github.com/maugarciasa/workspace-dsh.git"

# 1. Clonar ou atualizar o repositório
if (Test-Path $targetDir) {
  Write-Host "[1/4] Repositório já presente em $targetDir. Atualizando via git pull..." -ForegroundColor Yellow
  Push-Location $targetDir
  try {
    & $gitExe pull --ff-only
  } catch {
    Write-Warning "Falha no git pull automático. Mantendo versão existente."
  } finally {
    Pop-Location
  }
} else {
  Write-Host "[1/4] Clonando workspace-dsh em $targetDir..." -ForegroundColor Green
  New-Item -ItemType Directory -Path (Split-Path -Parent $targetDir) -Force -ErrorAction SilentlyContinue | Out-Null
  & $gitExe clone $repoUrl $targetDir
}

# 2. Criar Junctions NTFS para Claude Code e DSH
# Remover a junction antes de recriar é seguro: verificado no Windows PowerShell
# 5.1, `Remove-Item -Recurse -Force` numa junction apaga apenas o link e preserva
# o conteúdo do diretório alvo.
Write-Host "[2/4] Configurando Junctions NTFS para Claude Code e DSH..." -ForegroundColor Green
New-Item -ItemType Directory -Path (Split-Path -Parent $claudeDir) -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path (Split-Path -Parent $dshDir) -Force -ErrorAction SilentlyContinue | Out-Null

if (Test-Path $claudeDir) {
  Remove-Item $claudeDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Junction -Path $claudeDir -Target $targetDir | Out-Null

if (Test-Path $dshDir) {
  Remove-Item $dshDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Junction -Path $dshDir -Target $targetDir | Out-Null

# 3. Sincronizar todas as outras skills existentes
Write-Host "[3/4] Sincronizando catálogo geral de skills..." -ForegroundColor Green
Invoke-ScriptFile $shellExe (Join-Path $targetDir "scripts\sync-junctions.ps1")

# 4. Perguntar sobre provisionamento dos plugins do DSH
Write-Host ""
Write-Host "[4/4] Ecossistema de Plugins do DeepSeek Harness (ChatGPT, AGY, etc.)" -ForegroundColor Cyan
# `irm | iex` não é interativo: Read-Host lançaria um erro terminante.
if (-not [Console]::IsInputRedirected) {
  $installPlugins = Read-Host "Deseja provisionar automaticamente os 11 plugins do DSH agora? (S/N) [Padrão: S]"
} else {
  Write-Host "Execução não interativa detectada; provisionando os plugins por padrão." -ForegroundColor Yellow
  $installPlugins = "S"
}
if ([string]::IsNullOrWhiteSpace($installPlugins) -or $installPlugins -match "^[sSyY]") {
  Invoke-ScriptFile $shellExe (Join-Path $targetDir "scripts\setup-dsh-plugins.ps1")
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Instalação concluída com sucesso!                      " -ForegroundColor Green
Write-Host "  Abra o menu a qualquer momento executando:             " -ForegroundColor White
Write-Host "  & '$shellExe' -File $targetDir\scripts\menu.ps1" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
