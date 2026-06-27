# Marlon B. Siqueira — Personal Brand Site

A bilingual (EN / PT), single-page personal website built as a **cinematic, Prezi-style
zoom presentation** — one spatial canvas the camera flies and zooms through, stop by
stop, along a visible path. Navy-forward "executive presence" with a single gold accent.
100% static. No backend, no build step.

## Structure
```
index.html            ← the page (6 slides, all copy via data-i18n)
css/styles.css        ← design system + layout
js/fx.js              ← data-scape: circuit field, light pulses, KPI widgets,
                        Matrix rain, animated knowledge flowchart
js/i18n.js            ← EN/PT dictionary + language toggle
js/main.js            ← camera engine (zoom/pan/rotate), 3D globe, count-ups
assets/img/           ← YOUR images go here (see assets/img/README.md)
assets/fonts/         ← optional self-hosted fonts (see README there)
```

## Before you publish — add your images
Drop these into `assets/img/` (exact names):
- **profile.jpg** — hero portrait (square, ≥ 800 px). Appears automatically once added.
- **og-image.jpg** — social link preview (1200 × 630).
- **favicon.png** — browser tab icon (64 × 64).

And your **company logos** into `assets/img/logos/` (see the README there for the exact
filenames). Until each file exists, a tasteful placeholder shows in its place.

## What's on screen
- **Living data-scape background** — animated circuit traces with light pulses traveling
  the connections (data-exchange feel) and drifting KPI/dashboard widgets.
- **Impact** — the headline numbers sit over a soft "Matrix" glyph-rain (dimmed in the
  centre so the figures stay sharp).
- **Global Reach** — a bright blue-marble globe that keeps rotating, with **red markers**
  for countries lived/worked in (Brazil, Ireland, Italy, Portugal) and **green markers**
  for countries visited (USA, France, Spain, UK), each with a pulsing halo.
- **Experience** — six roles, each with a **logo slot** you fill from `assets/img/logos/`.
- **Education** — academic icons (cap, books, diploma…) float gently behind the content.
- **Knowledge** — an animated flowchart with light pulses flowing toward the three
  emphasis nodes: **Continuous Improvement**, **SAP S/4HANA**, **Intelligent Automation**.
- A centered, HUD-style **console** (bottom) drives navigation + the EN/PT toggle.

## Navigation
The site opens on an overview of the whole "constellation", then flies into the intro.
Move between stops with the centered **console** (Back / Next), **arrow keys**,
**mouse wheel**, **swipe**, or the **path-rail dots** on the right. The EN | PT toggle
lives in the console — it translates everything instantly, remembers your choice, and
respects browser language on first visit.

## How to deploy on GitHub Pages
1. Create a repository (e.g. `my-journey`) and upload **all** these files, keeping the
   folder structure (`index.html` must sit at the repository root).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/ (root)**, then **Save**.
5. Wait ~1 minute. Your site is live at
   `https://<your-username>.github.io/<repository-name>/`.

No build step is required — GitHub Pages serves these files as-is.

## Libraries (loaded from CDN — nothing to install)
- globe.gl 2.32 — interactive 3D globe (slide "Reach")

The camera, transitions and count-ups are hand-written vanilla JS — no framework.

## Accessibility & performance
Semantic HTML, ARIA labels, keyboard navigation, visible focus, WCAG-AA contrast,
and full `prefers-reduced-motion` fallbacks (animations degrade gracefully; the globe
stops auto-rotating).
