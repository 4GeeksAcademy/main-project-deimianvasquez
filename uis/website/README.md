# HealthCore public website

Static, bilingual website for the HealthCore public web MVP. The interface uses Tailwind CSS utility classes through its Play CDN; there is no build step or local npm runtime dependency. The CDN requires an internet connection.

## Current implementation phase

This directory contains the shared static-site foundation, bilingual landing pages, and bilingual patient inquiry form, including SEO metadata and organization/clinic structured data (phases 2–5). Static QA for phase 6 is complete; see the implementation plan for checks and limitations.

## Files

- `index.html` / `index.es.html`: English and Spanish landing-page shells.
- `application.html` / `application.es.html`: English and Spanish patient inquiry forms.
- Tailwind CSS is loaded from `https://cdn.tailwindcss.com` in each HTML page. Responsive styling is expressed with utility classes in the markup.
- `assets/js/navigation.js`: accessible mobile navigation behavior.
- `assets/js/application-form.js`: bilingual client-side validation and local-only success state. It does not store or transmit submitted data.

The landing pages include Open Graph/Twitter metadata and JSON-LD for HealthCore and its six U.S. clinics. Canonical URLs, `hreflang`, sitemap, logo URL, and social profile links are intentionally omitted until the production domain and official assets/accounts are confirmed.

## Quality review

Static checks passed for JavaScript syntax, local links and fragments, bilingual form fields, clinic data and JSON-LD, accessible error references, and absence of form persistence or network submission. Form scenarios were exercised with a minimal DOM test harness, and sampled text/state contrast ratios exceed 4.5:1. Browser rendering, 320px overflow, and screen-reader behavior were not verified because no browser or assistive-technology tooling was available. The urgent-assistance copy still needs company confirmation before publication.

## Run locally

From this directory, run `npx --yes serve .` and open the URL printed by the command (in Codespaces, forward the port and set its visibility as needed). Opening `index.html` directly also works when the CDN is reachable. The form validates locally and simulates success; it does not save or transmit patient information and does not confirm an appointment.

## Constraints

Keep executable JavaScript in external files and use Tailwind utility classes instead of custom stylesheets. Do not add inline `style` attributes, `<style>` blocks, or inline executable scripts beyond declarative JSON-LD. Keep translations complete as page content is added. The inquiry form is not a confirmed booking flow.
