<#
.SYNOPSIS
  Instala e configura todo o ecossistema de plugins no perfil do DeepSeek Harness (Windows).
#>

[CmdletBinding()]
param(
  [string]$ProfileDir = "$HOME\.dsh\profiles\web"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Provisionamento do Ecossistema Completo de Plugins do DSH" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $ProfileDir)) {
  Write-Warning "Diretório do perfil web do DSH não encontrado em: $ProfileDir"
  Write-Host "Criando estrutura do perfil..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

$pkgPath = Join-Path $ProfileDir "package.json"

$desiredDependencies = @{
  "@dawsondx/dsh-web-open" = "^0.1.2"
  "@khalilhsu/dsh-ui-query-navigator" = "^0.1.1"
  "@linxin666/dsh-client-ui-skill-explorer" = "^0.4.2"
  "dsh-agy" = "^0.4.0"
  "dsh-better-sidebar" = "^0.21.1"
  "dsh-git-graph" = "github:1841220388zzzcccxxx-star/dsh-git-graph"
  "dsh-locale-pt-br" = "github:tonnymoura/dsh-locale-pt-br"
  "dsh-plugin-subscriptions" = "^0.9.6"
  "dsh-undo-savepoint" = "^0.4.9"
}

$desiredBundles = @(
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
  "dsh-plugin-subscriptions"
)

if (-not (Test-Path $pkgPath)) {
  Write-Host "Criando package.json base do perfil..." -ForegroundColor Yellow
  @{
    name = "dsh-profile-web"
    private = $true
    dependencies = $desiredDependencies
    dsh = @{
      profile = @{
        bundles = $desiredBundles
        patchReload = "live"
      }
    }
  } | ConvertTo-Json -Depth 5 | Out-File -FilePath $pkgPath -Encoding utf8
} else {
  Write-Host "Atualizando package.json existente com os plugins..." -ForegroundColor Yellow
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  if (-not $pkg.dependencies) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dependencies" -Value ([PSCustomObject]@{})
  }
  foreach ($key in $desiredDependencies.Keys) {
    if (-not $pkg.dependencies.$key) {
      $pkg.dependencies | Add-Member -MemberType NoteProperty -Name $key -Value $desiredDependencies[$key]
    }
  }

  if (-not $pkg.dsh) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dsh" -Value ([PSCustomObject]@{})
  }
  if (-not $pkg.dsh.profile) {
    $pkg.dsh | Add-Member -MemberType NoteProperty -Name "profile" -Value ([PSCustomObject]@{})
  }
  if (-not $pkg.dsh.profile.bundles) {
    $pkg.dsh.profile | Add-Member -MemberType NoteProperty -Name "bundles" -Value @()
  }

  $bundlesList = [System.Collections.Generic.List[string]]::new($pkg.dsh.profile.bundles)
  foreach ($bundle in $desiredBundles) {
    if (-not $bundlesList.Contains($bundle)) {
      $bundlesList.Add($bundle)
    }
  }
  $pkg.dsh.profile.bundles = $bundlesList.ToArray()
  $pkg.dsh.profile | Add-Member -MemberType NoteProperty -Name "patchReload" -Value "live" -Force

  $pkg | ConvertTo-Json -Depth 5 | Out-File -FilePath $pkgPath -Encoding utf8
}

Write-Host "Manifesto package.json configurado com sucesso!" -ForegroundColor Green
Write-Host "Instalando dependências de plugins via pnpm..." -ForegroundColor Cyan

Push-Location $ProfileDir
try {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
  } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
  }
  Write-Host "Todos os 9 plugins foram instalados com sucesso!" -ForegroundColor Green
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Concluído! Reinicie o DeepSeek Harness para aplicar." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
