# Republica branch gh-pages a partir da pasta do projeto
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Tmp = Join-Path $env:TEMP "diario-pages-build"
Remove-Item $Tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $Tmp -Force | Out-Null

@(
  'index.html', 'index-legado.html', 'diario.js', 'app-shell.js', 'sw.js',
  'manifest.webmanifest', '404.html', '.nojekyll', 'diario.css'
) | ForEach-Object {
  $p = Join-Path $Root $_
  if (Test-Path $p) { Copy-Item $p $Tmp }
}
Copy-Item (Join-Path $Root 'css') $Tmp -Recurse
Copy-Item (Join-Path $Root 'icons') $Tmp -Recurse

Push-Location $Tmp
git init -b gh-pages | Out-Null
git add -A
git commit -m "Atualiza site estatico (gh-pages)." | Out-Null
git remote add origin https://github.com/RivasCode-Ops/diario-financeiro.git 2>$null
git push -f origin gh-pages
Pop-Location
Write-Host "Branch gh-pages atualizada."
