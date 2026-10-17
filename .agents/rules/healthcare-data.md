# Datos sanitarios y de personal

**Alcance: Aplicar cuando una tarea toque datos, prompts, logs, pruebas, flujos o integraciones relacionados con pacientes, salud, empleados o credenciales.**

Estas son salvaguardas de ingeniería para este proyecto, no una interpretación legal ni una certificación de cumplimiento. Consulta a las personas responsables de privacidad y cumplimiento antes de procesar datos reales.

- Trata datos identificables de pacientes, información clínica, credenciales y datos laborales como sensibles. Minimiza su uso y limita el acceso al propósito autorizado.
- Usa datos sintéticos en desarrollo, ejemplos, demostraciones, prompts, fixtures y pruebas.
- No incluyas datos reales ni secretos en logs, mensajes de error, repositorios, capturas, datasets de evaluación o servicios externos.
- No persistas ni transmitas información médica introducida en el formulario del sitio público; el alcance documentado del sitio es una simulación local.
- Para el agente de onboarding propuesto, no almacenes copias de documentos de identidad o credenciales en una memoria compartida. No apruebes credenciales ni habilitación laboral; deriva esas decisiones a revisión humana.
- No inventes políticas clínicas, laborales o de privacidad. Si una política autorizada no está disponible o no cubre la pregunta, indícalo y deriva el caso al responsable adecuado.
- No asumas que los requisitos de HIPAA y UK GDPR son intercambiables. El país, propósito y acceso autorizado deben quedar claros antes de diseñar procesamiento o almacenamiento.
- Antes de proponer persistencia, integración externa o uso de datos reales, exige decisiones documentadas sobre campos mínimos, identidad, permisos, residencia, auditoría, retención y borrado.
