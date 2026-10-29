param(
  [string]$Only = ''
)

# Runs every exercise in a real console window (conhost) and takes a
# screenshot each time the script pauses, roughly every 30 console rows.
# The result is a sequence of images that covers every command and every
# output line, captured from this machine, instead of a single summary of
# the final result.

$root    = 'C:\Users\gambo\Documents\Git-Conflictos'
$capDir  = Join-Path $root 'build\real-captures'
$flagDir = Join-Path $capDir 'flags'
$seqDir  = Join-Path $capDir 'seq'
$capture = Join-Path $root 'build\capture-window.ps1'

$items = @(
  @{ n = '01'; slug = '01-conflicto-simple';     name = 'conflicto simple' },
  @{ n = '02'; slug = '02-varios-hunks';         name = 'varios hunks' },
  @{ n = '03'; slug = '03-modificar-eliminar';   name = 'modificar y eliminar' },
  @{ n = '04'; slug = '04-add-add';              name = 'add y add' },
  @{ n = '05'; slug = '05-binario';              name = 'archivo binario' },
  @{ n = '06'; slug = '06-rebase';               name = 'rebase' },
  @{ n = '07'; slug = '07-cherry-pick';          name = 'cherry-pick' },
  @{ n = '08'; slug = '08-stash';                name = 'stash' },
  @{ n = '09'; slug = '09-inspeccion-mergetool'; name = 'inspeccion y mergetool' },
  @{ n = '10'; slug = '10-estrategias';          name = 'estrategias' }
)

New-Item -ItemType Directory -Force -Path $flagDir | Out-Null
New-Item -ItemType Directory -Force -Path $seqDir  | Out-Null

Get-Process conhost -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -like '*GITCAP*' } |
  Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process cmd -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -like '*GITCAP*' } |
  Stop-Process -Force -ErrorAction SilentlyContinue

foreach ($it in $items) {
  if ($Only -and $it.n -ne $Only) { continue }

  $n       = $it.n
  $slug    = $it.slug
  $title   = "GITCAP$n"
  $winTitle = "GITCAP$n - $($it.name)"
  $batPath = Join-Path $capDir "run-$n.cmd"
  $done    = Join-Path $capDir "done-$n.txt"
  $close   = Join-Path $capDir "close-$n.flag"
  $logPath = "$root/ejercicios/logs/$slug.log"

  Remove-Item "$flagDir\*" -Force -ErrorAction SilentlyContinue
  Remove-Item $done, $close -Force -ErrorAction SilentlyContinue
  $outDir = Join-Path $seqDir $n
  Remove-Item $outDir -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null

  $bat = @"
@echo off
title $winTitle
mode con: cols=95 lines=40
cd /d $root
cls
set CAPTURE_MODE=1
set CAPTURE_DIR=$($flagDir -replace '\\','/')
set CAPTURE_TAG=$n
set CAPTURE_LIMIT=36
set LOG=$logPath
"C:\Program Files\Git\bin\bash.exe" -c "bash ejercicios/$slug.sh"
echo %ERRORLEVEL% > "$done"
for /L %%i in (1,1,900) do (
  if exist "$close" goto :end
  timeout /t 1 /nobreak >nul
)
:end
"@
  [System.IO.File]::WriteAllText($batPath, $bat.Replace("`r`n", "`n").Replace("`n", "`r`n"), (New-Object System.Text.UTF8Encoding($false)))

  Write-Host "--- Ejercicio $n : $slug"
  Start-Process conhost.exe -ArgumentList 'cmd.exe', '/c', "`"$batPath`"" -WorkingDirectory $root
  Start-Sleep -Seconds 2

  $shot = 0
  $deadline = (Get-Date).AddMinutes(15)
  while (-not (Test-Path $done) -and (Get-Date) -lt $deadline) {
    # First pause that has not been photographed yet.
    $ready = Get-ChildItem "$flagDir\ready-$n-*.flag" -ErrorAction SilentlyContinue |
             Sort-Object { [int]($_.BaseName -split '-')[-1] } |
             Where-Object {
               $num = ($_.BaseName -split '-')[-1]
               -not (Test-Path (Join-Path $flagDir "go-$n-$num.flag"))
             } |
             Select-Object -First 1
    if ($ready) {
      $num = ($ready.BaseName -split '-')[-1]
      Start-Sleep -Milliseconds 300
      $shot++
      $out = Join-Path $outDir ("{0:00}.png" -f $shot)
      $ok = $false
      for ($try = 1; $try -le 5 -and -not $ok; $try++) {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $capture -Title $title -Out $out -X 16 -Y 4 | Out-Host
        if (Test-Path $out) { $ok = $true } else { Start-Sleep -Milliseconds 500 }
      }
      if (-not $ok) { Write-Host "AVISO: no se pudo capturar $n/$num" }
      New-Item -ItemType File -Path (Join-Path $flagDir "go-$n-$num.flag") -Force | Out-Null
    }
    Start-Sleep -Milliseconds 120
  }

  # The last snap happens inside finish(); make sure it was photographed.
  Start-Sleep -Milliseconds 400
  $pending = Get-ChildItem "$flagDir\ready-$n-*.flag" -ErrorAction SilentlyContinue |
             Sort-Object { [int]($_.BaseName -split '-')[-1] } |
             Where-Object {
               $num = ($_.BaseName -split '-')[-1]
               -not (Test-Path (Join-Path $flagDir "go-$n-$num.flag"))
             } |
             Select-Object -Last 1
  if ($pending) {
    $num = ($pending.BaseName -split '-')[-1]
    $shot++
    $out = Join-Path $outDir ("{0:00}.png" -f $shot)
    & powershell -NoProfile -ExecutionPolicy Bypass -File $capture -Title $title -Out $out -X 16 -Y 4 | Out-Host
    New-Item -ItemType File -Path (Join-Path $flagDir "go-$n-$num.flag") -Force | Out-Null
    Start-Sleep -Milliseconds 400
  }

  if (Test-Path $done) { Write-Host "ejercicio $n : $shot capturas" }
  else { Write-Host "AVISO: ejercicio $n sin terminar" }

  New-Item -ItemType File -Path $close -Force | Out-Null
  Start-Sleep -Milliseconds 1200
  Get-Process conhost -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -like "*$title*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue
  Get-Process cmd -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -like "*$title*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 400
}

Write-Host 'Secuencia de capturas terminada.'
