<#
.SYNOPSIS
  Diagnóstico de saúde e integridade do ambiente de agentes de IA (Mau / Windows 11).
.DESCRIPTION
  Verifica o runtime do DeepSeek Harness (versão, perfil ativo e pin dos plugins),
  as ferramentas instaladas (RTK, gh CLI, git), o estado das Junctions NTFS,
  a sincronização de skills e as políticas de segurança do Git.
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

# DSH_PROFILE_DIR define o perfil realmente inicializado. Os scripts de setup
# caem em ~/.dsh/profiles/web quando a variável não existe - o que já causou
# provisionamento no perfil errado.
function Resolve-ProfileDir {
  if ($env:DSH_PROFILE_DIR) { return $env:DSH_PROFILE_DIR }
  return "$HOME\.dsh\profiles\web"
}

# Varre a lista de plugins do script de setup para saber o que foi fixado.
function Get-PinnedPluginRange([string]$PluginName) {
  $setupScript = Join-Path $PSScriptRoot "setup-dsh-plugins.ps1"
  if (-not (Test-Path $setupScript)) { return $null }
  $content = Get-Content $setupScript -Raw
  $pattern = '"' + [regex]::Escape($PluginName) + '"\s*=\s*"([^"]+)"'
  $match = [regex]::Match($content, $pattern)
  if ($match.Success) { return $match.Groups[1].Value }
  return $null
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

# 2. Checagem do runtime do DeepSeek Harness
Write-Host ""
Write-Host "--- 2. Runtime do DeepSeek Harness (DSH) ---" -ForegroundColor DarkCyan

$dshCli = Get-Command dsh -ErrorAction SilentlyContinue
if (-not $dshCli) {
  $dshCandidates = @(
    (Join-Path $env:LOCALAPPDATA "Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"),
    (Join-Path $env:ProgramFiles "DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd")
  )
  foreach ($candidate in $dshCandidates) {
    if ($candidate -and (Test-Path $candidate)) { $dshCli = Get-Item $candidate; break }
  }
}

$dshVersion = $null
if ($dshCli) {
  try { $dshVersion = ((& $dshCli.Source --version 2>&1) | Select-Object -First 1).ToString().Trim() } catch { $dshVersion = $null }
}
if ($dshVersion) {
  Write-Check "DSH CLI" $true "Versão $dshVersion (via $($dshCli.Source))"
} else {
  Write-Check "DSH CLI" $false "Não foi possível executar 'dsh --version'. O CLI do app desktop fica em %LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\cli\bin." $true
}

$profileDir = Resolve-ProfileDir
if (Test-Path $profileDir) {
  $source = if ($env:DSH_PROFILE_DIR) { "DSH_PROFILE_DIR" } else { "padrão (~/.dsh/profiles/web)" }
  Write-Check "Perfil alvo do setup" $true "$profileDir (origem: $source)"
} else {
  Write-Check "Perfil alvo do setup" $false "Perfil não existe ainda: $profileDir" $true
}

if ($dshVersion -and $profileDir) {
  $manifestPath = Join-Path $profileDir "package.json"
  if (Test-Path $manifestPath) {
    $raw = Get-Content $manifestPath -Raw
    $bom = [System.IO.File]::ReadAllBytes($manifestPath)[0..2] -join ','
    if ($bom -eq '239,187,191') {
      Write-Check "Manifesto do perfil" $false "package.json tem BOM UTF-8; o DSH faz JSON.parse sem remover BOM e o perfil não inicializa." 
    } else {
      Write-Check "Manifesto do perfil" $true "package.json sem BOM"
    }
    $dependencyCount = ([regex]::Matches($raw, '"[^"]+"\s*:\s*"')).Count
    Write-Check "Plugins declarados no perfil" ($raw -match '"dsh-') "Manifesto presente ($dependencyCount entradas de versão)"
  } else {
    Write-Check "Manifesto do perfil" $false "package.json não encontrado em $profileDir" $true
  }
}

# O pin do dsh-better-sidebar é o ponto que mais quebra entre versões do DSH:
# a linha 0.19.x/0.21.x declara peers que o runtime 0.2.x não satisfaz, e o DSH
# desabilita o plugin no boot.
$sidebarPin = Get-PinnedPluginRange "dsh-better-sidebar"
if ($sidebarPin) {
  if ($dshVersion -and $dshVersion -match '^(\d+)\.(\d+)\.') {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $needsNewLine = ($major -gt 0) -or ($minor -ge 2)
    $pinIsOldLine = $sidebarPin -match '0\.(19|20|21|22)\.'
    if ($needsNewLine -and $pinIsOldLine) {
      Write-Check "Pin do dsh-better-sidebar" $false "Pin '$sidebarPin' não satisfaz DSH $dshVersion. O DSH desabilita o plugin no boot (evaluatePluginCompatibility). Use ^0.24.1."
    } else {
      Write-Check "Pin do dsh-better-sidebar" $true "Pin '$sidebarPin' compatível com DSH $dshVersion"
    }
  } else {
    Write-Check "Pin do dsh-better-sidebar" $true "Pin '$sidebarPin' (versão do DSH indisponível para comparar)" $true
  }
} else {
  Write-Check "Pin do dsh-better-sidebar" $false "Não foi possível ler o pin em scripts/setup-dsh-plugins.ps1" $true
}

# 3. Checagem do Git e do GitHub CLI
Write-Host ""
Write-Host "--- 3. Controle de Versão & Autenticação ---" -ForegroundColor DarkCyan

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
  $gitCandidates = @(
    (Join-Path $env:ProgramFiles "Git\cmd\git.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Git\cmd\git.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\Git\cmd\git.exe")
  )
  foreach ($candidate in $gitCandidates) {
    if ($candidate -and (Test-Path $candidate)) { $gitCmd = Get-Item $candidate; break }
  }
}
if ($gitCmd) {
  if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Check "Git" $true "Disponível no PATH ($($gitCmd.Source))"
  } else {
    Write-Check "Git" $false "Instalado em $($gitCmd.Source) mas FORA do PATH. O install.ps1 resolve isso, mas comandos 'git' manuais vão falhar." $true
  }
} else {
  Write-Check "Git" $false "Não encontrado. Instale o Git for Windows."
}

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

