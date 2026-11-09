# Fabrique dist\cleanembed-<version>.zip, le même fichier pour Firefox (AMO) et Chrome (Chrome Web Store).
# tar.exe (fourni avec Windows) écrit les chemins avec des « / », ce que demandent les deux boutiques.
$ErrorActionPreference = 'Stop'
$racine = Split-Path $PSScriptRoot -Parent
$version = (Get-Content (Join-Path $racine 'manifest.json') -Raw | ConvertFrom-Json).version
$dist = Join-Path $racine 'dist'
$zip = Join-Path $dist "cleanembed-$version.zip"
New-Item -ItemType Directory -Force $dist | Out-Null
Remove-Item $zip -ErrorAction SilentlyContinue
Push-Location $racine
try {
    # Chemin complet : un autre tar (celui de Git par exemple) peut passer avant dans le PATH
    & "$env:SystemRoot\System32\tar.exe" -a -c -f $zip manifest.json LICENSE THIRD_PARTY_NOTICES.md _locales icons src
    if ($LASTEXITCODE) { throw "tar a échoué (code $LASTEXITCODE)" }
} finally { Pop-Location }
"{0} ({1:N0} Ko)" -f $zip, ((Get-Item $zip).Length / 1KB)
