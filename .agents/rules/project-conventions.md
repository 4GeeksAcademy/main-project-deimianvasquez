# Convenciones del proyecto

**Alcance: Siempre activa para cualquier archivo y tarea de este monorepo.**

- Mantén cada cambio en la carpeta que corresponde a su responsabilidad y consulta su README antes de editar.
- Inspecciona primero el código y la configuración existentes. No inventes stacks, comandos, APIs o infraestructura a partir de carpetas vacías, ejemplos o planes.
- No añadas dependencias, runners globales o abstracciones sin que el alcance lo requiera.
- Para una aplicación, utiliza sus scripts locales y sus instrucciones anidadas. Las verificaciones de una app no sustituyen las de otra.
- El sitio público pertenece a `uis/website/`, la aplicación interna a `uis/backoffice/` y las APIs/workers a `services/`. No crees árboles paralelos.
- Para frontend nuevo, usa Next.js y TypeScript. Usa Tailwind CSS mediante clases utilitarias; no añadas atributos `style`, bloques `<style>` ni estilos inline. Sigue [`docs/WEB_DESIGN.md`](../../docs/WEB_DESIGN.md).
- Cuando añadas una aplicación, servicio, agente o pipeline, documenta su propósito, stack real, configuración necesaria y cómo ejecutarlo/probarlo.
- Mantén sincronizados los documentos en inglés y español cuando modifiques guías bilingües.
- Conserva el estado existente del worktree. No descartes ni incorpores cambios ajenos al alcance.
- Antes de entregar, revisa el diff completo y reporta checks ejecutados, omitidos y sus motivos.
- No crees commits salvo petición explícita; si se solicitan, sigue el flujo de entrega de [`AGENTS.md`](../../AGENTS.md).
