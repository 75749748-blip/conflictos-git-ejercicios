# Copia el paquete de ejercicios al Escritorio: scripts, logs, capturas
# reales y la galería HTML. Solo toca la carpeta Conflictos-Git-Ejercicios.

$root    = 'C:\Users\gambo\Documents\Git-Conflictos'
$dest    = 'C:\Users\gambo\Desktop\Conflictos-Git-Ejercicios'
$seq     = Join-Path $root 'build\real-captures\seq'
$gallery = Join-Path $root 'build\galeria-ejercicios.html'

New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($sub in 'scripts', 'logs', 'capturas') {
  New-Item -ItemType Directory -Force -Path (Join-Path $dest $sub) | Out-Null
}

# Scripts y logs
Copy-Item "$root\ejercicios\*.sh" (Join-Path $dest 'scripts') -Force
Copy-Item "$root\ejercicios\logs\*.log" (Join-Path $dest 'logs') -Force

# Capturas: una carpeta por ejercicio con la secuencia completa
Get-ChildItem $seq -Directory | ForEach-Object {
  $target = Join-Path $dest (Join-Path 'capturas' $_.Name)
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Copy-Item (Join-Path $_.FullName '*.png') $target -Force
}

# Galería
Copy-Item $gallery (Join-Path $dest 'index.html') -Force

$leeme = @"
EJERCICIOS DE CONFLICTOS DE GIT - IVAN
======================================

Abre index.html en el navegador. Cada tarjeta muestra la secuencia completa
de capturas de la consola: el comando escrito, su salida y el resultado final.
Las imagenes se tomaron en este equipo (IVAN) mientras el script se ejecutaba.

Carpetas:
  capturas\NN\   secuencia real de cada ejercicio, en orden
  logs\          registro de texto de la misma ejecucion
  scripts\       scripts de bash que crean el conflicto y lo resuelven

Identidad usada en los commits:
  Ivan <75749748@iegb.edu.pe>

Repositorio:
  https://github.com/75749748-blip/conflictos-git-ejercicios
"@
[System.IO.File]::WriteAllText((Join-Path $dest 'LEEME.txt'), $leeme.Replace("`r`n", "`n").Replace("`n", "`r`n"), (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Paquete actualizado en $dest"
Get-ChildItem (Join-Path $dest 'capturas') -Directory | ForEach-Object {
  $count = (Get-ChildItem $_.FullName -Filter *.png).Count
  "  ejercicio $($_.Name): $count capturas"
}
