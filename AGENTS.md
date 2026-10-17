# Instrucciones para agentes

Estas reglas aplican a todo el repositorio. Las instrucciones del área más cercana complementan esta guía; no la sustituyen.

## Lectura obligatoria antes de editar

Antes de modificar archivos del proyecto:

Al inicio de cada sesión de trabajo con código, lee estos archivos del banco de memoria:

1. [`memory-bank/projectbrief.md`](./memory-bank/projectbrief.md) — negocio, objetivo y problema.
2. [`memory-bank/techContext.md`](./memory-bank/techContext.md) — stack, arquitectura y restricciones técnicas.
3. [`memory-bank/progress.md`](./memory-bank/progress.md) — estado actual y próximos pasos.

Usa además [`memory-bank/README.md`](./memory-bank/README.md) como índice. Después, antes de modificar archivos:

1. Consulta [`CONTEXT.md`](./CONTEXT.md) para aclaraciones de negocio y restricciones.
2. Consulta [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md) para el estado comprobado del código y los comandos disponibles.
3. Consulta el índice [`.agents/README.md`](./.agents/README.md) y las reglas aplicables de [`.agents/rules/`](./.agents/rules/README.md).
4. Lee y ejecuta la skill aplicable de [`.agents/skills/`](./.agents/skills/README.md), si la tarea coincide con una.
5. Lee el README del componente y cualquier `AGENTS.md` más cercano a los archivos que modificarás.

Para preguntas de solo lectura, consulta las fuentes pertinentes sin asumir que todas las tareas requieren leer todos los documentos.

## Flujo de trabajo y entrega

1. Inspecciona el estado del repositorio y los cambios existentes antes de editar. No reviertas ni sobrescribas cambios ajenos.
2. Identifica el comportamiento solicitado, el componente responsable y los criterios de aceptación. Si hay ambigüedad que cambie el alcance o afecte datos sensibles, aclárala antes de implementar.
3. Elige el cambio más pequeño que resuelva la necesidad. Respeta la estructura y las APIs existentes; no inventes datos, políticas clínicas, requisitos legales ni infraestructura.
4. Ejecuta las pruebas, lint, build o verificaciones más relevantes para los archivos modificados. No afirmes que se ejecutaron checks que no existen o que no se ejecutaron.
5. Revisa el diff completo: alcance, cambios accidentales, enlaces/documentación, privacidad y ausencia de secretos o datos sensibles.
6. Entrega un resumen del cambio, las validaciones ejecutadas y cualquier riesgo o tarea pendiente.

No crees commits salvo que el usuario lo solicite explícitamente. Si solicita un commit, completa antes todos los pasos anteriores, informa el resultado de las verificaciones y confirma que el diff contiene únicamente los cambios previstos antes de confirmar.

## Flujo obligatorio antes de cada commit

Antes de crear cualquier commit, sigue estos pasos en orden:

1. Ejecuta `git status` y revisa el diff para separar los cambios de esta tarea de cambios del usuario o de otras tareas. No los incluyas ni los reformatees.
2. Confirma que los archivos modificados pertenecen al alcance solicitado y que se respetan las rutas de producto y los archivos protegidos.
3. Ejecuta las pruebas, lint, build o verificaciones pertinentes; registra los comandos y resultados reales. Si una comprobación necesaria falla o no existe, detente e informa el bloqueo.
4. Inspecciona el diff staged completo en busca de cambios accidentales, secretos, datos sanitarios/laborales reales, enlaces rotos y documentación desactualizada.
5. Confirma con el desarrollador el alcance del commit cuando haya cambios ajenos o ambiguos; crea el commit solo si el usuario lo pidió explícitamente.

## Archivos y datos protegidos

No modifiques, muevas ni elimines los siguientes elementos sin confirmación explícita del desarrollador:

- [`CONTEXT.md`](./CONTEXT.md), [`CONTEXT.es.md`](./CONTEXT.es.md) y [`company-choice.md`](./company-choice.md): fuentes de negocio y decisiones seleccionadas.
- `data/raw/`, si existe, y cualquier archivo que contenga datos reales de pacientes, empleados, credenciales o exportaciones sanitarias.
- El bloque generado por Next.js en [`uis/talent-pipline-tracker/AGENTS.md`](./uis/talent-pipline-tracker/AGENTS.md).
- Cambios preexistentes del worktree que no pertenezcan a la tarea actual; no los stages ni los incluyas en commits.

## Reglas de seguridad y veracidad

- Trata los datos de salud, laborales y de credenciales como sensibles. Aplica minimización y las reglas de [`.agents/rules/healthcare-data.md`](./.agents/rules/healthcare-data.md).
- Usa datos sintéticos en ejemplos y pruebas. No pongas datos reales, secretos o credenciales en código, fixtures, logs, prompts ni documentación.
- `CONTEXT.md` y `company-choice.md` describen el caso del proyecto; no son asesoramiento legal ni autorización para procesar datos reales.
- Mantén las fuentes existentes y sus decisiones. Si hay contradicciones, señala el conflicto en lugar de inventar una resolución.
- Respeta instrucciones anidadas generadas por herramientas. En particular, no elimines ni reescribas el bloque generado del `AGENTS.md` de Next.js.
- Actualiza el banco de memoria cuando cambien decisiones, arquitectura, estado de features o problemas relevantes; deja el contexto activo listo para la siguiente sesión.