# 4. Checagem das Junctions Globais (C:dev)
Write-Host ""
Write-Host "--- 4. Junctions de Trabalho (C:\dev) ---" -ForegroundColor DarkCyan
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

# 5. Checagem da Sincronização de Skills
Write-Host ""
Write-Host "--- 5. Ecossistema de Skills (~/.agents vs ~/.claude vs ~/.dsh) ---" -ForegroundColor DarkCyan
$agentsDir = "$HOME\.agents\skills"
$claudeDir = "$HOME\.claude\skills"
$dshSkillsDir = "$HOME\.dsh\skills"

$agentsCount = (Get-ChildItem -Path $agentsDir -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
$claudeCount = (Get-ChildItem -Path $claudeDir -ErrorAction SilentlyContinue | Measure-Object).Count

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

$wsDsh = Join-Path $dshSkillsDir "workspace-dsh"
if (Test-Path $wsDsh) {
  $wsItem = Get-Item $wsDsh
  Write-Check "workspace-dsh no DSH" ($wsItem.LinkType -eq "Junction") "Junction ativa para $($wsItem.Target)"
} else {
  Write-Check "workspace-dsh no DSH" $false "Falta junction em ~/.dsh/skills/workspace-dsh" $true
}

# 6. Git Branch Safety (Workspace atual)
Write-Host ""
Write-Host "--- 6. Segurança do Repositório Atual ---" -ForegroundColor DarkCyan
$gitBranch = $null
if ($gitCmd) { try { $gitBranch = (& $gitCmd.Source branch --show-current 2>&1) } catch { $gitBranch = $null } }
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
