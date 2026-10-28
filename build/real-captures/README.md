# Capturas reales de consola

Estas diez imágenes (`01.png` … `10.png`) se tomaron de la ventana de comandos
del equipo del autor, no se generaron a partir de los logs.

## Cómo se obtuvieron

1. `capture-all.ps1` abre una consola `cmd` por ejercicio.
2. La consola ejecuta el script real con Git Bash y guarda su salida en
   `ejercicios/logs/`.
3. Al terminar, limpia la pantalla y muestra el resumen `[PASS]` /
   `RESULTADO: N PASS, 0 FAIL` del log.
4. `../capture-window.ps1` localiza la ventana por su título (`GITCAP01` … `GITCAP10`),
   la trae al frente y captura solo el marco visible.

Las capturas se recortaron únicamente para quitar el borde y la barra de
desplazamiento de la ventana. El texto y el resultado son los de la ejecución.

## Repetir las capturas

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\capture-all.ps1
```

Requiere Windows, Git para Windows y una sesión de escritorio activa (la captura
usa `CopyFromScreen`).
