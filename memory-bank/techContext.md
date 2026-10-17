# Technical Context — HealthCore Digital

**Última actualización:** 2026-10-17

## Ubicación de producto

- `uis/website/`: sitio público existente, actualmente estático y bilingüe. La dirección acordada para el frontend público es Next.js en esta misma ruta; cualquier migración debe planificarse antes de reemplazar el sitio.
- `uis/backoffice/`: ubicación para la aplicación interna; todavía no existe una app allí.
- `services/`: APIs y servicios backend.
- No crear un segundo árbol de frontend/API. Lee el README de cada área antes de añadir archivos.

## Stack y arquitectura

- El sitio público actual usa HTML, CSS/JavaScript estáticos y Tailwind CSS Play CDN; no tiene package.json ni build local.
- El frontend nuevo usará Next.js y TypeScript; Tailwind se aplica con clases utilitarias, sin atributos `style`, bloques `<style>` ni estilos inline.
- `uis/talent-pipline-tracker/` es otra aplicación Next.js (Next.js 16.4.2, React 19.3.0, TypeScript 5, ESLint 9, Tailwind 4), no es el sitio público ni el backoffice.
- El diseño aprobado/propuesto se consulta en [`docs/WEB_DESIGN.md`](../docs/WEB_DESIGN.md); el contenido y alcance funcional en [`docs/WEB_MVP.md`](../docs/WEB_MVP.md).
- `docs/TECHNICAL_CONTEXT.md` mantiene el mapa técnico detallado, comandos y límites comprobados.

## Restricciones técnicas

- No hay runner de workspace, package.json raíz, CI ni runtime común de agentes configurados.
- No asumas que existe un backend, API central, Docker Compose o almacenamiento persistente.
- No persistir ni enviar información médica introducida en el formulario público actual; su envío es simulado localmente.
- Tratar los datos de pacientes, empleados y credenciales como sensibles; la memoria del proyecto debe contener contexto y decisiones, nunca registros personales.
- La configuración del agente de programación vive en `.agents/rules/` y `.agents/skills/`; `/agents` y `/skills` son áreas de producto.
