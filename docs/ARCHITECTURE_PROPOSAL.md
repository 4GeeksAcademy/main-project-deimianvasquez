# Propuesta inicial de arquitectura backend — HealthCore Digital

**Estado:** borrador para revisión del equipo; no describe una implementación existente.
**Alcance inicial:** API del workflow de onboarding clínico y consulta de políticas internas aprobadas.
**Fecha:** 2026-10-20

## 1. Resumen y contexto

Propongo comenzar con un **monolito modular en FastAPI, organizado por dominios y con separación en capas**. El primer servicio atendería el flujo de onboarding elegido para HealthCore: checklists según cargo, sede y país; seguimiento de tareas; recordatorios; y consulta asistida de políticas aprobadas con derivación a RR. HH. cuando la información no alcance.

No propongo construir desde el primer día una plataforma que unifique todos los EHR, facturación, pacientes y analítica de las 12 clínicas. El contexto empresarial identifica esos problemas, pero la iniciativa priorizada en `company-choice.md` es onboarding. La arquitectura debe permitir ampliar el backend por dominios sin convertir el primer hito en una integración clínica de alcance indefinido.

La API sería un sistema separado de la interfaz Next.js del backoffice. El repositorio actual es un monorepo y reserva `services/` para APIs y workers, y `uis/backoffice/` para la aplicación interna. Esas carpetas son ubicaciones previstas, no componentes implementados.

## 2. Patrón arquitectónico propuesto

### Monolito modular con capas

La aplicación se desplegaría inicialmente como un servicio API, pero sus módulos mantendrían límites explícitos por dominio. Dentro de cada dominio, las responsabilidades se separarían en:

1. **Router/API:** protocolo HTTP, validación de entrada/salida y códigos de respuesta.
2. **Servicio/caso de uso:** reglas del workflow, coordinación de operaciones y decisiones de negocio.
3. **Repositorio/adaptador de datos:** lectura y escritura persistentes; evita acoplar reglas a una base de datos concreta.
4. **Esquemas:** contratos de entrada y salida de la API, separados de las entidades internas o del modelo persistido cuando corresponda.

Las funciones transversales —configuración, seguridad, dependencias comunes y acceso a base de datos— viven fuera de los dominios. `main.py` crea la aplicación, configura middleware y registra routers; no contendría reglas de negocio.

### Por qué encaja con HealthCore ahora

- **Equipo pequeño:** un equipo tecnológico de seis personas puede desarrollar y operar un único servicio con límites comprensibles; no necesita asumir desde el inicio despliegues, red y observabilidad de varios microservicios.
- **Problema acotado y evolutivo:** el onboarding reúne entidades y reglas coherentes (incorporaciones, tareas, políticas), pero hay variación por país, sede y cargo. Los módulos permiten aislar esa variación y probar el flujo sin mezclarlo con futuras áreas como facturación o datos clínicos.
- **Datos sensibles:** separar autorización, casos de uso y persistencia facilita aplicar controles de acceso, minimización y auditoría donde se necesitan. La estructura por sí sola no garantiza cumplimiento: el diseño de permisos, residencia, retención y borrado requiere revisión de Cumplimiento antes de tratar datos reales.
- **Integraciones legadas fragmentadas:** las clínicas tienen sistemas distintos y no existe una capa común. Un límite de adaptador permite integrar más adelante un sistema autorizado sin hacer que el dominio dependa de su proveedor o formato.
- **Opciones futuras:** si un módulo adquiere necesidades operativas distintas, sus límites pueden servir como punto de extracción. No se anticipa esa separación ni se comparte una base de datos entre servicios antes de demostrar la necesidad.

No elegiría MVC como patrón principal porque el backend es una API sin vistas renderizadas; una separación router–caso de uso–repositorio expresa mejor el flujo. Tampoco elegiría serverless o microservicios como punto de partida: no hay requisitos de escala o despliegue independiente comprobados que compensen su complejidad operativa. Son alternativas a reevaluar con datos de uso y necesidades reales.

## 3. Convenciones de FastAPI que informan la propuesta

