# Estado del proyecto

**Última actualización:** 2026-10-17

## Completado

- El hito 1 del sitio público estático bilingüe llegó a la fase 6 de QA. `docs/IMPLEMENTATION_PLAN.md` registra que queda pendiente la aprobación final y la revisión visual/asistida en navegador.
- Se documentaron el contexto de HealthCore, reglas raíz, reglas temáticas y la skill `frontend-preflight` con checker y autocontrol.
- La infraestructura de configuración de agentes vive bajo `.agents/`; el contexto activo y sus fuentes están en `memory-bank/`.

## Estado actual

- `uis/website/` sigue siendo estático; todavía no se implementó la migración pública a Next.js.
- `uis/backoffice/` es la ubicación asignada para la app interna, pero aún no existe.
- `services/` es la ubicación asignada para APIs; no hay una API de HealthCore implementada.
- No hay scripts globales de monorepo ni harness común de evaluación de agentes.

## Próximos pasos

1. Antes de migrar el sitio público, actualizar `docs/IMPLEMENTATION_PLAN.md` con el alcance y las fases para Next.js en `uis/website/`, preservando las decisiones de `WEB_DESIGN.md` y `WEB_MVP.md`.
2. Crear la app interna solo cuando se solicite, dentro de `uis/backoffice/`, después de leer las instrucciones de `uis/` y documentar su propio README.
3. Añadir APIs únicamente dentro de `services/` y documentar su stack y validaciones reales.
4. Actualizar este archivo al completar una feature, cambiar arquitectura o registrar un problema relevante; no marcar pasos futuros como completados antes de verificarlos.

## Verificación de la skill

El autocontrol de `frontend-preflight` valida un caso correcto y rechaza cinco violaciones: ubicación incorrecta, JavaScript de aplicación, falta de Tailwind, ausencia de `className` y estilos inline. Los comandos lint/build de una app futura solo podrán ejecutarse cuando exista y estén documentados en su `package.json`.
