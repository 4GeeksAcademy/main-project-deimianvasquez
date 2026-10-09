# Especificación de diseño — Sitio público de HealthCore

**Hito:** 1 — Sitio web público  
**Documento funcional de referencia:** [WEB_MVP.md](./WEB_MVP.md)  
**Estado:** Dirección visual propuesta para implementar y validar

> Este documento define cómo debe verse y sentirse el sitio. `WEB_MVP.md` sigue siendo la fuente de verdad para contenido, campos, nombres, ubicaciones, validaciones y comportamiento. Si existe una diferencia entre ambos documentos, prevalece `WEB_MVP.md` para los requisitos funcionales y de contenido.

---

## 1. Objetivo de diseño

Crear una experiencia digital pública que transmita **confianza clínica, claridad y cercanía** desde la primera visita. El diseño debe ayudar a pacientes nuevos a entender los servicios y encontrar una clínica, y facilitar que completen una consulta sin hacerles pensar que están reservando una cita confirmada.

La experiencia debe ser bilingüe en inglés y español, accesible, rápida y consistente en móvil y escritorio. Evitar una estética fría de hospital, una apariencia corporativa genérica o recursos que sugieran resultados médicos garantizados.

### Principios

1. **Confianza sin exageraciones:** diseño ordenado, información verificable y llamadas a la acción claras; no añadir afirmaciones clínicas, certificaciones o testimonios que no aparezcan en el contenido aprobado.
2. **Accesible y humano:** lenguaje sencillo, controles cómodos y tono amable. No depender solo del color para comunicar estados.
3. **Bilingüe de verdad:** inglés y español reciben el mismo nivel de cuidado visual; permitir que el contenido en español se expanda sin romper componentes.
4. **Mobile-first:** reservar una consulta, llamar a una clínica y cambiar de idioma deben ser acciones fáciles desde un teléfono.
5. **Privacidad por defecto:** no mostrar datos de pacientes en la interfaz ni registrar o transmitir el formulario en esta etapa; su envío es simulado según `WEB_MVP.md`.

---

## 2. Dirección visual y marca

### Personalidad

- Profesional y serena.
- Accesible, no intimidante.
- Moderna y eficiente, sin parecer una aplicación tecnológica experimental.
- Multicultural e inclusiva, sin estereotipos visuales.

### Recursos gráficos

- Usar formas suaves, radios moderados y espacios amplios para que el sitio se sienta acogedor, pero mantener contraste y jerarquía propios de un servicio de salud.
- Preferir fotografía auténtica y natural de interacción entre pacientes y profesionales en un entorno ambulatorio, diversa en edad y apariencia. Las imágenes deben ser autorizadas, no mostrar información identificable de pacientes y tener texto alternativo descriptivo cuando aporten contenido.
- Si no se dispone de fotografías aprobadas, usar ilustraciones abstractas o formas gráficas sencillas. No usar imágenes de stock que sugieran procedimientos o resultados que HealthCore no haya especificado.
- Los iconos deben pertenecer a un solo estilo (línea simple, grosor consistente), tener etiqueta textual cuando su significado no sea obvio y no reemplazar información esencial.
- No inventar un símbolo o logotipo oficial. Hasta disponer de recursos de marca aprobados, representar la marca con el nombre **HealthCore** en una tipografía legible y un detalle geométrico sencillo.

---

## 3. Paleta de colores propuesta

Paleta orientada a una marca sanitaria: azul profundo para seguridad y legibilidad, teal para acción y cuidado, y fondos cálidos para evitar una sensación hospitalaria demasiado fría. Los valores son tokens iniciales; mantener contraste WCAG 2.2 AA en los pares de texto y controles antes de cerrar la implementación.

