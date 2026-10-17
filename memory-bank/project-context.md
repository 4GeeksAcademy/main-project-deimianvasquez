# Contexto activo del proyecto

**Última actualización:** 2026-10-17

Resumen de orientación. Los archivos canónicos que el agente debe leer al inicio de cada sesión son [`projectbrief.md`](./projectbrief.md), [`techContext.md`](./techContext.md) y [`progress.md`](./progress.md); sus detalles prevalecen sobre este resumen. Actualízalos cuando cambie el proyecto.

## Negocio

HealthCore es una red ambulatoria con 12 clínicas en Estados Unidos y Reino Unido, aproximadamente 200 empleados y una unidad interna, HealthCore Digital, encargada de modernizar sistemas y flujos de trabajo. Sus necesidades incluyen mejorar el acceso y las citas, reducir problemas del ciclo de ingresos, apoyar al personal clínico y unificar operaciones con privacidad adecuada.

El contexto de negocio completo está en [`CONTEXT.md`](../CONTEXT.md). La iniciativa elegida es un workflow de onboarding clínico con checklists y un asistente para consultar políticas aprobadas, según [`company-choice.md`](../company-choice.md). El agente propuesto no puede aprobar credenciales ni decidir habilitación laboral; esos casos requieren revisión humana.

## Arquitectura y ubicaciones

- Sitio público (destino Next.js): `uis/website/`.
- Aplicación interna: `uis/backoffice/`.
- APIs y workers: `services/`.
- No crear árboles paralelos ni inferir que una app existe porque su carpeta esté reservada.
- El sitio público actual en `uis/website/` es estático; el destino acordado es Next.js con TypeScript en esa misma ruta. Planifica la migración antes de reemplazarlo.
- La app `uis/talent-pipline-tracker/` es un proyecto Next.js distinto, no el backoffice de HealthCore.

La estructura real y los comandos están en [`docs/TECHNICAL_CONTEXT.md`](../docs/TECHNICAL_CONTEXT.md). Las decisiones visuales y el alcance del sitio están en [`docs/WEB_DESIGN.md`](../docs/WEB_DESIGN.md) y [`docs/WEB_MVP.md`](../docs/WEB_MVP.md).

## Convenciones vigentes

- Para el frontend nuevo, usar TypeScript y Tailwind CSS mediante clases utilitarias; no usar atributos `style`, bloques `<style>` ni estilos inline.
- Leer el README de cada área antes de añadir archivos. Seguir el flujo común de [`AGENTS.md`](../AGENTS.md), las reglas bajo [`.agents/rules/`](../.agents/rules/README.md) y la skill de [`.agents/skills/`](../.agents/skills/README.md) cuando aplique.
- Tratar datos de salud, laborales y credenciales como sensibles; usar datos sintéticos y no registrar ni transmitir datos reales sin autorización y controles documentados. HIPAA y UK GDPR son restricciones del caso, no asesoramiento legal.

## Estado y mantenimiento

- El hito del sitio público estático está implementado según [`docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md); el plan registra revisión visual y con tecnologías de asistencia aún pendiente.
- `uis/backoffice/` es una ubicación asignada, pero no hay una app implementada allí todavía.
- La configuración de agentes vive bajo `.agents/rules/` y `.agents/skills/`; `frontend-preflight` valida convenciones y aceptación de cambios de UI.
- No hay runner de workspace en la raíz ni un runtime de agentes común.
- Después de completar una feature, registrar aquí el cambio de estado, las decisiones nuevas, los problemas abiertos y la fecha de actualización. No mantengas hechos distintos de las fuentes canónicas.
