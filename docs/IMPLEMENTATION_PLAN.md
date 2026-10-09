# Plan de implementación — Sitio público de HealthCore

**Hito:** 1 — Sitio web público bilingüe  
**Estado:** Fase 6 completada; pendiente de aprobación final y confirmaciones previas a publicación  
**Fecha:** 2026-10-09  
**Documentos de referencia:** [WEB_MVP.md](./WEB_MVP.md), [WEB_DESIGN.md](./WEB_DESIGN.md), [CONTEXT.md](../CONTEXT.md)

> Este archivo organiza el trabajo por fases. Se completará **una fase a la vez** y se solicitará aprobación antes de comenzar la siguiente.

## 1. Evaluación del repositorio y ubicación

El repositorio es una plantilla de monorepo y no contiene una aplicación web existente ni una configuración frontend que debamos extender. La guía de [`uis/`](../uis/README.md) designa `uis/website/` para la presencia web pública. Por eso, el sitio se desarrollará como una aplicación estática independiente en esa ubicación, sin mezclarlo con servicios de backend ni con el backoffice.

La propuesta técnica inicial es HTML, CSS y JavaScript estáticos, sin framework ni dependencias de compilación salvo que una necesidad concreta lo justifique y se apruebe. Esto se ajusta al alcance: landing page bilingüe y formulario de consulta con envío simulado.

### Estructura de alto nivel propuesta

```text
uis/website/
├── README.md
├── index.html
├── index.es.html
├── application.html
├── application.es.html
├── assets/
│   ├── js/
│   │   ├── navigation.js
│   │   └── application-form.js
│   └── images/
└── robots.txt
```

La estructura es orientativa y puede ajustarse al iniciar la fase de base. **Decisión actualizada:** la presentación usa clases utilitarias Tailwind CSS cargadas desde Play CDN, sin hojas CSS locales ni atributos `style` o bloques `<style>`. No se incluirá JavaScript ejecutable de interfaz en línea; el comportamiento vivirá en archivos `.js` externos. El HTML podrá contener datos estructurados JSON-LD, que son metadatos declarativos y no código de interfaz ejecutable.

## 2. Decisiones confirmadas

- El sitio ofrecerá versiones completas en inglés y español.
- **GEO** significa **Generative Engine Optimization**.
- La marca se representará solo como el texto **HealthCore**; no se inventará un símbolo ni un logotipo gráfico.
- Para la fecha preferida se excluirán únicamente sábados y domingos al calcular días hábiles; no se excluirán festivos.
- La disponibilidad para citas corresponde a los horarios de las clínicas publicados en el brief. La política de atención de emergencias se decidirá más adelante por la empresa; no se inventará una política en la implementación.
- El copyright será **© 2026 HealthCore**.
- El formulario es una consulta para que recepción contacte a la persona y confirme los detalles; no confirma ni reserva una cita.
- El envío se simulará en el navegador. No se guardarán ni transmitirán datos de pacientes.
- Se implementarán únicamente las seis clínicas estadounidenses detalladas en `WEB_MVP.md`; no se inventarán las ubicaciones faltantes.
- La presentación del sitio usa Tailwind CSS Play CDN y clases utilitarias; no se mantienen hojas CSS locales ni dependencias de compilación. Servir las páginas requiere conexión a internet para cargar el CDN.

## 3. Fases y puntos de aprobación

### Fase 1 — Planificación y decisiones de alcance

- Registrar ubicación, arquitectura propuesta, requisitos y etapas de trabajo.
- Identificar datos de marca o contenido de terceros que requieren validación.
- **Criterio de salida:** plan revisado y aprobación explícita del usuario.

**Estado:** completada; el usuario aprobó iniciar la implementación.

### Fase 2 — Base del sitio estático

- Crear `uis/website/` y su documentación de ejecución.
- Establecer archivos HTML bilingües para landing y formulario, hojas CSS externas y scripts externos separados.
- Definir tokens visuales y estructura semántica compartida según `WEB_DESIGN.md`.
- **Criterio de salida:** estructura clara, navegación entre páginas/idiomas y ausencia de estilos o scripts en línea; solicitar aprobación.

**Estado:** completada. Se creó `uis/website/` con páginas HTML bilingües de base, CSS externo compartido, JavaScript externo de navegación móvil y documentación. La validación no encontró errores ni estilos/scripts en línea. Pendiente de aprobación antes de Fase 3.

### Fase 3 — Landing bilingüe

