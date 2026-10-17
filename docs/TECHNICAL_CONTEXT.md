# Contexto técnico del repositorio

Este documento registra el estado comprobado del monorepo. No implica que las carpetas reservadas o los planes de trabajo ya estén implementados. Actualízalo cuando cambien stacks, comandos o límites de ejecución.

## Fuentes de contexto

- [`CONTEXT.md`](../CONTEXT.md): briefing empresarial de HealthCore, áreas, problemas y restricciones de negocio.
- [`company-choice.md`](../company-choice.md): elección del flujo de onboarding clínico y límites previstos para el agente.
- [`docs/IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md): decisiones, fases y validación del sitio público.
- [`AGENTS.md`](../AGENTS.md) y [`.agents/`](../.agents/README.md): flujo de trabajo e instrucciones para agentes.

Si una guía genérica contradice el estado comprobable del código, inspecciona el componente y documenta la discrepancia; no supongas que una propuesta equivale a una implementación.

## Mapa del repositorio

| Ruta                                                    | Estado y responsabilidad                                                                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uis/website/`                                          | Sitio público bilingüe implementado como HTML/CSS/JavaScript estático. Usa Tailwind CSS Play CDN; no tiene build de frontend configurado. Consulta su README y el plan web para ejecutar sus verificaciones. |
| `uis/talent-pipline-tracker/`                           | Aplicación Next.js independiente para seguimiento de talento. Incluye su propio `package.json`, configuración TypeScript/ESLint y un `AGENTS.md` local generado por Next.js.                                 |
| `packages/shared/`                                      | Metadata y tipos compartidos TypeScript; no hay un runner de monorepo en la raíz.                                                                                                                            |
| `agents/`, `skills/`, `mcps/`, `workflows/`             | Áreas de producto para capacidades de IA y automatización. La existencia de una carpeta o plantilla no significa que haya un agente en ejecución o infraestructura conectada.                                |
| `.agents/`                                              | Configuración del agente de programación: reglas y skills reutilizables para trabajar en este repositorio. No confundirla con las áreas de producto `agents/` y `skills/`.                                   |
| `services/`, `data/`, `infra/`, `scripts/`, `internal/` | Áreas organizativas del proyecto. No se debe inferir que exista un backend de HealthCore, pipeline de datos o despliegue común sin implementación y documentación en el componente.                          |
| `docs/`                                                 | Documentación transversal, planes y decisiones.                                                                                                                                                              |

## Stack y comandos comprobados

### `uis/talent-pipline-tracker`

El `package.json` declara Next.js 16.4.2, React 19.3.0, TypeScript 5, ESLint 9 y Tailwind CSS 4. Los comandos se ejecutan desde esa carpeta:

```bash
npm run dev
npm run lint
npm run build
npm start
```

El `AGENTS.md` local indica que Next.js genera y vuelve a escribir su bloque de instrucciones. Léelo antes de trabajar en esa aplicación y no elimines ese bloque.

### `uis/website`

El sitio usa HTML/JavaScript estático y Tailwind CDN. No tiene un proceso de compilación ni dependencias de npm propias documentadas. Consulta [`uis/website/README.md`](../uis/website/README.md) y [`docs/IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) para las instrucciones y verificaciones específicas. El plan registra que no se certificaron pruebas visuales en navegador ni lector de pantalla.

## Ubicaciones y dirección del frontend

- Sitio público: `uis/website/`. Actualmente contiene el sitio estático bilingüe; el destino acordado para su frontend es Next.js con TypeScript. Planifica la migración antes de reemplazar la implementación existente.
- Aplicación interna: `uis/backoffice/`. Es la ubicación asignada, pero todavía no existe una aplicación allí.
- APIs y workers: `services/`.
- Para frontend nuevo, usa Tailwind CSS mediante clases utilitarias. No añadas atributos `style`, bloques `<style>` ni estilos inline.
- Consulta [`WEB_DESIGN.md`](./WEB_DESIGN.md) para decisiones visuales y [`WEB_MVP.md`](./WEB_MVP.md) para alcance funcional.
- `uis/talent-pipline-tracker/` es una aplicación Next.js separada; no sustituye el sitio público ni el backoffice.
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) documenta el hito estático existente. Actualízalo antes de iniciar una migración para evitar confundir el plan histórico con el vigente.

## Límites conocidos

- No hay `package.json`, workspace runner ni comandos globales de test/lint en la raíz.
- No asumas que existe una API central, backend FastAPI, Docker Compose, CI o un runtime de agentes.
- No hay un harness global de evaluación para agentes. Si se añade uno, documenta cómo instalarlo, ejecutarlo y probar sus límites.
- Los requisitos del flujo de onboarding son una propuesta de proyecto; el almacenamiento de datos de empleados y credenciales requiere decisiones explícitas de privacidad, acceso y retención antes de implementarse.
- Los comandos de una aplicación no validan automáticamente las demás. Ejecuta solo las verificaciones pertinentes y reporta las limitaciones.
