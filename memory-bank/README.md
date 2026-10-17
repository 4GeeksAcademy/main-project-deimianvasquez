# Banco de memoria del proyecto

Este directorio es el contexto activo y versionado del proyecto, leído al inicio de cada sesión de trabajo con código. Actualízalo cuando cambien decisiones, arquitectura, features completadas o problemas relevantes. No es memoria runtime.

## Fuentes canónicas

- [Project brief](./projectbrief.md): descripción del negocio, objetivo y problema.
- [Technical context](./techContext.md): stack, decisiones de arquitectura y restricciones.
- [Progress](./progress.md): estado actual, verificaciones y próximos pasos.
- [Contexto de negocio](../CONTEXT.md): empresa, necesidades, departamentos y restricciones.
- [Proyecto elegido](../company-choice.md): flujo de onboarding seleccionado y límites del agente propuesto.
- [Contexto activo](./project-context.md): resumen operativo de negocio, arquitectura, decisiones y estado actual.
- [Contexto técnico actual](../docs/TECHNICAL_CONTEXT.md): estructura existente, stacks comprobados, comandos y limitaciones.
- [Decisiones del frontend](./frontend-decisions.md): stack acordado para el próximo frontend y documentos de diseño/alcance.
- [Reglas para agentes](../AGENTS.md) y [reglas específicas](../.agents/README.md): proceso de trabajo y convenciones.

## Mantenimiento

Actualiza `progress.md` al completar features, cambiar decisiones o descubrir problemas relevantes; actualiza `projectbrief.md` o `techContext.md` cuando cambien sus respectivas fuentes. Mantén el resumen `project-context.md` y este índice sincronizados. Los agentes deben leer los tres archivos canónicos al inicio de cada sesión según [`AGENTS.md`](../AGENTS.md).
