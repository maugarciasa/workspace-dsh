<#
.SYNOPSIS
  Sincroniza todas as skills de ~/.agents/skills para ~/.claude/skills criando Junctions NTFS.
.DESCRIPTION
  O Claude Code lê exclusivamente ~/.claude/skills. Este script garante que qualquer
  skill adicionada em ~/.agents/skills ganhe um Junction correspondente em ~/.claude/skills,
  sem duplicar pastas físicas nem quebrar edições locais.
#>

[CmdletBinding()]
param(
  [string]$AgentsDir = "$HOME\.agents\skills",
  [string]$ClaudeDir = "$HOME\.claude\skills"
)

Write-Host "Iniciando auditoria de Junctions de Skills..." -ForegroundColor Cyan

# Não é um erro fatal: numa máquina nova as skills ainda não foram clonadas.
# `Write-Error` sob $ErrorActionPreference = "Stop" (herdado do instalador)
# abortaria o script inteiro por causa disso.
if (-not (Test-Path $AgentsDir)) {
  Write-Warning "Diretório de origem não encontrado: $AgentsDir - nada a sincronizar."
  return
}

if (-not (Test-Path $ClaudeDir)) {
  New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

$agentsSkills = @(Get-ChildItem -Path $AgentsDir -Directory -ErrorAction SilentlyContinue)

$created = 0
$existing = 0
$conflicts = 0

foreach ($skill in $agentsSkills) {
  $targetPath = Join-Path $ClaudeDir $skill.Name
  
  if (Test-Path $targetPath) {
    $item = Get-Item $targetPath
    if ($item.LinkType -eq "Junction") {
      $existing++
    } else {
      Write-Warning "AVISO: '$($skill.Name)' em ~/.claude/skills é uma pasta física independente, não uma Junction!"
      $conflicts++
    }
  } else {
    Write-Host "Criando Junction para: $($skill.Name)" -ForegroundColor Green
    New-Item -ItemType Junction -Path $targetPath -Target $skill.FullName | Out-Null
    $created++
  }
}

Write-Host ""
Write-Host "Resumo de Sincronização:" -ForegroundColor Cyan
Write-Host "  - Total de skills em ~/.agents/skills: $($agentsSkills.Count)"
Write-Host "  - Junctions já existentes: $existing"
Write-Host "  - Novas Junctions criadas: $created"
if ($conflicts -gt 0) {
  Write-Host "  - Pastas físicas em conflito (não junctions): $conflicts" -ForegroundColor Yellow
}
Write-Host "Concluído com sucesso!" -ForegroundColor Green
