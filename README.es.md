# HealthCore Digital — Monorepo de Ingeniería de IA

[![4Geeks Academy](https://img.shields.io/badge/4Geeks-Academy-blue)](https://4geeksacademy.com)
[![AI Engineering](https://img.shields.io/badge/track-AI%20Engineering-green)](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)

_Monorepo del proyecto transversal de Ingeniería de IA de HealthCore Digital._

_These instructions are also available in [English](./README.md)._

---

## Propósito

Este repositorio contiene el contexto de negocio, las aplicaciones y la documentación del proyecto HealthCore Digital. [`CONTEXT.md`](./CONTEXT.md) es la fuente de verdad para los hechos y restricciones de negocio; [`company-choice.md`](./company-choice.md) registra el proyecto de onboarding seleccionado.

- Lee [`AGENTS.md`](./AGENTS.md) antes de realizar cambios en el repositorio.
- Empieza por el índice de [`memory-bank/`](./memory-bank/README.md) para consultar el contexto persistente y las decisiones vigentes.
- Consulta [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md) para conocer el mapa de implementación y los comandos actuales.
- Sigue las reglas aplicables indexadas en [`.agents/`](./.agents/README.md) y el README/AGENTS más cercano al área que modificarás.

---

## Cómo empezar

1. Lee el contexto de negocio y técnico enlazado arriba.
2. Antes de editar, inspecciona el README del área y cualquier `AGENTS.md` más específico.
3. Usa los comandos propios de cada aplicación; no existe un runner de workspace en la raíz.
4. Mantén los cambios en la carpeta responsable y documenta cada componente nuevo.
5. Completa la lista de validación y entrega de `AGENTS.md` antes de entregar cambios.

---

## Cómo entender este monorepo

Estás construyendo **una sola empresa** a lo largo de muchos hitos y proyectos. Cada carpeta de primer nivel tiene **una responsabilidad clara** — como en un repositorio real de un equipo de ingeniería.

| Capa                    | Carpetas                          | Qué vive aquí                                                               |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| **Contexto de empresa** | `CONTEXT.md`                      | Datos del dominio, nombres de campos y restricciones de tu empresa asignada |
| **Cara al usuario**     | `uis/`, `services/`               | Frontends y backends con los que interactúan usuarios u operadores          |
| **Datos**               | `data/`                           | Archivos crudos, pipelines, datasets procesados y conjuntos de evaluación   |
| **IA**                  | `agents/`, `skills/`, `mcps/`     | Agentes, capacidades reutilizables para agentes y servidores MCP            |
| **Automatización**      | `workflows/`                      | Flujos n8n y orquestación entre sistemas                                    |
| **Reutilización**       | `packages/`, `shared/`            | Tipos compartidos, SDKs, esquemas, plantillas                               |
| **Operaciones**         | `infra/`, `scripts/`, `internal/` | Docker, despliegue, scripts puntuales, CLIs internas                        |
| **Documentación**       | `docs/`                           | Arquitectura, decisiones y convenciones de todo el repo                     |

**Regla rápida:** si tiene interfaz visual → `uis/`. Si expone una API o corre en segundo plano → `services/`. Si mueve o transforma datos → `data/`. Si el trabajo lo hace un modelo de IA → `agents/` (+ `skills/` o `mcps/` según haga falta).

---

## Estado actual

- `uis/website/` contiene el sitio público estático bilingüe.
- `uis/talent-pipline-tracker/` es una aplicación Next.js con sus propios scripts.
- La migración del sitio público a Next.js corresponde a `uis/website/`; la app interna va en `uis/backoffice/` y las APIs en `services/`. Consulta [`memory-bank/frontend-decisions.md`](./memory-bank/frontend-decisions.md). El sitio sigue estático hasta que la migración se planifique e implemente.
- `packages/shared/` tiene metadata de un paquete TypeScript compartido, pero no hay runner de workspace en la raíz.
- Las demás carpetas principales organizan áreas y documentación; no asumas que existe un backend, CI, stack Docker Compose o runtime de agentes si el componente no lo documenta.
- El stack, los comandos y las limitaciones se describen en [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md).

---

## Guía de carpetas — qué va en cada una

Lee el `README.md` enlazado dentro de cada carpeta antes de empezar a programar ahí.

### Archivos en la raíz

| Ruta                                                       | Propósito                                         | Qué haces aquí                                      |
| ---------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| [`CONTEXT.md`](./CONTEXT.md)                               | Contexto de negocio y restricciones de HealthCore | Leer antes de cambiar el comportamiento del dominio |
| [`company-choice.md`](./company-choice.md)                 | Proyecto seleccionado e idea de agente            | Usar junto al briefing de empresa                   |
| [`AGENTS.md`](./AGENTS.md)                                 | Flujo de trabajo global para agentes              | Obligatorio antes de modificar archivos             |
| [`.agents/`](./.agents/README.md)                          | Reglas específicas para agentes                   | Leer las reglas del área afectada                   |
| [`docs/TECHNICAL_CONTEXT.md`](./docs/TECHNICAL_CONTEXT.md) | Mapa de implementación actual                     | Fuente para tecnologías y comandos reales           |

### `uis/` — interfaces de usuario

**Propósito:** Todas las aplicaciones frontend — todo lo que un humano ve y en lo que hace clic.

**Pon aquí:**

- Sitio web público (`website/`)
- Admin interno / backoffice (`backoffice/`)
- Portales de clientes, apps de fidelización, herramientas Streamlit/Gradio, dashboards con UI

**Ejemplos:** landing corporativa, backoffice de operaciones, portal de fidelización, UI de dashboard de telemetría

→ Ver [`uis/README.md`](./uis/README.md)

### `services/` — APIs y servicios backend

Esta carpeta está reservada para servicios backend. Actualmente no hay una API de HealthCore implementada ni un framework backend configurado aquí. Al añadir un servicio, documenta su stack y sus comandos de ejecución/prueba; no asumas que ya existe FastAPI ni una API centralizada.

→ Ver [`services/README.md`](./services/README.md)

### `data/` — datasets, pipelines y evaluación

**Propósito:** Todo lo relacionado con datos, desde archivos crudos hasta tablas listas para producción.

| Subcarpeta                                      | Propósito                     | Qué haces aquí                                                                  |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| [`data/raw/`](./data/raw/README.md)             | Datos fuente sin tocar        | Guardar dumps, exports, CSV/JSON de ejemplo — documentar origen y reglas de PII |
| [`data/pipelines/`](./data/pipelines/README.md) | Jobs ETL/ELT                  | Escribir scripts de ingesta, limpieza y transformación                          |
| [`data/process/`](./data/process/README.md)     | Salidas limpias / intermedias | Guardar artefactos de pipelines (features, agregados, tablas limpias)           |
| [`data/eval/`](./data/eval/README.md)           | Medición de calidad           | Golden sets, datasets de evaluación RAG/agentes, métricas de experimentos       |

**Flujo:** `raw` → `pipelines` → `process` → consumido por `services/`, `uis/` o `agents/`. Usa `eval` para demostrar calidad.

### `agents/` — agentes de IA

**Propósito:** Asistentes de IA autónomos o semi-autónomos para la empresa.

**Pon aquí:**

- Una subcarpeta por agente (p. ej. `support-agent/`, `onboarding-agent/`)
- Config del agente, prompts, herramientas, tests
- Empieza desde [`agents/_template/`](./agents/_template/README.md) al crear un agente nuevo

**Ejemplos:** bot de soporte al cliente, copiloto de onboarding, asistente de formación

→ Ver [`agents/README.md`](./agents/README.md)

### `skills/` — capacidades reutilizables para agentes

**Propósito:** Instrucciones empaquetadas + scripts que agentes (o tú en Cursor) reutilizan en todo el repo.

**Pon aquí:**

- Skills de análisis de datos, code review, scraping, investigación, etc.
- Cada skill = carpeta con `SKILL.md`, scripts y recursos opcionales

**Ejemplo incluido:** `skills/data-analysis/` (script de limpieza pandas + referencia de métricas)

→ Ver [`skills/README.md`](./skills/README.md)

### `mcps/` — servidores Model Context Protocol

**Propósito:** Conectar modelos de IA con tus sistemas — bases de datos, APIs, GitHub, herramientas propias.

**Pon aquí:**

- Una subcarpeta por servidor MCP (p. ej. `database-mcp/`, `github-mcp/`)
- Definiciones de tools, resources y config del servidor

**Cuándo usarlo:** cuando un agente necesita acceso en vivo a datos o acciones que el código solo no puede dar

→ Ver [`mcps/README.md`](./mcps/README.md)

### `workflows/` — automatización y orquestación

**Propósito:** Conectar sistemas sin escribir apps completas — jobs programados, webhooks, notificaciones.

**Pon aquí:**

- Exports de workflows n8n, configs de Make/Zapier u orquestación documentada
- Flujos que enlazan `services/`, `data/pipelines/` y `agents/`

**Ejemplos:** nuevo pedido → alerta Slack, trigger ETL nocturno, lead → sync CRM

→ Ver [`workflows/README.md`](./workflows/README.md)

### `packages/` — librerías compartidas

**Propósito:** Código versionable reutilizado por varias apps, agentes o pipelines.

**Pon aquí:**

- Tipos TypeScript compartidos (`packages/shared/` → `@repo/shared-types`)
- Librerías de componentes UI, clientes API, SDKs de analytics

**Regla:** si `uis/` y `services/` comparten la misma interfaz → extráela aquí

→ Ver [`packages/README.md`](./packages/README.md)

### `shared/` — recursos sueltos compartidos

**Propósito:** Recursos que no son un paquete completo — esquemas, plantillas, assets estáticos, docs cortas.

**Pon aquí:**

- Esquemas JSON, plantillas de email, specs OpenAPI, design tokens
- Cualquier cosa reutilizada pero demasiado pequeña o no-código para `packages/`

→ Ver [`shared/README.md`](./shared/README.md)

### `docs/` — documentación transversal

**Propósito:** Arquitectura y decisiones que abarcan todo el proyecto de la empresa.

**Pon aquí:**

- Diagramas de arquitectura, ADRs, guías de seguridad/observabilidad
- Convenciones no atadas a una sola app o agente

→ Ver [`docs/README.md`](./docs/README.md)

### `infra/` — infraestructura y despliegue

**Propósito:** Cómo corre el proyecto en Docker, cloud o CI.

**Pon aquí:**

- Dockerfiles, Terraform, manifiestos K8s, configs Nginx, pipelines CI/CD

Actualmente no existe configuración Docker Compose en la raíz. Documenta orquestación y despliegue cuando se añadan esos archivos.

→ Ver [`infra/README.md`](./infra/README.md)

### `scripts/` — scripts de ayuda

**Propósito:** Automatización pequeña y repetible — no apps completas.

**Pon aquí:**

- Scripts de setup, generadores de seed data, wrappers de lint, migraciones puntuales
- Documenta cada script: qué hace, argumentos y cómo ejecutarlo

**Diferencia con `internal/`:** los scripts suelen ser archivos sueltos; las tools de `internal/` son proyectos estructurados con deps y tests propios.

→ Ver [`scripts/README.md`](./scripts/README.md)

### `internal/` — herramientas internas para desarrolladores

**Propósito:** Utilidades robustas para el equipo de ingeniería.

**Pon aquí:**

- CLIs, herramientas de migración empaquetadas, evaluadores de prompts
- Tools con su propio `package.json`, tests y pasos de instalación

→ Ver [`internal/README.md`](./internal/README.md)

---

## ¿Dónde pongo esto?

Guía rápida de decisión:

```text
¿Tiene botones y pantallas?                → uis/
¿Corre en servidor / API / cola?           → services/
¿Es dato crudo o transformado?             → data/raw/ o data/process/
¿Mueve datos entre sistemas?               → data/pipelines/
¿Mides calidad de IA/pipelines?            → data/eval/
¿Es un asistente de IA con un objetivo?    → agents/
¿Es una capacidad/instrucción reutilizable?→ skills/
¿La IA necesita llamar tools/APIs externas?→ mcps/
¿Es n8n / automatización programada?       → workflows/
¿2+ carpetas importan el mismo código?     → packages/
¿Es esquema/plantilla/asset, no librería?  → shared/
¿Es arquitectura o docs de todo el equipo? → docs/
¿Es orquestación local del stack?          → documenta su ubicación real cuando se añada
¿Es Docker / deploy / config cloud?        → infra/
¿Es un script puntual?                     → scripts/
¿Es una CLI con su propio paquete?         → internal/
```

---

## Estructura del repositorio (árbol)

```text
healthcore-digital/
├── README.md / README.es.md   # Guía del repositorio
├── AGENTS.md                  # Flujo compartido para agentes
├── .agents/                   # Reglas específicas para agentes
├── CONTEXT.md                 # Contexto de negocio de HealthCore
├── company-choice.md          # Proyecto de onboarding seleccionado
├── docs/                      # Documentación transversal
├── uis/
│   ├── website/               # Sitio estático bilingüe
│   └── talent-pipline-tracker/ # Aplicación Next.js
├── services/                  # Reservado para servicios backend
├── data/                      # Área de datos del proyecto
├── agents/                    # Agentes de IA (+ plantilla _template/)
├── skills/                    # Skills reutilizables para agentes
├── mcps/                      # Servidores MCP para acceso a tools
├── workflows/                 # Flujos n8n y automatizaciones
├── packages/                  # Librerías compartidas (@repo/shared-types, …)
├── shared/                    # Esquemas, plantillas, assets sueltos
├── docs/                      # Arquitectura y docs transversales
├── infra/                     # Docker, Terraform, despliegue
├── scripts/                   # Scripts de ayuda
└── internal/                  # CLIs y herramientas internas de desarrollo
```

---

## Enlaces

- [4Geeks Academy — Ingeniería de IA](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)
- [Cómo empezar un proyecto de código](https://4geeks.com/lesson/how-to-start-a-project)

---

## Contribuidores

Este repositorio se originó a partir de la plantilla del Programa de Carrera de Ingeniería de IA de 4Geeks Academy, creada por [@marcogonzalo](https://www.linkedin.com/in/marcogonzalo), [@alesanchezr](https://x.com/alesanchezr) y otros colaboradores. Conoce el [Curso de Ingeniería de IA](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia).

Puedes encontrar otras plantillas y recursos similares en la [página de GitHub de 4Geeks Academy](https://github.com/4geeksacademy).

_El contexto y el estado de implementación específicos de este repositorio prevalecen sobre las guías genéricas de la plantilla._
