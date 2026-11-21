[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Low')]
param()

$ErrorActionPreference = 'Stop'
$cherryWorkspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$cherryPackage = Get-Content -LiteralPath (Join-Path $cherryWorkspace 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($cherryPackage.version -ne '1.0.0') {
    throw 'This cleanup is only for the 1.0.0 Cherry Pie release.'
}

$cherryDistRoot = (Resolve-Path -LiteralPath (Join-Path $cherryWorkspace 'dist')).Path
$cherryKeeper = [IO.Path]::GetFullPath((Join-Path $cherryDistRoot '1.0.0 - Cherry Pie Version'))
if (-not $cherryDistRoot.StartsWith($cherryWorkspace + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Distribution folder is outside the workspace.'
}
if ((Get-Item -LiteralPath $cherryDistRoot).Attributes -band [IO.FileAttributes]::ReparsePoint) {
    throw 'Distribution folder cannot be a link.'
}
if (-not (Test-Path -LiteralPath (Join-Path $cherryKeeper 'Noir Dump Studio-1.0.0-Cherry-Pie-Version-setup.exe') -PathType Leaf)) {
    throw 'The Cherry Pie installer must exist before cleaning old distributions.'
}

# Only the obsolete artifacts inspected for this release may be removed.
$cherryOldNames = @(
    '1.0.1', '1.0.2', '1.0.3', '1.0.4', '1.0.5', '1.0.6', '1.0.7', '1.0.8',
    'win-unpacked', 'builder-debug.yml', 'latest.yml',
    'Noir Dump Studio-1.0.0-setup.exe', 'Noir Dump Studio-1.0.0-setup.exe.blockmap'
)
$cherryTargets = @()
foreach ($cherryOldName in $cherryOldNames) {
    $cherryTargetPath = [IO.Path]::GetFullPath((Join-Path $cherryDistRoot $cherryOldName))
    if (-not $cherryTargetPath.StartsWith($cherryDistRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or $cherryTargetPath -eq $cherryKeeper) {
        throw 'Refusing a path outside the old distributions.'
    }
    if (-not (Test-Path -LiteralPath $cherryTargetPath)) { continue }
    $cherryTarget = Get-Item -LiteralPath $cherryTargetPath -Force
    if ($cherryTarget.Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw "Refusing to remove a link: $cherryTargetPath"
    }
    if ($cherryTarget.PSIsContainer) {
        $cherryLinks = @(Get-ChildItem -LiteralPath $cherryTargetPath -Recurse -Force |
            Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint })
        if ($cherryLinks.Count -gt 0) { throw "Nested link found: $cherryTargetPath" }
    }
    $cherryTargets += $cherryTarget
}

$cherryRunning = @(Get-CimInstance Win32_Process | Where-Object {
    $_.ExecutablePath -and $_.ExecutablePath.StartsWith($cherryDistRoot + '\', [StringComparison]::OrdinalIgnoreCase) -and
    -not $_.ExecutablePath.StartsWith($cherryKeeper + '\', [StringComparison]::OrdinalIgnoreCase)
})
if ($cherryRunning.Count -gt 0) { throw 'Close old app builds before running cleanup.' }

foreach ($cherryTarget in $cherryTargets) {
    if ($PSCmdlet.ShouldProcess($cherryTarget.FullName, 'Remove obsolete distribution')) {
        Remove-Item -LiteralPath $cherryTarget.FullName -Recurse -Force
    }
}
Get-ChildItem -LiteralPath $cherryDistRoot | Select-Object Name
