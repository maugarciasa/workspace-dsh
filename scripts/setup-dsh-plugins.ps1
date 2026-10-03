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

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$localPluginsSource = Join-Path $repoRoot "plugins"

# 1. Copiar plugins de UI locais (dsh-credits-hero e dsh-distill-ui)
$targetLocalPlugins = Join-Path $ProfileDir "plugins"
if (Test-Path $localPluginsSource) {
  Write-Host "Instalando plugins locais de UI em: $targetLocalPlugins..." -ForegroundColor Green
  if (-not (Test-Path $targetLocalPlugins)) {
    New-Item -ItemType Directory -Path $targetLocalPlugins -Force | Out-Null
  }
  Copy-Item -Path "$localPluginsSource\*" -Destination $targetLocalPlugins -Recurse -Force
}

# 2. Configurar cordis.patch.yml do perfil
$patchPath = Join-Path $ProfileDir "cordis.patch.yml"
$patchContent = @"
# Your patch layer for this dsh profile, applied after every bundle layer:
- insert:
    - id: distill-ui
      name: 'dsh-distill-ui'
    - id: credits-hero
      name: 'dsh-credits-hero'
"@
if (-not (Test-Path $patchPath)) {
  Set-Content -Path $patchPath -Value $patchContent -Encoding utf8
  Write-Host "Criado cordis.patch.yml com dsh-distill-ui e dsh-credits-hero." -ForegroundColor Green
}

# 3. Configurar dependências e bundles no package.json
$pkgPath = Join-Path $ProfileDir "package.json"

$desiredDependencies = @{
  "@dawsondx/dsh-web-open" = "^0.1.2"
  "@khalilhsu/dsh-ui-query-navigator" = "^0.1.1"
  "@linxin666/dsh-client-ui-skill-explorer" = "^0.4.2"
  "dsh-agy" = "^0.4.0"
  # 0.21+ exige @deepseek-ai/dsh-client-ui-primitives ^0.1.7-rc.1 (icones renomeados de
  # Icon*16/14 para Icon*Regular). Em DSH < 0.1.7 esses icones vem undefined e o
  # visualizador de arquivos do sidebar quebra com React error #130.
  "dsh-better-sidebar" = "~0.19.1"
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
  # Patches pós-instalação para estabilidade e usabilidade
  # 1. dsh-better-sidebar: fence seguro, sem auto-abertura da aba Tasks, sem interceptar links de preview e com loopback liberado
  $sidebarFiles = @(
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\index.js"),
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\client.js"),
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\client-registry.js")
  )
  foreach ($sf in $sidebarFiles) {
    if (Test-Path $sf) {
      $txt = Get-Content $sf -Raw
      $txt = $txt.Replace('if (value === null || typeof value !== "object") return true;', 'if (value === null || typeof value !== "object") return false;')
      $txt = $txt.Replace('autoOpenSubagent: true,', 'autoOpenSubagent: false,')
      $txt = $txt.Replace('autoOpenJobs: true,', 'autoOpenJobs: false,')
      $txt = $txt.Replace('browserInterceptLinks: true,', 'browserInterceptLinks: false,')
      $txt = $txt.Replace('browserInterceptHttp: true,', 'browserInterceptHttp: false,')
      $txt = $txt.Replace('browserAllowedLoopback: "",', 'browserAllowedLoopback: "localhost,127.0.0.1",')
      $txt = $txt.Replace('const isTabEnabled = (id) => store.getPrefs().tabsEnabled[id] !== false;', 'const isTabEnabled = (id) => id !== "subagent" && store.getPrefs().tabsEnabled[id] !== false;')
      $txt = [regex]::Replace($txt, 'function activateTasksPage\(ctx, sessionId, options\) \{[\s\S]*?if \(park\) column\?\.toggleExpanded\?\.\(\);\s*\}', 'function activateTasksPage(ctx, sessionId, options) { return; }')
      Set-Content -Path $sf -Value $txt -Encoding utf8
    }
  }

  Write-Host "Todos os plugins foram instalados com sucesso!" -ForegroundColor Green
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Concluído! Reinicie o DeepSeek Harness para aplicar." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