| Token            | Color         | Hex       | Uso recomendado                                                                   |
| ---------------- | ------------- | --------- | --------------------------------------------------------------------------------- |
| `brand-900`      | Azul noche    | `#123047` | Encabezados oscuros, footer, texto de alto énfasis sobre fondo claro              |
| `brand-800`      | Azul petróleo | `#174A5B` | Elementos de marca, enlaces y encabezados secundarios                             |
| `primary-700`    | Teal profundo | `#087E78` | Botón primario, enlaces y controles activos; comprobar contraste con texto blanco |
| `primary-800`    | Teal oscuro   | `#06645F` | Hover/pressed del botón primario y estados de foco de marca                       |
| `primary-100`    | Menta pálido  | `#DDF3EF` | Fondos de acento, iconos y bloques informativos                                   |
| `surface`        | Blanco cálido | `#FFFFFF` | Tarjetas, formulario y superficie principal                                       |
| `surface-muted`  | Marfil suave  | `#F5F8F7` | Fondos alternos de sección y página                                               |
| `text-primary`   | Tinta         | `#18323D` | Texto principal y etiquetas                                                       |
| `text-secondary` | Gris azulado  | `#526771` | Texto auxiliar; validar contraste para texto pequeño                              |
| `border`         | Gris claro    | `#D7E2E1` | Bordes y separadores                                                              |
| `success`        | Verde oscuro  | `#246B45` | Confirmaciones, siempre acompañado de icono/texto                                 |
| `warning`        | Ámbar oscuro  | `#815500` | Advertencias de disponibilidad, acompañado de texto/icono                         |
| `error`          | Rojo profundo | `#B42332` | Errores de formulario, acompañado de mensaje explícito                            |

### Reglas de uso

- Fondo principal blanco o `surface-muted`; reservar los fondos teal oscuros para CTA, bandas puntuales o el footer.
- El botón primario usa `primary-700` con texto blanco y estado hover `primary-800`. Si el contraste calculado no alcanza 4.5:1, usar `primary-800` como color por defecto.
- Evitar texto blanco pequeño sobre menta, colores de estado como único indicador y combinaciones de bajo contraste.
- Enlace: color de marca y subrayado visible en texto corrido. No distinguir enlaces solo por color.
- Usar el rojo únicamente para errores y el ámbar para avisos no bloqueantes, como una franja horaria con disponibilidad limitada.

---

## 4. Tipografía

### Familias

- **Títulos:** `DM Sans`, pesos 600–700. Da una presencia moderna y amable sin sacrificar claridad.
- **Texto, navegación y formularios:** `Inter`, pesos 400–600. Está optimizada para interfaces y mantiene buena legibilidad en tamaños pequeños.
- **Alternativas del sistema:** `Arial`, `Helvetica`, sans-serif. Declarar la pila de fuentes para que el diseño siga siendo legible si las fuentes web no cargan.

Ejemplo de pilas:

```css
font-family: "DM Sans", "Arial", sans-serif; /* headings */
font-family: "Inter", "Helvetica", Arial, sans-serif; /* body/UI */
```

Cargar fuentes con pocos pesos y `font-display: swap`. Si el proyecto permite autoalojarlas, preferirlo para reducir solicitudes a terceros; si se usan desde un proveedor externo, evitar cargar datos de formularios en esos servicios.

### Escala recomendada

| Estilo           | Escritorio | Móvil    | Peso / interlineado                                                 |
| ---------------- | ---------- | -------- | ------------------------------------------------------------------- |
| H1               | 48–60 px   | 38–44 px | 700 / 1.05–1.15                                                     |
| H2               | 36–44 px   | 30–36 px | 650–700 / 1.15                                                      |
| H3               | 22–28 px   | 20–24 px | 600–700 / 1.25                                                      |
| Texto destacado  | 18–20 px   | 18 px    | 400–500 / 1.55–1.7                                                  |
| Texto base       | 16–18 px   | 16 px    | 400 / 1.5–1.65                                                      |
| Etiqueta / ayuda | 14–16 px   | 14–16 px | 500 / 1.4–1.5; nunca usar tamaño diminuto para información esencial |

La escala debe adaptarse al largo de las traducciones. Evitar alturas fijas en títulos y tarjetas que puedan cortar texto en español o inglés.

---

## 5. Sistema de layout y componentes

### Layout

- Contenedor centrado con ancho máximo aproximado de **1,200 px**, y márgenes fluidos de 20–24 px en móvil y 32–48 px en escritorio.
- Espaciado basado en múltiplos de 4 u 8 px; secciones amplias con 72–104 px verticales en escritorio y 48–72 px en móvil.
- Grid de 12 columnas en escritorio cuando sea útil; tarjetas de servicios en 3 columnas y ventajas en 2 columnas según `WEB_MVP.md`.
- Bordes de tarjetas de 1 px y radio de 12–16 px; sombras suaves solo para separar niveles, no como decoración general.
- Objetivos táctiles de al menos 44 × 44 px.

