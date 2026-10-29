# Capturas reales de consola

Las imágenes de `seq/01` … `seq/10` se tomaron de la ventana de comandos de este
equipo mientras los scripts se ejecutaban. No se generaron a partir de los logs
ni se reconstruyeron: son fotografías de la pantalla real.

Cada ejercicio tiene **varias capturas** porque la consola muestra unas 40
líneas: el script se detiene cada 36 filas, el runner fotografía la ventana y
luego el script continúa. Entre todas las imágenes de un ejercicio aparecen
**todos los comandos y todas las salidas**, no solo el resumen final.

## Qué muestra cada captura

- La barra de título con el nombre del ejercicio (`GITCAP05 - archivo binario`).
- Las primeras líneas del ejercicio incluyen un encabezado real del entorno:
  equipo (`IVAN`), usuario (`Ivan`), fecha, versión de Git e identidad
  (`Ivan <75749748@iegb.edu.pe>`).
- Cada comando precedido por `$` y, debajo, su salida real.
- La última captura de cada ejercicio termina en `RESULTADO: N PASS, 0 FAIL`.

## Cómo se obtuvieron

1. `capture-seq.ps1` abre `conhost` + `cmd` para cada ejercicio.
2. `ejercicios/lib.sh` imprime cada línea y, al llegar a 36 filas, crea un
   archivo `ready-NN-k.flag` y espera.
3. El runner detecta el aviso, llama a `../capture-window.ps1` y crea
   `go-NN-k.flag` para que el script continúe.
4. `../capture-window.ps1` busca la ventana por título, la trae al frente y
   captura solo el marco visible.
5. Al terminar, `finish()` hace una última pausa para fotografiar el
   `RESULTADO`.

Las capturas se recortan únicamente para quitar el borde y la barra de
desplazamiento de la ventana.

## Repetir las capturas

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\capture-seq.ps1
# o solo un ejercicio
powershell -NoProfile -ExecutionPolicy Bypass -File .\capture-seq.ps1 -Only 05
```

Requiere Windows, Git para Windows y una sesión de escritorio activa (la captura
usa `CopyFromScreen`).

## Archivos antiguos

`01.png` … `10.png` y `capture-all.ps1` son la versión anterior, que solo
fotografiaba el resumen final. Se conservan como referencia, pero la guía y la
galería usan `seq/`.
