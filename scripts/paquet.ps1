# Fabrique les zip à envoyer aux boutiques :
#   dist\cleanembed-<version>-firefox.zip  pour Firefox (AMO)
#   dist\cleanembed-<version>-chrome.zip   pour Chrome et Edge : même contenu, sans la clé
#                                          browser_specific_settings propre à Firefox (Chrome la signale comme inconnue)
# tar.exe (fourni avec Windows) écrit les chemins avec des « / », ce que demandent les boutiques.
$ErrorActionPreference = 'Stop'
$racine = Split-Path $PSScriptRoot -Parent
$fichiers = 'manifest.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md', '_locales', 'icons', 'src'
$manifest = Get-Content (Join-Path $racine 'manifest.json') -Raw | ConvertFrom-Json
$dist = Join-Path $racine 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$tar = "$env:SystemRoot\System32\tar.exe"  # chemin complet : le tar de Git peut passer avant dans le PATH

function Zipper($source, $zip) {
    Remove-Item $zip -ErrorAction SilentlyContinue
    Push-Location $source
    try {
        & $tar -a -c -f $zip @fichiers
        if ($LASTEXITCODE) { throw "tar a échoué (code $LASTEXITCODE)" }
    } finally { Pop-Location }
    "{0} ({1:N0} Ko)" -f $zip, ((Get-Item $zip).Length / 1KB)
}

Zipper $racine (Join-Path $dist "cleanembed-$($manifest.version)-firefox.zip")

$copie = Join-Path $dist 'chrome-tmp'
Remove-Item $copie -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $copie | Out-Null
try {
    foreach ($f in $fichiers) { Copy-Item (Join-Path $racine $f) $copie -Recurse }
    $manifest.PSObject.Properties.Remove('browser_specific_settings')
    $manifest | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $copie 'manifest.json') -Encoding utf8NoBOM
    Zipper $copie (Join-Path $dist "cleanembed-$($manifest.version)-chrome.zip")
} finally { Remove-Item $copie -Recurse -Force }