### Botones y enlaces

- Botón primario sólido teal para la acción principal, con texto específico como “Solicitar una cita” según el idioma.
- Botón secundario con borde teal o azul, fondo transparente y estado hover evidente.
- Estados requeridos: normal, hover, focus-visible, active y disabled. El estado focus debe tener un anillo de foco de alto contraste, no solo un cambio sutil de color.
- No usar “Reservar ahora” ni lenguaje que implique una cita confirmada: el formulario es una **consulta** y el equipo de recepción debe confirmar los detalles.

### Tarjetas

- **Servicio:** título prominente, icono decorativo opcional, descripción en lista corta. Mantener alturas flexibles.
- **Ubicación:** nombre, ciudad/estado, teléfono como enlace `tel:` y horario. Asegurar lectura fácil en pantallas pequeñas; en móvil se prefieren tarjetas a una tabla horizontal.
- **Ventaja:** frase breve con icono o indicador visual más texto completo.

### Formularios

- Una columna en móvil; en pantallas amplias agrupar datos personales relacionados en dos columnas si las etiquetas y errores siguen claros.
- Etiquetas visibles persistentes sobre cada control; no usar placeholder como única etiqueta.
- Usar grupos (`fieldset`/`legend`) para radios y secciones relacionadas. Indicar campos requeridos de manera coherente y accesible.
- Controles con borde neutral, altura cómoda, padding adecuado y foco claramente visible. Mantener errores junto al campo correspondiente y asociarlos con `aria-describedby`.
- Campos condicionales de seguro y Patient ID aparecen en el flujo sin desplazar el foco inesperadamente. Al ocultarlos, no deben conservar validación requerida.
- La confirmación de envío simulado debe sustituir o preceder al formulario con un encabezado claro y foco anunciado; no debe hacer creer que la cita está confirmada.

---

## 6. Composición de páginas

### Landing page

1. **Barra de navegación:** nombre HealthCore a la izquierda, enlaces de ancla a Inicio/Servicios/Ubicaciones/Contacto y selector EN/ES. En móvil, navegación compacta accesible y selector de idioma siempre fácil de encontrar.
2. **Hero:** titular de alto impacto, subtítulo con ancho legible y CTA principal destacado. Puede acompañarse de una imagen o gráfico aprobado, evitando que el arte compita con el contenido. Mostrar con claridad que HealthCore es una red ambulatoria.
3. **Servicios:** tres tarjetas iguales en escritorio, apiladas en móvil; títulos y bullets deben mantener el texto exacto definido por `WEB_MVP.md` en ambos idiomas.
4. **Por qué HealthCore:** cuatro ventajas en dos columnas o una cuadrícula equilibrada, con buena separación entre texto e icono.
5. **Ubicaciones:** seis ubicaciones de EE. UU. en tarjetas o tabla. En móvil, tarjetas apiladas; en escritorio, cuadrícula de 2–3 columnas. Teléfonos clicables. No listar ubicaciones británicas como clínicas de esta página, aunque el contexto general mencione operaciones en Reino Unido.
6. **Contacto:** presentar correo y teléfonos con enlaces accionables (`mailto:` / `tel:`) y jerarquía clara.
7. **Footer:** copyright indicado en `WEB_MVP.md` y enlaces sociales indicados allí. No inventar otras cuentas o páginas.

### Formulario de consulta

- Presentarlo como una página independiente y coherente con la landing, con encabezado de marca, navegación simple y enlace para volver.
- Antes de los campos, explicar brevemente que el equipo de recepción se pondrá en contacto para confirmar los detalles; no sugerir que se trata de una reserva confirmada.
- Dividir visualmente el formulario en grupos legibles: información personal, preferencia de atención, seguro y consulta/consentimiento. No cambiar el orden de requisitos sin comprobar primero el flujo con `WEB_MVP.md`.
- Mantener la nota de partnerships visible pero secundaria al objetivo principal del paciente.
- En el éxito, mostrar el mensaje exacto especificado en `WEB_MVP.md`, incluyendo la instrucción sobre asistencia urgente.

