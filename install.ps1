<#
.SYNOPSIS
  Instalador One-Liner do Workspace DSH para Windows.
  Uso: irm https://raw.githubusercontent.com/maugarciasa/workspace-dsh/main/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"

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
    git pull --ff-only
  } catch {
    Write-Warning "Falha no git pull automático. Mantendo versão existente."
  } finally {
    Pop-Location
  }
} else {
  Write-Host "[1/4] Clonando workspace-dsh em $targetDir..." -ForegroundColor Green
  New-Item -ItemType Directory -Path (Split-Path -Parent $targetDir) -Force -ErrorAction SilentlyContinue | Out-Null
  git clone $repoUrl $targetDir
}

# 2. Criar Junctions NTFS para Claude Code e DSH
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
& pwsh -File (Join-Path $targetDir "scripts\sync-junctions.ps1")

# 4. Perguntar sobre provisionamento dos plugins do DSH
Write-Host ""
Write-Host "[4/4] Ecossistema de Plugins do DeepSeek Harness (ChatGPT, AGY, etc.)" -ForegroundColor Cyan
$installPlugins = Read-Host "Deseja provisionar automaticamente os 11 plugins do DSH agora? (S/N) [Padrão: S]"
if ([string]::IsNullOrWhiteSpace($installPlugins) -or $installPlugins -match "^[sSyY]") {
  & pwsh -File (Join-Path $targetDir "scripts\setup-dsh-plugins.ps1")
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Instalação concluída com sucesso!                      " -ForegroundColor Green
Write-Host "  Abra o menu a qualquer momento executando:             " -ForegroundColor White
Write-Host "  pwsh -File $targetDir\scripts\menu.ps1               " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
