param(
  [string]$Only = ''
)

$root = 'C:\Users\gambo\Documents\Git-Conflictos'
$capDir = Join-Path $root 'build\real-captures'
$capture = Join-Path $root 'build\capture-window.ps1'

$items = @(
  @{ n = '01'; slug = '01-conflicto-simple';     name = 'CONFLICTO SIMPLE EN UNA LINEA' },
  @{ n = '02'; slug = '02-varios-hunks';         name = 'VARIOS HUNKS EN UN MISMO ARCHIVO' },
  @{ n = '03'; slug = '03-modificar-eliminar';   name = 'CONFLICTO MODIFICAR / ELIMINAR' },
  @{ n = '04'; slug = '04-add-add';              name = 'CONFLICTO ADD / ADD' },
  @{ n = '05'; slug = '05-binario';              name = 'CONFLICTO CON ARCHIVO BINARIO' },
  @{ n = '06'; slug = '06-rebase';               name = 'REBASE CON CONFLICTOS' },
  @{ n = '07'; slug = '07-cherry-pick';          name = 'CHERRY-PICK CON CONFLICTOS' },
  @{ n = '08'; slug = '08-stash';                name = 'STASH CON CONFLICTOS' },
  @{ n = '09'; slug = '09-inspeccion-mergetool'; name = 'INSPECCION Y MERGETOOL' },
  @{ n = '10'; slug = '10-estrategias';          name = 'ESTRATEGIAS DE RESOLUCION' }
)

foreach ($it in $items) {
  if ($Only -and $it.n -ne $Only) { continue }
  $n = $it.n
  $slug = $it.slug
  $title = "GITCAP$n"
  $done = Join-Path $capDir "done-$n.txt"
  $batPath = Join-Path $capDir "run-$n.cmd"
  Remove-Item $done -Force -ErrorAction SilentlyContinue

  $bat = @"
@echo off
title $title
mode con: cols=95 lines=40
cd /d $root
cls
"C:\Program Files\Git\bin\bash.exe" -c "bash ejercicios/$slug.sh 2>&1 | tee ejercicios/logs/$slug.log"
echo %ERRORLEVEL% > "$done"
timeout /t 600 /nobreak >nul
"@
  [System.IO.File]::WriteAllText($batPath, $bat.Replace("`r`n", "`n").Replace("`n", "`r`n"), (New-Object System.Text.UTF8Encoding($false)))

  Write-Host "--- Ejercicio $n : $slug"
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "`"$batPath`"" -WorkingDirectory $root

  $deadline = (Get-Date).AddSeconds(120)
  while (-not (Test-Path $done) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 400 }
  if (-not (Test-Path $done)) { throw "Timeout en ejercicio $n" }
  Start-Sleep -Seconds 2

  & powershell -NoProfile -ExecutionPolicy Bypass -File $capture -Title $title -Out (Join-Path $capDir "$n.png") -X 40 -Y 40
  Get-Process cmd -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowTitle -like "*$title*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 400
}

Write-Host 'Capturas terminadas.'

