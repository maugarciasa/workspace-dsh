<#
.SYNOPSIS
  Menu interativo unificado do Workspace DSH (PowerShell / Windows).
#>

[CmdletBinding()]
param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir

function Show-Header {
  Clear-Host
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host "     Workspace DSH - Centro de Controle de IA (Mau)" -ForegroundColor Cyan
  Write-Host "==========================================================" -ForegroundColor Cyan
  Write-Host ""
}

do {
  Show-Header
  Write-Host " [1] Diagnóstico de Saúde do Ambiente (test-environment)" -ForegroundColor White
  Write-Host " [2] Provisionar os 11 Plugins do DSH (setup-dsh-plugins)" -ForegroundColor White
  Write-Host " [3] Sincronizar Junctions NTFS das Skills (sync-junctions)" -ForegroundColor White
  Write-Host " [4] Buscar Skill por Palavra-Chave no Catálogo (120+)" -ForegroundColor White
  Write-Host " [5] Validar Conformidade da Skill (validate-skill)" -ForegroundColor White
  Write-Host " [0] Sair" -ForegroundColor Yellow
  Write-Host ""
  $choice = Read-Host "Escolha uma opção (0-5)"

  switch ($choice) {
    "1" {
      Show-Header
      pwsh -File (Join-Path $scriptDir "test-environment.ps1")
      Write-Host ""
      Pause
    }
    "2" {
      Show-Header
      pwsh -File (Join-Path $scriptDir "setup-dsh-plugins.ps1")
      Write-Host ""
      Pause
    }
    "3" {
      Show-Header
      pwsh -File (Join-Path $scriptDir "sync-junctions.ps1")
      Write-Host ""
      Pause
    }
    "4" {
      Show-Header
      $term = Read-Host "Digite o termo de busca (ex: video, ui, test, seo, caveman)"
      if ($term) {
        $catalogPath = Join-Path $repoRoot "references\skills-catalog.md"
        if (Test-Path $catalogPath) {
          Write-Host ""
          Write-Host "Resultados encontrados no catálogo:" -ForegroundColor Green
          Get-Content $catalogPath | Select-String -Pattern $term -CaseSensitive:$false | ForEach-Object {
            Write-Host "  - $_" -ForegroundColor Gray
          }
        }
      }
      Write-Host ""
      Pause
    }
    "5" {
      Show-Header
      Push-Location $repoRoot
      try {
        node (Join-Path $scriptDir "validate-skill.mjs")
      } finally {
        Pop-Location
      }
      Write-Host ""
      Pause
    }
    "0" {
      Write-Host "Até logo!" -ForegroundColor Green
      break
    }
    default {
      Write-Host "Opção inválida. Tente novamente." -ForegroundColor Red
      Start-Sleep -Seconds 1
    }
  }
} while ($choice -ne "0")