La guía oficial de FastAPI **“Bigger Applications - Multiple Files”** muestra cómo dividir aplicaciones grandes en módulos Python, definir `APIRouter`, compartir dependencias e incluir routers desde la aplicación principal. Las guías oficiales de **Settings** y **CORS** describen, respectivamente, configuración desde variables de entorno y middleware de orígenes permitidos. Esta propuesta sigue esas convenciones: routers por dominio, ensamblaje central pequeño, dependencias explícitas, configuración fuera del código y middleware centralizado.

Referencias consultadas como base para el diseño (no implican que FastAPI esté instalado o configurado en el repositorio):

- [FastAPI: Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI: Settings and Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [FastAPI: CORS (Cross-Origin Resource Sharing)](https://fastapi.tiangolo.com/tutorial/cors/)

La guía de FastAPI ofrece una convención práctica, no obliga a una única estructura. Por eso la adaptación propuesta agrupa primero por dominio de negocio y, dentro de él, separa router, esquemas, servicio y repositorio. No pondría todos los routers en un archivo ni haría que cada router implemente directamente consultas y reglas de negocio.

## 4. Estructura propuesta

La siguiente estructura es un **objetivo inicial**, no archivos ya existentes. El nombre final del servicio y sus dependencias deben confirmarse al iniciar su implementación. Ubicación sugerida: `services/onboarding-api/`.

```text
services/
└── onboarding-api/
    ├── .env.example
    ├── pyproject.toml
    ├── README.md
    ├── app/
    │   ├── main.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── security.py
    │   │   └── exceptions.py
    │   ├── db/
    │   │   ├── database.py
    │   │   └── unit_of_work.py          # si la persistencia elegida lo requiere
    │   ├── api/
    │   │   └── v1/
    │   │       └── router.py            # agrupa routers de la versión
    │   ├── auth/
    │   │   ├── schemas.py
    │   │   ├── router.py
    │   │   └── dependencies.py
    │   ├── onboarding/
    │   │   ├── schemas.py
    │   │   ├── models.py
    │   │   ├── repository.py
    │   │   ├── service.py
    │   │   └── router.py
    │   ├── policies/
    │   │   ├── schemas.py
    │   │   ├── service.py
    │   │   └── router.py
    │   └── notifications/
    │       ├── schemas.py
    │       ├── service.py
    │       └── router.py                # opcional, solo si existe gestión por API
    └── tests/
        ├── test_onboarding_api.py
        └── test_policy_access.py
```

### Criterio de separación

- `core/`: configuración compartida y utilidades transversales. `security.py` alojaría integraciones y dependencias de seguridad una vez elegido el proveedor de identidad; no contiene secretos.
- `db/`: creación y ciclo de vida de conexiones/sesiones y límites transaccionales. La base de datos y estrategia de migraciones quedan por decidir; no usaría `data/db.json` como persistencia de producción para datos laborales sensibles.
- `api/v1/`: ensamblaje de rutas bajo una versión explícita (`/api/v1`). Permite evolucionar contratos sin trasladar versionado a cada dominio.
- `auth/`: validación de identidad y autorización, cuando se defina el mecanismo corporativo. La autenticación no equivale a decidir qué puede hacer cada rol.
- `onboarding/`: ciclo de incorporación, asignación de checklist, tareas, progreso y derivación/revisión humana.
- `policies/`: acceso a contenido aprobado y respuestas del asistente con referencia a la política fuente. No es el lugar para almacenar políticas arbitrarias ni para decidir excepciones laborales.
- `notifications/`: coordinación de recordatorios. La entrega por email/SMS requerirá proveedor, consentimiento/configuración, reintentos y manejo de fallos; no se introduce una cola o proveedor específico sin requisitos confirmados.
- `tests/`: pruebas de contratos, reglas y permisos, con datos sintéticos. Se recomienda mantener pruebas cerca del dominio si el equipo lo prefiere, siempre con un criterio uniforme.

La estructura sugerida por el equipo (`core`, `db`, módulos como `auth` y `users`, y archivos de configuración y dependencias) es un buen punto de partida inspirado en la separación habitual de FastAPI. La adapto al negocio: `users` no se convierte automáticamente en un dominio central genérico; las personas que usan el sistema pueden pertenecer a RR. HH., clínica o administración y sus permisos dependen del caso de uso. El dominio inicial es `onboarding`, no una carpeta de usuarios con responsabilidades ambiguas.

## 5. Dominios y routers/endpoints

Los endpoints se agruparían por recursos y dominio bajo `/api/v1`. Los nombres siguientes describen el contrato esperado; requieren validación con RR. HH., Seguridad y Cumplimiento antes de implementarse.

| Router          | Rutas conceptuales                                                                                                                                                            | Responsabilidad                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth`          | `GET /api/v1/auth/me` (y callback/renovación si lo determina el proveedor)                                                                                                    | Resolver identidad y contexto de acceso; no almacenar contraseñas ni inventar un sistema de inicio de sesión propio antes de revisar identidad corporativa.                                      |
| `onboarding`    | `POST /api/v1/onboardings`; `GET /api/v1/onboardings`; `GET /api/v1/onboardings/{id}`; `GET /api/v1/onboardings/{id}/tasks`; `PATCH /api/v1/onboardings/{id}/tasks/{task_id}` | Crear/consultar incorporaciones y actualizar tareas permitidas. La creación y asignación de tareas deben aplicar permisos y conservar auditoría.                                                 |
| `policies`      | `GET /api/v1/policies`; `POST /api/v1/policy-questions`                                                                                                                       | Consultar el catálogo autorizado y enviar una pregunta al asistente. La respuesta debe indicar la fuente utilizada o declarar que no pudo encontrar una respuesta suficiente y derivar a RR. HH. |
| `notifications` | Sin endpoint público inicial; opcionalmente rutas administrativas para consultar estado/reintentar envíos                                                                     | El backend desencadena recordatorios conforme a reglas acordadas. No debe exponer datos sensibles en mensajes ni respuestas de error.                                                            |

La API distinguiría los esquemas de creación, actualización y respuesta. No devolvería checklist o políticas de otros países a quien no tenga autorización. Las operaciones con impacto —por ejemplo, confirmar una verificación o marcar una tarea como completada— deben registrar quién las realizó y cuándo. El asistente puede explicar requisitos y siguientes pasos, pero **no aprueba credenciales ni habilita a una persona para trabajar**; esas decisiones siguen siendo humanas.

Los nombres y métodos HTTP son una propuesta inicial, no un contrato aprobado. En particular, se debe definir qué identificador interno opaco se usará para una persona empleada, qué atributos son imprescindibles y qué roles pueden leer o actualizar cada recurso antes de fijar los esquemas.

## 6. Frontend y backend como sistemas separados

El backoffice previsto en `uis/backoffice/` será un frontend Next.js/TypeScript; la API vivirá en `services/onboarding-api/`. Aunque residan en el mismo monorepo, se construyen y configuran como aplicaciones independientes: dependencias, ejecución, pruebas y despliegues pueden tener ciclos separados. Mantener un monorepo facilita revisar cambios coordinados y documentar contratos, pero no implica compartir directamente código de base de datos ni que un cambio de frontend requiera desplegar el backend.

- **Comunicación:** el navegador consume la API mediante HTTP/JSON y una base de URL configurable. La UI no accede a la base de datos. Deben acordarse contratos, errores, paginación y compatibilidad de versiones; los tipos compartidos TypeScript, si se añaden, describen contratos públicos y no reemplazan validación del servidor.
- **Variables de entorno:** el backend tendrá su configuración propia y secretos inyectados por entorno de ejecución; `.env.example` documenta nombres y valores ficticios, y `.env` real se excluye de Git. El frontend recibe una URL pública de API no secreta. Nunca se ponen claves privadas, tokens de servicio ni credenciales en variables accesibles al navegador.
- **CORS:** al estar frontend y API en orígenes distintos, la API debe permitir explícitamente los orígenes de desarrollo y producción aprobados y solo los métodos/headers necesarios. Evitar `*` con credenciales; revisar cookies, `SameSite`, CSRF y almacenamiento de tokens según el mecanismo de identidad seleccionado. CORS no autentica ni autoriza a un usuario.
- **Identidad y sesión:** decidir con el equipo cómo se autenticarán empleados y cómo se propagarán identidad y permisos. No se debe implementar seguridad propia por conveniencia ni considerar CORS sustituto de autorización.
- **Despliegue y jurisdicción:** separar las URLs y secretos por entorno. Antes de persistir registros de empleados, determinar con Cumplimiento y Seguridad residencia/transferencia permitida, retención, borrado, auditoría y controles aplicables en EE.UU. y Reino Unido. El monorepo no resuelve por sí solo la residencia de datos.

El frontend público de HealthCore es hoy un sitio estático, y la aplicación interna/backoffice todavía no existe. Esta propuesta se refiere a la futura interfaz interna; no implica que el formulario del sitio público deba empezar a enviar o almacenar datos personales o clínicos.

## 7. Decisiones iniciales y temas por resolver

### Decisiones que sí propongo ahora

- FastAPI como marco de API del servicio inicial, sujeto a confirmación al crear el servicio; no se presupone instalado.
- Monolito modular con separación por dominio y capas, alojado en `services/`.
- Contratos agrupados bajo `/api/v1`, con routers FastAPI por dominio.
- Configuración externa por entorno y secretos fuera del repositorio.
- Datos sintéticos para desarrollo/pruebas, minimización de campos y revisión humana en decisiones de credenciales.
- API independiente de la UI; contratos HTTP/JSON y CORS limitado a orígenes conocidos.

### Decisiones que requieren investigación y aprobación

1. Proveedor de identidad corporativa, roles, permisos y mecanismo de sesión.
2. Base de datos, residencia, cifrado, copias, migraciones, retención y borrado.
3. Modelo mínimo de datos y sistema fuente para empleado, sede, país, cargo y estado de credenciales.
4. Contenido fuente aprobado de políticas y proceso para mantener versiones, jurisdicción, permisos y referencias del asistente.
5. Canal/proveedor de recordatorios, preferencias de contacto, límites y operación ante fallos.
6. Auditoría y observabilidad: eventos que registrar, acceso a los registros, retención y exclusión de información sensible de logs.
7. Contratos de API, límites de tasa, paginación y política de cambios/versionado.

Estas preguntas deben resolverse antes de procesar datos reales; HIPAA y UK GDPR son restricciones del caso que requieren evaluación de responsables competentes, no una certificación derivada de esta arquitectura.

## 8. Riesgos y puntos de atención

1. **Router monolítico o reglas duplicadas:** si todos agregan endpoints a `main.py` o copian lógica entre routers, se dificulta probar permisos y mantener reglas coherentes. Mitigación: routers por dominio, reglas en servicios y revisión de límites del módulo.
2. **Permisos demasiado amplios entre países/roles:** una checklist, política o dato laboral puede quedar visible a usuarios que no lo necesitan. Mitigación: autorización en el servidor por recurso, propósito y contexto jurisdiccional; pruebas de acceso denegado; revisión de Cumplimiento. Ocultar botones en la UI no es control de acceso.
3. **Falsa sensación de cumplimiento por usar FastAPI o CORS:** framework, HTTPS y allowlist CORS no sustituyen identidad, autorización, auditoría, gestión de secretos, residencia ni procesos de retención/borrado. Deben asignarse responsables y verificar esos controles antes de datos reales.
4. **Convertir el asistente en autoridad:** una respuesta errónea o política desactualizada podría llevar a asumir que una credencial está aprobada. El asistente debe limitarse a información vigente y aprobada, mostrar fuente/fecha, expresar incertidumbre y escalar; la aprobación queda en manos humanas.
5. **Notificaciones con exposición accidental o duplicadas:** mensajes enviados al destinatario equivocado o reintentos no idempotentes pueden revelar información o confundir al empleado. Minimizar el contenido, verificar destino y acordar idempotencia, reintentos y auditoría antes de automatizar.
6. **Alcance que crece hacia toda la plataforma:** intentar integrar EHR, facturación, pacientes y RR. HH. en el primer servicio retrasaría el caso de onboarding y mezclaría dominios con controles distintos. Entregar primero el flujo acotado y acordar explícitamente cualquier nuevo dominio.

## 9. Criterio para revisar la propuesta

Revisar el patrón si el onboarding necesita escala o ciclos de despliegue claramente independientes; revisar límites de dominio si aparecen integraciones concretas; y revisar las decisiones de seguridad/almacenamiento con Cumplimiento antes de sustituir datos sintéticos por datos reales. Cualquier ampliación a información clínica o integración con EHR requiere una evaluación separada de alcance, autoridad de datos y controles.
