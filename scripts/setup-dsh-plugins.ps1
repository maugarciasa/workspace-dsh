<#
.SYNOPSIS
  Instala automaticamente os plugins dsh-agy e dsh-plugin-subscriptions no DeepSeek Harness (Windows).
#>

[CmdletBinding()]
param(
  [string]$ProfileDir = "$HOME\.dsh\profiles\web"
)

Write-Host "==> Configurando plugins dsh-agy e dsh-plugin-subscriptions no DSH..." -ForegroundColor Cyan

if (-not (Test-Path $ProfileDir)) {
  Write-Warning "Diretório do perfil web do DSH não encontrado em: $ProfileDir"
  Write-Host "Iniciando criação da estrutura do perfil..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

$pkgPath = Join-Path $ProfileDir "package.json"
if (-not (Test-Path $pkgPath)) {
  @{
    name = "dsh-profile-web"
    private = $true
    dependencies = @{
      "dsh-agy" = "^0.4.0"
      "dsh-plugin-subscriptions" = "^0.9.6"
    }
    dsh = @{
      profile = @{
        bundles = @(
          "@deepseek-ai/dsh-base",
          "@deepseek-ai/dsh-web-app",
          "dsh-agy",
          "dsh-plugin-subscriptions"
        )
      }
    }
  } | ConvertTo-Json -Depth 5 | Out-File -FilePath $pkgPath -Encoding utf8
} else {
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  if (-not $pkg.dependencies) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dependencies" -Value ([PSCustomObject]@{})
  }
  if (-not $pkg.dependencies."dsh-agy") {
    $pkg.dependencies | Add-Member -MemberType NoteProperty -Name "dsh-agy" -Value "^0.4.0"
  }
  if (-not $pkg.dependencies."dsh-plugin-subscriptions") {
    $pkg.dependencies | Add-Member -MemberType NoteProperty -Name "dsh-plugin-subscriptions" -Value "^0.9.6"
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

  $bundles = [System.Collections.Generic.List[string]]::new($pkg.dsh.profile.bundles)
  if (-not $bundles.Contains("dsh-agy")) { $bundles.Add("dsh-agy") }
  if (-not $bundles.Contains("dsh-plugin-subscriptions")) { $bundles.Add("dsh-plugin-subscriptions") }
  $pkg.dsh.profile.bundles = $bundles.ToArray()

  $pkg | ConvertTo-Json -Depth 5 | Out-File -FilePath $pkgPath -Encoding utf8
}

Write-Host "Manifesto package.json do perfil configurado com sucesso!" -ForegroundColor Green
Write-Host "Executando instalação das dependências via pnpm/npm..." -ForegroundColor Cyan

Push-Location $ProfileDir
try {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
  } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
  }
  Write-Host "Plugins instalados com sucesso!" -ForegroundColor Green
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "==> Tudo pronto! Reinicie o DeepSeek Harness para começar a usar o ChatGPT e o AGY." -ForegroundColor Cyan