- Construir las secciones en el orden definido en `WEB_MVP.md`: encabezado, hero, servicios, ventajas, ubicaciones de EE. UU., contacto y pie de página.
- Mantener contenido equivalente y totalmente traducido entre inglés y español; mostrar teléfonos y correos como enlaces accionables.
- Usar la palabra HealthCore como marca textual, sin símbolo inventado.
- **Criterio de salida:** contenido aprobado, diseño adaptable y selector EN/ES funcional; solicitar aprobación.

**Estado:** completada. Se implementaron ambas versiones de la landing con hero, servicios, ventajas, las seis clínicas de EE. UU., contacto y pie de página. Teléfonos/correos son accionables, el copyright es © 2026 y los perfiles sociales no se enlazan hasta su verificación. La validación estática no encontró errores, faltantes de clínicas ni CSS/JS en línea. Pendiente de aprobación antes de Fase 4.

### Fase 4 — Formulario de consulta bilingüe

- Añadir campos, atributos `name`, opciones y requisitos de validación exactamente como se especifican en `WEB_MVP.md`.
- Implementar validación en archivos JavaScript externos: fechas, teléfono, edades, pediatría, condicionales de seguro y paciente recurrente, consentimiento y contador de caracteres.
- Considerar válido un día hábil según la regla confirmada: excluir solo sábados y domingos, sin calendario de festivos.
- Mostrar la advertencia de disponibilidad Evening de acuerdo con los horarios documentados, sin prometer una cita.
- Traducir por completo etiquetas, errores, ayudas y confirmación; hacer accesibles los errores y estados del formulario.
- Simular el éxito localmente, sin `fetch`, persistencia en almacenamiento local ni transmisión a terceros.
- **Criterio de salida:** flujos válidos e inválidos comprobados en ambos idiomas, incluidos campos condicionales y ausencia de transmisión; solicitar aprobación.

**Estado:** completada. Se implementaron los formularios en inglés y español, con campos y nombres del MVP, seis clínicas, validación de campos/fechas/edades, reglas condicionales de seguro y paciente recurrente, contador, errores asociados y confirmación simulada local. Se comprobó sintaxis JS, referencias externas, presencia de campos requeridos en ambos idiomas, seis opciones de clínica, ausencia de CSS/JS en línea y ausencia de APIs de persistencia o transmisión. La fecha preferida cuenta días hábiles excluyendo solo fines de semana y permite seleccionar un sábado o domingo si ya transcurrió al menos un día hábil. La revisión visual y de lectores de pantalla en navegador real queda para la Fase 6. Pendiente de aprobación antes de Fase 5.

### Fase 5 — SEO, Schema.org y GEO

- Preparar títulos, descripciones, idioma del documento, enlaces canónicos/hreflang cuando se confirme el dominio definitivo, metadatos sociales y estructura de encabezados.
- Incluir JSON-LD `MedicalOrganization` y seis entidades `MedicalClinic` enlazadas con `parentOrganization`, usando solo los datos disponibles y exactos del brief.
- Favorecer GEO (Generative Engine Optimization) con contenido factual, claro, rastreable y consistente; respuestas directas sobre servicios, clínicas, idiomas y horarios, y datos estructurados coherentes con el contenido visible. No añadir afirmaciones, datos, sedes o políticas no aprobadas ni garantizar inclusión en respuestas generativas.
- Revisar los valores de `logo` y `sameAs` suministrados en el ejemplo de `WEB_MVP.md`: como la decisión actual solo aprueba un nombre textual y no confirma URLs gráficas o perfiles sociales, no publicar URLs como hechos hasta validarlas. Se podrá describir la marca como texto en el marcado o dejar sin esos valores no confirmados.
- Añadir `robots.txt`; añadir sitemap si el dominio y las rutas de despliegue están confirmados.
- **Criterio de salida:** marcado válido y fiel al contenido visible, metadatos bilingües y revisión de URLs/datos externos; solicitar aprobación.

**Estado:** completada. Se añadieron títulos/descripciones revisados, robots index/follow y metadatos Open Graph/Twitter en ambas landings. Se publicó JSON-LD `MedicalOrganization` con seis `MedicalClinic`, teléfonos y horarios cotejados con el MVP y referencias `parentOrganization`. Se validó el parseo JSON y los datos de las seis clínicas con un script local, además de `git diff --check` y ausencia de código/estilos en línea. Se omitieron URLs canónicas, `hreflang`, sitemap, logo, URL de organización y perfiles sociales al no estar confirmado el dominio ni esos recursos; completar cuando se confirmen antes de producción. La aprobación para iniciar Fase 6 fue otorgada y esa fase quedó completada.

