<#
.SYNOPSIS
  Instala e configura todo o ecossistema de plugins no perfil do DeepSeek Harness (Windows).
#>

[CmdletBinding()]
param(
  # O DSH exporta DSH_PROFILE_DIR apontando para o perfil ativo. Instalações via
  # CLI usam `web`; o app Electron (desktop) usa `desktop`. Sem a variável, cai no
  # `web` histórico para não quebrar quem roda `dsh web`.
  [string]$ProfileDir = $(if ($env:DSH_PROFILE_DIR) { $env:DSH_PROFILE_DIR } else { "$HOME\.dsh\profiles\web" }),
  # Sobrescreve pins existentes no package.json do perfil que divergirem dos
  # valores gerenciados aqui. Sem isso, quem ja rodou uma versao antiga do
  # script continua com o pin antigo e o DSH desabilita o plugin.
  [switch]$Force
)

# O PowerShell 5.1 grava BOM com `Out-File/-Encoding utf8`, e o DSH lê o manifesto
# do perfil com JSON.parse sem remover BOM (dsh-app-boot: readProfileManifest).
# Escrever sem BOM é obrigatório para o perfil continuar inicializando.
$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Write-TextNoBom([string]$Path, [string]$Text) {
  [System.IO.File]::WriteAllText($Path, $Text, $script:Utf8NoBom)
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Provisionamento do Ecossistema Completo de Plugins do DSH" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $ProfileDir)) {
  Write-Warning "Diretório do perfil do DSH não encontrado em: $ProfileDir"
  Write-Host "Criando estrutura do perfil..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

# Instalar num perfil que o DSH não inicializa é o erro mais caro possível aqui:
# o script termina "com sucesso" e nenhum plugin aparece na interface.
if ($env:DSH_PROFILE_DIR) {
  $targetFull = [System.IO.Path]::GetFullPath($ProfileDir).TrimEnd('\')
  $activeFull = [System.IO.Path]::GetFullPath($env:DSH_PROFILE_DIR).TrimEnd('\')
  if ($targetFull -ne $activeFull) {
    Write-Warning "O perfil ativo do DSH é '$activeFull', mas este script vai escrever em '$targetFull'."
    Write-Warning "Os plugins NÃO vão aparecer até você rodar de novo com -ProfileDir '$env:DSH_PROFILE_DIR'."
  }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$localPluginsSource = Join-Path $repoRoot "plugins"

# 1. Copiar plugins de UI locais (dsh-credits-hero e dsh-distill-ui)
# Eles são declarados como dependência `file:` no package.json do perfil (passo 3),
# porque o DSH resolve o `name` do patch por resolução Node - que só consulta
# `node_modules`, nunca `<perfil>\plugins`.
$targetLocalPlugins = Join-Path $ProfileDir "plugins"
if (Test-Path $localPluginsSource) {
  Write-Host "Instalando plugins locais de UI em: $targetLocalPlugins..." -ForegroundColor Green
  if (-not (Test-Path $targetLocalPlugins)) {
    New-Item -ItemType Directory -Path $targetLocalPlugins -Force | Out-Null
  }
  Copy-Item -Path "$localPluginsSource\*" -Destination $targetLocalPlugins -Recurse -Force
}

# 2. Configurar cordis.patch.yml do perfil (merge, nunca sobrescrever)
# Este arquivo costuma já existir com ajustes do usuário (modelo padrão, UI, etc.),
# então um `insert` só é acrescentado quando o id correspondente ainda não está lá.
$patchPath = Join-Path $ProfileDir "cordis.patch.yml"
$patchRaw = if (Test-Path $patchPath) { Get-Content $patchPath -Raw } else { "" }

$missingInserts = @()
if ($patchRaw -notmatch '(?m)^\s*-\s*id:\s*distill-ui\s*$') { $missingInserts += "    - id: distill-ui`n      name: 'dsh-distill-ui'" }
if ($patchRaw -notmatch '(?m)^\s*-\s*id:\s*credits-hero\s*$') { $missingInserts += "    - id: credits-hero`n      name: 'dsh-credits-hero'" }

if ($missingInserts.Count -eq 0) {
  Write-Host "cordis.patch.yml ja registra dsh-distill-ui e dsh-credits-hero. Nada a fazer." -ForegroundColor Green
} else {
  $insertBlock = "- insert:`n" + ($missingInserts -join "`n")
  if ([string]::IsNullOrWhiteSpace($patchRaw)) {
    $newPatch = "# Your patch layer for this dsh profile, applied after every bundle layer:`n" + $insertBlock + "`n"
  } else {
    $sep = if ($patchRaw.EndsWith("`n")) { "" } else { "`n" }
    $newPatch = $patchRaw + $sep + $insertBlock + "`n"
  }
  Write-TextNoBom $patchPath $newPatch
  Write-Host "cordis.patch.yml atualizado: $($missingInserts.Count) insert(s) adicionado(s)." -ForegroundColor Green
}

# 3. Configurar dependências e bundles no package.json
$pkgPath = Join-Path $ProfileDir "package.json"

$desiredDependencies = @{
  "@dawsondx/dsh-web-open" = "^0.1.2"
  "@khalilhsu/dsh-ui-query-navigator" = "^0.1.1"
  "@linxin666/dsh-client-ui-skill-explorer" = "^0.4.2"
  "dsh-agy" = "^0.4.0"
  # A API de icones das primitives mudou duas vezes: 0.19.x usa Icon*16/14, 0.21.x
  # usa Icon*Regular, e so a linha 0.24.x declara peer
  # @deepseek-ai/dsh-client-ui-primitives ^0.2.0-rc.1 - o range que satisfaz o
  # DSH 0.2.0-rc.2. Com um pin incompativel o DSH desabilita a linha no boot
  # (evaluatePluginCompatibility) e o visualizador de arquivos quebra com React #130.
  "dsh-better-sidebar" = "^0.24.1"
  "dsh-git-graph" = "github:1841220388zzzcccxxx-star/dsh-git-graph"
  "dsh-locale-pt-br" = "github:tonnymoura/dsh-locale-pt-br"
  "dsh-plugin-subscriptions" = "^0.9.6"
  "dsh-undo-savepoint" = "^0.4.9"
  # Plugins locais entram como dependencia `file:`: isso cria a entrada em
  # node_modules, que e o unico caminho de resolucao que o Loader do DSH consulta.
  # Copiar para <perfil>\plugins (passo 1) sozinho NAO resolve o `name` do patch.
  "dsh-distill-ui" = "file:plugins/dsh-distill-ui"
  "dsh-credits-hero" = "file:plugins/dsh-credits-hero"
}

# Os dois plugins locais NAO entram em `bundles`: eles ja sao registrados pelo
# insert do cordis.patch.yml do perfil (passo 2). Adiciona-los aqui faria o DSH
# carregar tambem o cordis.patch.yml interno deles, duplicando os ids.
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
  $profileName = Split-Path $ProfileDir -Leaf
  $newManifest = @{
    name = "dsh-profile-$profileName"
    private = $true
    dependencies = $desiredDependencies
    dsh = @{
      profile = @{
        bundles = $desiredBundles
        patchReload = "live"
      }
    }
  } | ConvertTo-Json -Depth 5
  Write-TextNoBom $pkgPath $newManifest
} else {
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  if (-not $pkg.dependencies) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dependencies" -Value ([PSCustomObject]@{})
  }
  $conflicts = @()
  foreach ($key in $desiredDependencies.Keys) {
    $current = $pkg.dependencies.$key
    if (-not $current) {
      $pkg.dependencies | Add-Member -MemberType NoteProperty -Name $key -Value $desiredDependencies[$key]
    } elseif ($current -ne $desiredDependencies[$key]) {
      if ($Force) {
        $pkg.dependencies.$key = $desiredDependencies[$key]
        Write-Host "  ~ ${key}: $current -> $($desiredDependencies[$key])" -ForegroundColor Yellow
      } else {
        $conflicts += "${key}: mantido '$current' (desejado '$($desiredDependencies[$key])')"
      }
    }
  }
  if ($conflicts.Count -gt 0) {
    Write-Warning "Pins existentes divergem do desejado (use -Force para sobrescrever):"
    $conflicts | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Yellow }
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

  # `[List[string]]::new($array)` falha no PowerShell 5.1 quando o array vem de
  # ConvertFrom-Json: ele e Object[], entao a sobrecarga IEnumerable[string] nao
  # liga. O erro e NAO terminante, e dsh.profile.bundles fica sem atualizar -
  # os plugins sao instalados mas nunca carregados. Concatenar arrays evita o
  # problema de overload por completo.
  $bundlesList = @($pkg.dsh.profile.bundles)
  foreach ($bundle in $desiredBundles) {
    if ($bundlesList -notcontains $bundle) {
      $bundlesList += $bundle
    }
  }
  $pkg.dsh.profile.bundles = $bundlesList
  $pkg.dsh.profile | Add-Member -MemberType NoteProperty -Name "patchReload" -Value "live" -Force

  Write-TextNoBom $pkgPath ($pkg | ConvertTo-Json -Depth 5)
}

Write-Host "Manifesto package.json configurado com sucesso!" -ForegroundColor Green
Write-Host "Instalando dependências de plugins..." -ForegroundColor Cyan

# Resolve o gerenciador de pacotes. O pnpm do runtime do DSH e preferido ao npm
# porque o perfil declara `pnpm-workspace.yaml` com nodeLinker: hoisted e
# autoInstallPeers: false - o npm ignora esse arquivo e produz outro layout.
function Resolve-PnpmInvocation {
  $cmd = Get-Command pnpm -ErrorAction SilentlyContinue
  if ($cmd) { return @{ File = $cmd.Source; Prefix = @() } }

  $runtimeRoots = @()
  if ($env:DSH_RUNTIME_DIR) { $runtimeRoots += $env:DSH_RUNTIME_DIR }
  $runtimeRoots += @(
    (Join-Path $env:LOCALAPPDATA "Programs\DeepSeek Harness\resources\runtime"),
    (Join-Path $env:ProgramFiles "DeepSeek Harness\resources\runtime")
  )
  foreach ($rt in $runtimeRoots) {
    $cjs = Join-Path $rt "pnpm\bin\pnpm.cjs"
    if (-not (Test-Path $cjs)) { continue }
    $node = Join-Path $rt "primary-runtime\dependencies\node\bin\node.exe"
    if (-not (Test-Path $node)) {
      $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
      $node = if ($nodeCmd) { $nodeCmd.Source } else { $null }
    }
    if ($node) { return @{ File = $node; Prefix = @($cjs) } }
  }
  return $null
}

# As dependências de GitHub (dsh-git-graph, dsh-locale-pt-br) são resolvidas pelo
# pnpm através do binário `git`, que pode estar instalado fora do PATH.
function Ensure-GitOnPath {
  if (Get-Command git -ErrorAction SilentlyContinue) { return $true }
  foreach ($candidate in @(
    (Join-Path $env:ProgramFiles "Git\cmd"),
    (Join-Path ${env:ProgramFiles(x86)} "Git\cmd"),
    (Join-Path $env:LOCALAPPDATA "Programs\Git\cmd")
  )) {
    if ($candidate -and (Test-Path (Join-Path $candidate "git.exe"))) {
      $env:PATH = "$candidate;$env:PATH"
      return $true
    }
  }
  return $false
}

if (-not (Ensure-GitOnPath)) {
  Write-Warning "git nao encontrado no PATH. As dependencias de GitHub (dsh-git-graph, dsh-locale-pt-br) podem falhar."
}

Push-Location $ProfileDir
try {
  $pnpmInvocation = Resolve-PnpmInvocation
  if ($pnpmInvocation) {
    Write-Host "Instalando com pnpm..." -ForegroundColor Cyan
    & $pnpmInvocation.File @($pnpmInvocation.Prefix + @("install"))
  } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Warning "pnpm nao encontrado; usando npm. O npm ignora pnpm-workspace.yaml (nodeLinker: hoisted, autoInstallPeers: false), entao o layout de node_modules pode divergir do esperado."
    npm install
  } else {
    throw "Nem pnpm nem npm foram encontrados. Instale um dos dois e rode novamente."
  }

  # Patches pos-instalacao do dsh-better-sidebar: fence seguro, sem auto-abertura
  # da aba Tasks, sem interceptar links de preview e com loopback liberado.
  # Cada needle e um literal especifico de versao. Se o pin do plugin mudar, o
  # needle pode desaparecer - por isso contamos o que casou de fato em vez de
  # anunciar sucesso sobre um no-op silencioso.
  $sidebarPatches = @(
    @{ Name = 'fence seguro';                  From = 'if (value === null || typeof value !== "object") return true;'; To = 'if (value === null || typeof value !== "object") return false;' },
    @{ Name = 'autoOpenSubagent: false';       From = 'autoOpenSubagent: true,';        To = 'autoOpenSubagent: false,' },
    @{ Name = 'autoOpenJobs: false';           From = 'autoOpenJobs: true,';            To = 'autoOpenJobs: false,' },
    @{ Name = 'browserInterceptLinks: false';  From = 'browserInterceptLinks: true,';   To = 'browserInterceptLinks: false,' },
    @{ Name = 'browserInterceptHttp: false';   From = 'browserInterceptHttp: true,';    To = 'browserInterceptHttp: false,' },
    @{ Name = 'browserAllowedLoopback';        From = 'browserAllowedLoopback: "",';    To = 'browserAllowedLoopback: "localhost,127.0.0.1",' },
    @{ Name = 'aba subagent desabilitada';     From = 'const isTabEnabled = (id) => store.getPrefs().tabsEnabled[id] !== false;'; To = 'const isTabEnabled = (id) => id !== "subagent" && store.getPrefs().tabsEnabled[id] !== false;' }
  )
  $tasksPagePattern = 'function activateTasksPage\(ctx, sessionId, options\) \{[\s\S]*?if \(park\) column\?\.toggleExpanded\?\.\(\);\s*\}'
  $tasksPageStub = 'function activateTasksPage(ctx, sessionId, options) { return; }'

  $sidebarFiles = @(
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\index.js"),
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\client.js"),
    (Join-Path $ProfileDir "node_modules\dsh-better-sidebar\lib\client-registry.js")
  )

  $hitCount = @{}
  foreach ($patch in $sidebarPatches) { $hitCount[$patch.Name] = 0 }
  $hitCount['activateTasksPage stub'] = 0
  $patchedFiles = 0
  $sidebarFound = $false

  foreach ($sf in $sidebarFiles) {
    if (-not (Test-Path $sf)) { continue }
    $sidebarFound = $true
    $original = Get-Content $sf -Raw
    $txt = $original
    foreach ($patch in $sidebarPatches) {
      if ($txt.Contains($patch.From)) {
        $txt = $txt.Replace($patch.From, $patch.To)
        $hitCount[$patch.Name]++
      }
    }
    if ([regex]::IsMatch($txt, $tasksPagePattern)) {
      $txt = [regex]::Replace($txt, $tasksPagePattern, $tasksPageStub)
      $hitCount['activateTasksPage stub']++
    }
    if ($txt -ne $original) {
      Write-TextNoBom $sf $txt
      $patchedFiles++
    }
  }

  if (-not $sidebarFound) {
    Write-Warning "dsh-better-sidebar nao foi encontrado em node_modules; os patches de comportamento nao foram aplicados."
  } else {
    Write-Host "Patches do dsh-better-sidebar: $patchedFiles arquivo(s) alterado(s)." -ForegroundColor Green
    $missed = $hitCount.Keys | Where-Object { $hitCount[$_] -eq 0 } | Sort-Object
    if ($missed) {
      Write-Warning ("Estes patches nao casaram em nenhum arquivo (needle de outra versao do plugin): " + ($missed -join '; '))
      Write-Warning "O dsh-better-sidebar vai rodar com o comportamento padrao nesses pontos."
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