---

## 7. Responsive y comportamiento

Puntos de referencia sugeridos (ajustables al contenido):

- **Móvil:** hasta 767 px; una columna, navegación móvil, tarjetas apiladas y controles de ancho completo.
- **Tablet:** 768–1023 px; grids de dos columnas donde el espacio lo permita.
- **Escritorio:** desde 1024 px; composición completa de hero, grids y navegación horizontal.

Reglas:

- Evitar scroll horizontal a 320 px de ancho, incluyendo tablas, selectores y textos largos.
- La navegación móvil debe abrir/cerrar con teclado y lector de pantalla; comunicar el estado con `aria-expanded` y permitir Escape para cerrar.
- Mantener el CTA visible y fácil de alcanzar, pero sin tapar contenido ni controles.
- El cambio de idioma conserva la página correspondiente (landing o formulario) y no debe perder los datos que el usuario aún no ha enviado cuando la implementación lo permita.
- Respetar `prefers-reduced-motion`; usar transiciones breves y prescindibles, sin animaciones que retrasen el acceso al contenido.

---

## 8. Accesibilidad, confianza y privacidad

- Objetivo: **WCAG 2.2 AA** para contraste, teclado, estructura semántica, etiquetas y estados.
- Usar landmarks, orden lógico de encabezados, enlace para saltar al contenido y nombre accesible para controles e iconos.
- El idioma activo debe reflejarse con `lang="en"` o `lang="es"`; el selector debe anunciar cuál está seleccionado.
- Todos los elementos interactivos deben ser operables por teclado y mostrar `:focus-visible`.
- Errores claros, específicos y asociados al campo; al enviar con errores, anunciar el resumen y mover el foco de forma apropiada al primer problema o resumen.
- No comunicar estado exclusivamente mediante color; incluir texto y, cuando ayude, icono.
- Imágenes informativas con texto alternativo útil; imágenes decorativas con `alt=""`.
- No solicitar ni mostrar información de salud no contemplada en `WEB_MVP.md`. Como la descripción de consulta puede incluir información sensible, no persistirla en almacenamiento local ni enviarla a un servidor/servicio externo en este hito; el envío es simulado.
- Mantener la nota de que el formulario es para pacientes y separar visualmente la vía de contacto para asociaciones.

---

## 9. Criterios visuales de aceptación

- [ ] La landing y el formulario comparten paleta, tipografía, espaciado, botones y estilo de controles.
- [ ] El aspecto transmite confianza y cercanía, sin afirmar certificaciones o beneficios médicos no aprobados.
- [ ] Cada vista tiene jerarquía visual clara y todas las secciones requeridas de `WEB_MVP.md` caben sin truncar contenido.
- [ ] Las versiones española e inglesa tienen el mismo nivel de calidad; textos largos no desbordan ni cortan tarjetas o botones.
- [ ] Los diseños funcionan a 320 px, en tablet y escritorio, sin scroll horizontal accidental.
- [ ] Contraste de texto normal de al menos 4.5:1 y texto grande de al menos 3:1; controles y foco también son distinguibles.
- [ ] Navegación, selector de idioma, formulario y mensajes se pueden usar con teclado y lector de pantalla.
- [ ] El foco es visible; hover, error, éxito, advertencia y disabled son estados diferenciables y accesibles.
- [ ] Los teléfonos y correos son accionables desde dispositivos compatibles.
- [ ] El formulario se percibe como consulta y deja claro que recepción confirma la cita; no parece una reserva automática.
- [ ] El envío de prueba no guarda ni transmite información del paciente.

---

## 10. Decisiones para revisar antes de cerrar

- Confirmar que los colores propuestos superan pruebas de contraste con las combinaciones reales de texto y botones.
- Confirmar disponibilidad/licencia de fotografía, logotipo y fuentes antes de incorporarlos.
- Validar la apariencia en español e inglés con textos reales del proyecto en anchuras pequeñas.
- No convertir esta guía en una fuente alternativa de contenido: cambios de servicios, ubicaciones, horarios o datos de contacto deben acordarse en `WEB_MVP.md`.