### Fase 6 — Calidad, accesibilidad y revisión final

- Verificar visualización desde 320 px hasta escritorio, ausencia de desbordamiento y consistencia entre idiomas.
- Revisar navegación por teclado, foco visible, etiquetas, lector de pantalla, mensajes de error, estados y contraste con objetivo WCAG 2.2 AA.
- Probar manualmente las reglas de formulario, vínculos `tel:`/`mailto:`, SEO y JSON-LD. Corregir hallazgos antes de dar por terminado el hito.
- Confirmar el copy final relacionado con urgencias con la empresa, puesto que esa política está pendiente; no redactar una política nueva.
- **Criterio de salida:** checklist de aceptación completada, limitaciones y decisiones pendientes documentadas; solicitar aprobación final.

**Estado:** QA estático completado. Pasaron la sintaxis JavaScript, los enlaces y fragmentos locales, los IDs y referencias ARIA, los campos requeridos en ambos idiomas, los datos de las seis clínicas y su JSON-LD, y el escaneo de ausencia de persistencia/transmisión del formulario. Se ejercitaron el resumen/foco de errores, campos condicionales, fecha de fin de semana, elegibilidad pediátrica, formato de Patient ID y envío simulado con un DOM mínimo de prueba. Los pares de texto/estado comprobados superan contraste 4.5:1. Se revisaron breakpoints, foco y movimiento reducido en CSS. No había navegador ni lector de pantalla disponible: el aspecto real, el desbordamiento a 320 px y la interacción asistida no quedan certificados. El texto urgente coincide con el MVP, pero aún requiere confirmación de la empresa. No se encontraron defectos reproducibles que requieran cambios de código.

## 4. Requisitos que guían todas las fases

### Contenido y veracidad

- `WEB_MVP.md` es la fuente de verdad para servicios, nombres de clínicas, teléfonos, horarios, campos, opciones, mensajes y validaciones; las decisiones confirmadas en este plan actualizan los puntos expresamente aclarados.
- `WEB_DESIGN.md` guía la presentación visual, respuesta adaptable, accesibilidad y privacidad.
- No crear nombres de clínicas, direcciones, coordenadas, números, certificaciones, testimonios, perfiles sociales ni políticas médicas que no estén aprobados.
- Las clínicas del Reino Unido no se listarán en esta web pública según el alcance del MVP.

### Privacidad y formulario

- Describir el formulario como una **consulta** y explicar que recepción contactará a la persona para confirmar detalles.
- La descripción médica puede contener información sensible: no persistirla, registrarla en consola ni enviarla a servicios externos.
- Evitar integrar analítica, fuentes o herramientas externas que reciban datos introducidos en el formulario.
- La política de emergencias queda fuera de alcance hasta que la empresa la defina. Los textos de orientación urgente del MVP se revisarán en la fase de QA antes de publicarlos.

### Diseño y accesibilidad

- Aplicar la paleta y dirección de `WEB_DESIGN.md`, verificando contraste real en estados normales, foco, error, advertencia y éxito.
- Usar HTML semántico, etiquetas persistentes, mensajes asociados a sus controles, traducciones completas y controles táctiles cómodos.
- Respetar movimiento reducido y asegurar que toda interacción sea operable con teclado.

## 5. Dependencias y decisiones por confirmar antes de publicar

1. Confirmar el dominio de producción y, por tanto, los valores finales de URL canónica, `hreflang`, sitemap y `robots.txt`.
2. Validar si las URLs de perfiles sociales del ejemplo Schema.org corresponden a cuentas oficiales. No asumirlo.
3. Confirmar si existe un recurso de logo gráfico oficial. Hasta entonces, se usará solamente el texto HealthCore, sin inventar icono o símbolo ni declarar una imagen inexistente como logo.
4. La política de atención de emergencias y la confirmación del texto urgente de éxito siguen pendientes de decisión de la empresa. El copy actual reproduce el MVP y no establece una política nueva.
5. Confirmar los requisitos de despliegue/hosting cuando se conozca el entorno; esta fase no implica configurar o publicar en producción.

## 6. Próximo paso

Solicitar la aprobación final del hito. Antes de publicar, completar la revisión visual y con tecnologías de asistencia en un navegador compatible y confirmar con la empresa el texto urgente, además de resolver las dependencias de dominio, marca y hosting indicadas arriba.
