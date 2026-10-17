---
name: frontend-preflight
description: Validar ubicación, stack, estilos y checks de entrega para cambios de interfaz antes de entregarlos o abrir un PR.
---

# Preflight de cambios frontend

Usa esta skill antes de entregar cambios de interfaz en el monorepo. Convierte las convenciones de ubicación y stack en comprobaciones repetibles; no sustituye la revisión funcional ni visual.

## Entradas

- Ruta de la app frontend: `uis/website/` o `uis/backoffice/`.
- Lista de todos los archivos frontend de aplicación modificados, relativa a la raíz del repo.
- README, `package.json`, scripts de la app y decisiones vigentes en `docs/WEB_DESIGN.md`/`docs/WEB_MVP.md`.

## Salida esperada

- Resultado aprobado/no aprobado con la app y los archivos comprobados.
- Salida del checker, autocontrol, `npm run lint`, `npm run build` y revisión del diff.
- Lista explícita de bloqueos o criterios que no se pudieron verificar. No declares aprobado un check omitido.

## Alcance y rutas

- Sitio público: `uis/website/`.
- Aplicación interna: `uis/backoffice/`.
- APIs y workers: `services/`; no los trates como frontend ni crees una carpeta paralela.
- Antes de modificar una de estas áreas, lee su README. Si aún no existe, crea y documenta el componente en la ruta asignada y añade su README como parte del cambio.
- Para frontend nuevo, usa Next.js y TypeScript. Usa Tailwind CSS con clases utilitarias; no uses atributos `style`, bloques `<style>` ni estilos inline.
- Consulta `docs/WEB_DESIGN.md` para decisiones visuales y `docs/WEB_MVP.md` para alcance funcional. No des por migrado el sitio estático actual a Next.js.

## Procedimiento

1. Lee `AGENTS.md`, `memory-bank/README.md`, el README del área objetivo y las instrucciones locales aplicables.
2. Confirma que los archivos de interfaz pertenecen a `uis/website/` o `uis/backoffice/`; confirma que código de API pertenece a `services/`.
3. Ejecuta el checker incluido sobre todos los archivos de aplicación frontend modificados:

   ```bash
   python3 .agents/skills/frontend-preflight/scripts/check_frontend.py \
     --root . \
     --app uis/backoffice \
     --files uis/backoffice/app/page.tsx
   ```

   Sustituye `--app` y `--files` por las rutas reales. El checker exige un `README.md`, `package.json` con scripts `lint` y `build` y la dependencia `tailwindcss`, archivos dentro de la app objetivo, TypeScript para archivos fuente, `className` en los componentes TSX y ausencia de estilos inline. Incluye en `--files` todos los archivos fuente de UI modificados.

4. Ejecuta el autocontrol del checker:

   ```bash
   python3 .agents/skills/frontend-preflight/scripts/check_frontend.py --self-test
   ```

5. Desde la carpeta de la app, ejecuta `npm run lint` y `npm run build`. No marques el preflight como aprobado si un comando falla o no está definido.
6. Revisa el diff: confirma que las clases Tailwind siguen la dirección de `docs/WEB_DESIGN.md`, que la interfaz cumple `docs/WEB_MVP.md` y que no se creó una app fuera de las rutas asignadas.

## Criterios de aceptación

El preflight se aprueba únicamente si se pueden aportar todas estas evidencias:

- El checker termina con código `0` para todos los archivos frontend modificados y reporta la app correcta.
- `--self-test` termina con código `0` y demuestra que rechaza una ruta incorrecta, código frontend JavaScript, falta de Tailwind, ausencia de `className` y estilos inline.
- La app objetivo tiene README y `package.json` con scripts `lint`/`build` y la dependencia `tailwindcss`.
- `npm run lint` y `npm run build` terminan con código `0` desde la app objetivo.
- El checker confirma `className` en componentes TSX, y la revisión del diff confirma que los valores son clases utilitarias Tailwind coherentes con el diseño, sin atributos `style`, elementos `<style>` ni estilos inline. El frontend queda dentro de `uis/website/` o `uis/backoffice/` según su función.
- Los hallazgos, los comandos ejecutados y cualquier criterio no verificable quedan explícitos en la entrega. Un check ausente o fallido significa **no aprobado**, no una excepción tácita.

Si la app todavía no existe o no tiene README/scripts, detén la aprobación y documenta el bloqueo; no inventes otra ubicación ni marques checks no ejecutados como pasados.
