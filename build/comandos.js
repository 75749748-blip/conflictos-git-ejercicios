// Diccionario de comandos del taller, en lenguaje llano.
// Cada entrada responde a lo mismo: qué es el comando, para qué sirve y por qué
// se usó en estos ejercicios. Se reutiliza en la guía simple, en la
// documentación técnica y en la presentación.

const grupos = [
  {
    titulo: 'Crear el repositorio y firmar los commits',
    nota: 'Antes de tocar nada hay que decirle a Git dónde guardar la historia y quién firma cada cambio.',
    items: [
      {
        c: 'git init -b main',
        q: 'Crea un repositorio nuevo en la carpeta actual y llama main a la rama principal.',
        p: 'Cada ejercicio empieza de cero en su propia carpeta, así el conflicto se reproduce igual siempre.'
      },
      {
        c: 'git config user.name "Ivan"',
        q: 'Guarda el nombre que Git escribirá como autor de cada commit.',
        p: 'Los commits de las capturas corresponden al autor del documento y no a un usuario de ejemplo.'
      },
      {
        c: 'git config user.email "75749748@iegb.edu.pe"',
        q: 'Guarda el correo que Git asocia a cada commit.',
        p: 'Es el correo de la cuenta de GitHub: así el commit y la cuenta quedan vinculados.'
      }
    ]
  },
  {
    titulo: 'Crear ramas y guardar cambios',
    nota: 'Una rama es una línea de trabajo aparte. Cambiar de rama no borra nada: cada una conserva su versión.',
    items: [
      {
        c: 'git switch -c feature',
        q: 'Crea la rama feature y se cambia a ella en un solo paso.',
        p: 'Así el cambio que provoca el conflicto se hace en una rama aparte y main queda intacta.'
      },
      {
        c: 'git switch main',
        q: 'Vuelve a la rama main, con los archivos tal como estaban allí.',
        p: 'Sirve para hacer el cambio opuesto en main y que las dos ramas choquen al unirlas.'
      },
      {
        c: 'git add app.txt',
        q: 'Marca el archivo para que entre en el próximo commit.',
        p: 'Git solo guarda lo que se marca: primero se elige, después se confirma.'
      },
      {
        c: 'git commit -m "base: crea app.txt"',
        q: 'Guarda una foto de los cambios marcados, con un mensaje que la describe.',
        p: 'Cada paso del ejercicio queda en la historia con un mensaje que dice qué hizo.'
      },
      {
        c: 'git commit -am "feature: cambia la linea 2"',
        q: 'Hace las dos cosas a la vez: marca los archivos ya conocidos y los confirma.',
        p: 'Es un atajo para no escribir add y commit por separado cuando el archivo ya existía.'
      }
    ]
  },
  {
    titulo: 'Ver qué está pasando',
    nota: 'Ante un conflicto, lo primero no es editar: es mirar. Estos comandos no cambian nada, solo informan.',
    items: [
      {
        c: 'git status',
        q: 'Muestra la rama actual, qué archivos cambiaron y si hay un merge a medias.',
        p: 'Describe el estado exacto en el que quedó el repositorio.'
      },
      {
        c: 'git status --short',
        q: 'La misma información condensada en una línea por archivo, con dos letras de estado.',
        p: 'Permite registrar el estado completo del conflicto en una sola captura.'
      },
      {
        c: 'git diff',
        q: 'Muestra línea por línea qué cambió respecto a la última versión guardada.',
        p: 'Permite ver las dos versiones enfrentadas antes de decidir cuál conservar.'
      },
      {
        c: 'git diff --check',
        q: 'Busca marcas de conflicto olvidadas y espacios raros al final de línea.',
        p: 'Es el control final: si queda un <<<<<<< sin borrar, este comando lo delata.'
      },
      {
        c: 'git log --oneline --graph --all --decorate',
        q: 'Dibuja la historia de todas las ramas en una línea por commit.',
        p: 'Sirve para comprobar que el merge o el rebase dejaron la historia como se esperaba.'
      },
      {
        c: 'git ls-files -u',
        q: 'Lista solo los archivos que están en conflicto, con sus tres versiones internas.',
        p: 'Es la forma rápida de saber cuántos archivos siguen sin resolver.'
      }
    ]
  },
  {
    titulo: 'Entender el conflicto por dentro',
    nota: 'Git guarda tres copias de cada archivo en conflicto. Verlas evita adivinar qué quería cada lado.',
    items: [
      {
        c: 'git show :1:app.txt',
        q: 'Muestra la versión base: el archivo tal como era antes de que las ramas se separaran.',
        p: 'Es el punto de partida común; sin él no se entiende qué cambió cada lado.'
      },
      {
        c: 'git show :2:app.txt',
        q: 'Muestra la versión local, la de la rama en la que se está trabajando.',
        p: 'En un merge es main; en un rebase es la rama base. Conviene saber cuál es cuál.'
      },
      {
        c: 'git show :3:app.txt',
        q: 'Muestra la versión del otro lado, la que llega con el merge.',
        p: 'Comparar :2: con :3: es la manera más limpia de decidir qué conservar.'
      },
      {
        c: 'git show HEAD:app.txt',
        q: 'Muestra cómo quedó el archivo en el último commit de la rama actual.',
        p: 'Confirma que la resolución se guardó de verdad, no solo en el editor.'
      },
      {
        c: 'git diff --base -- config.txt',
        q: 'Compara el archivo actual contra la versión base.',
        p: 'Señala qué aportó cada lado respecto al punto común, sin el ruido de las marcas.'
      },
      {
        c: 'git log --merge --oneline -- notas.txt',
        q: 'Lista solo los commits de las dos ramas que tocaron ese archivo.',
        p: 'Dice quién cambió qué y en qué orden, útil cuando el conflicto no es obvio.'
      }
    ]
  },
  {
    titulo: 'Resolver y cerrar',
    nota: 'Resolver es dejar el archivo como debe quedar. Cerrar es avisar a Git de que ya está y guardarlo.',
    items: [
      {
        c: 'git add app.txt',
        q: 'Marca el archivo como resuelto una vez editado.',
        p: 'Mientras no se marque, Git sigue considerando que el conflicto está abierto.'
      },
      {
        c: 'git rm notas.txt',
        q: 'Borra el archivo del disco y avisa a Git de que la decisión es eliminarlo.',
        p: 'Es la respuesta correcta cuando una rama editó el archivo y la otra lo eliminó.'
      },
      {
        c: 'git checkout --theirs -- logo.bin',
        q: 'Trae el archivo completo tal como está en la otra rama, sin mezclar.',
        p: 'Un binario no se puede mezclar por líneas: hay que elegir una versión entera.'
      },
      {
        c: 'cat app.txt',
        q: 'Imprime el contenido del archivo en la consola.',
        p: 'En las capturas muestra el contenido del archivo después de resolver.'
      }
    ]
  },
  {
    titulo: 'Terminar una operación que quedó a medias',
    nota: 'Rebase y cherry-pick se paran en el conflicto. No se cancelan: se continúan cuando ya está resuelto.',
    items: [
      {
        c: 'git rebase --continue',
        q: 'Retoma el rebase desde donde se detuvo, ya con el conflicto resuelto.',
        p: 'Un rebase no termina solo: hay que decirle que siga tras cada choque.'
      },
      {
        c: 'git cherry-pick --continue',
        q: 'Retoma la copia del commit que quedó a medias.',
        p: 'Cherry-pick también se pausa: el commit no se aplica hasta que se resuelve.'
      },
      {
        c: 'env GIT_EDITOR=true git rebase --continue',
        q: 'Continúa sin abrir el editor de texto para aceptar el mensaje por defecto.',
        p: 'Permite que el ejercicio avance solo, sin que nadie tenga que pulsar teclas.'
      },
      {
        c: 'git reset --hard HEAD~1',
        q: 'Deshace el último commit y descarta los cambios del árbol de trabajo.',
        p: 'Se usa en ramas desechables para probar una estrategia y volver atrás sin ensuciar.'
      }
    ]
  },
  {
    titulo: 'Las órdenes que provocan el conflicto',
    nota: 'Estas son las cuatro formas de juntar trabajo. Todas pueden chocar si dos lados tocan lo mismo.',
    items: [
      {
        c: 'git merge feature',
        q: 'Trae la rama feature a la rama actual y crea un commit que une las dos historias.',
        p: 'Es la operación base del taller: junta dos líneas de trabajo sin perder ninguna.'
      },
      {
        c: 'git rebase main',
        q: 'Reaplica los commits propios encima de main, uno por uno, como si se hubieran escrito después.',
        p: 'Deja una historia lineal, pero cambia los hashes y puede repetir el mismo conflicto varias veces.'
      },
      {
        c: 'git cherry-pick fbd46ff',
        q: 'Copia un commit concreto de otra rama y lo aplica aquí.',
        p: 'Sirve para trasladar un solo arreglo sin arrastrar toda la rama.'
      },
      {
        c: 'git stash push -m "wip: linea 2"',
        q: 'Guarda los cambios sin confirmar en una entrada aparte y deja el árbol limpio.',
        p: 'Permite cambiar de rama con trabajo a medias sin perderlo.'
      },
      {
        c: 'git stash pop',
        q: 'Recupera el último trabajo guardado y lo vuelve a aplicar sobre el árbol.',
        p: 'Al recuperarlo, si main cambió mientras tanto, aparece el conflicto.'
      },
      {
        c: 'git stash list',
        q: 'Muestra las entradas guardadas, con su número y su mensaje.',
        p: 'Confirma que el stash se creó y, al final, que el cajón quedó vacío.'
      },
      {
        c: 'git stash drop',
        q: 'Elimina la entrada guardada que ya no es necesaria.',
        p: 'Se usa cuando el cambio ya se aplicó y no se quiere conservar la copia.'
      }
    ]
  },
  {
    titulo: 'Atajos y automatización',
    nota: 'Git puede resolver solo los casos previsibles. Estos ajustes eligen qué versión gana y recuerdan la decisión.',
    items: [
      {
        c: 'git merge --no-edit -X ours feature',
        q: 'Hace el merge y, en cada choque, conserva la línea local sin preguntar.',
        p: 'Demuestra que el atajo funciona, pero también que puede perder cambios del otro lado.'
      },
      {
        c: 'git merge --no-edit -s ours feature',
        q: 'Une la historia pero ignora por completo el contenido de la otra rama.',
        p: 'Se compara con -X ours: aquí no se mezcla nada, el resultado es idéntico al de main.'
      },
      {
        c: 'git config merge.ours.driver true',
        q: 'Define un driver que, ante un conflicto, deja siempre la versión local.',
        p: 'Se aplica a archivos que no deben cambiar nunca, como los de configuración propia.'
      },
      {
        c: 'git check-attr -a -- logo.bin',
        q: 'Muestra qué atributos de Git afectan a ese archivo.',
        p: 'Comprueba que el archivo está declarado como binario antes de resolverlo.'
      },
      {
        c: 'git config rerere.enabled true',
        q: 'Activa el «recuerdo» de resoluciones: Git apunta cómo resolviste un choque.',
        p: 'Si el mismo conflicto reaparece, lo resuelve solo con la decisión anterior.'
      },
      {
        c: 'git config rerere.autoUpdate true',
        q: 'Hace que rerere deje el archivo ya resuelto y marcado.',
        p: 'Ahorra repetir a mano la misma resolución en cada intento del rebase.'
      },
      {
        c: 'git rerere status',
        q: 'Lista los archivos cuyo conflicto rerere está siguiendo.',
        p: 'Muestra que la función está activa y qué está memorizando.'
      },
      {
        c: 'git config merge.tool resolver',
        q: 'Le dice a Git qué programa abrir cuando pides ayuda para resolver.',
        p: 'Permite usar una herramienta propia en lugar de editar el archivo a mano.'
      },
      {
        c: 'git mergetool',
        q: 'Inicia la herramienta de merge configurada y guía por cada archivo en conflicto.',
        p: 'Es la alternativa visual a editar las marcas dentro del archivo.'
      },
      {
        c: 'git config mergetool.prompt false',
        q: 'Evita que Git pregunte si quieres abrir la herramienta en cada archivo.',
        p: 'Sin esto, la ejecución se quedaría esperando una tecla y no podría capturarse.'
      }
    ]
  },
  {
    titulo: 'Comandos de apoyo del taller',
    nota: 'No son de Git: son los que crean los archivos y muestran el resultado en la consola.',
    items: [
      {
        c: "printf 'linea 1\\nlinea 2\\n' > app.txt",
        q: 'Escribe ese texto en el archivo app.txt, reemplazando lo que hubiera.',
        p: 'Crea el contenido exacto que después provoca el conflicto, sin depender de un editor.'
      },
      {
        c: 'ls nueva.txt',
        q: 'Comprueba si el archivo existe en la carpeta.',
        p: 'Verifica si el merge trajo o no un archivo que solo existía en la otra rama.'
      },
      {
        c: 'rm -f resolver.sh config.txt.orig',
        q: 'Borra archivos temporales sin pedir confirmación.',
        p: 'Limpia la herramienta de prueba para que el ejercicio pueda repetirse igual.'
      },
      {
        c: 'git diff HEAD~1 HEAD --stat',
        q: 'Resume qué archivos cambió el último commit, sin mostrar el contenido.',
        p: 'Confirma de un vistazo que el merge tocó lo que debía tocar.'
      }
    ]
  }
];

module.exports = { grupos };
