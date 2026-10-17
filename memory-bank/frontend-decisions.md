# Decisiones del frontend

## Dirección acordada

- El sitio público se desarrollará en `uis/website/` con Next.js; la aplicación interna corresponde a `uis/backoffice/`.
- Las APIs y los workers corresponden a `services/`.
- El código de aplicación usará TypeScript.
- Tailwind CSS se usará mediante clases utilitarias. No se usarán atributos `style`, bloques `<style>` ni estilos inline.
- Para decisiones visuales, consultar [`docs/WEB_DESIGN.md`](../docs/WEB_DESIGN.md); para requisitos y comportamiento, consultar [`docs/WEB_MVP.md`](../docs/WEB_MVP.md).

## Estado actual y alcance

Esta decisión describe el destino del frontend, no el estado actual del código. [`uis/website/`](../uis/website/README.md) sigue siendo un sitio estático; su migración a Next.js debe planificarse antes de reemplazar archivos. [`uis/talent-pipline-tracker/`](../uis/talent-pipline-tracker/README.md) es una aplicación Next.js independiente y no sustituye el sitio público ni el backoffice.

[`docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md) registra el hito previo del sitio estático. Antes de iniciar la migración, actualizar o crear un plan que aclare el alcance, las fases y cómo se preservará el sitio actual.
