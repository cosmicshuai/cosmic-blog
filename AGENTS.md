# AGENTS.md

Eleventy 3.x (ESM, `type: module`) + Tailwind CSS 3.4 blog. Deployed to Cloudflare Pages via GitHub Actions on `main`.

Theme is **COSMIC-OS**: a monochrome amber-phosphor workstation. `.dark` = CRT (amber on warm black, scanlines/vignette/flicker); `:root` = PRINTOUT (warm fanfold paper, burnt-amber ink). Both are first-class — never ship a change that only works in one.

## Commands

- `npm run build` — CSS then Eleventy; outputs `_site/`. Always use this for verification (exits 0 = ok).
- `npm run build:css` — writes `src/styles/output.css`, which is **gitignored** but required for the site to render. Passthrough-copied by Eleventy.
- `npm run dev` — CSS build, then concurrent `watch:css` + `watch:11ty` on :8080.
- No lint, typecheck, or test scripts. `playwright` is a dependency but is not wired to a runner.

## Structure

- `src/` is Eleventy input, `_site/` output. Layouts `_layouts/`, partials `_includes/`, data `_data/`.
- Chrome is split: `head.njk` (meta + pre-paint script), `rail.njk` (fixed top nav), `statusline.njk` (fixed bottom bar), `overlays.njk` (boot / command palette / keymap), `footer.njk`. `base.njk` assembles them plus the `.crt` overlay stack.
- `_includes/macros.njk` holds `lsRow` (the shared post-listing row), `panelHead`, and `rule`. Import with `{% from "macros.njk" import lsRow, rule %}`.
- JS: single `src/assets/js/main.js` — all interactivity, vanilla, no dependencies.
- Styles: `src/styles/input.css` -> `src/styles/output.css` (generated).
- Content: `src/posts/YYYY-MM-DD-slug.md`; the date prefix is stripped by an `addPreprocessor` into `/{year}/{month}/{slug}/`. Defaults in `src/posts/posts.json`.
- Pages: `index.njk`, `posts.njk` (`/posts/` archive), `tags.njk`, `tags-tag.njk`, `about.njk`, `projects.njk`, `photography.njk`.

## Conventions & Quirks

**Colour.** The palette is twelve channel-triplet CSS variables (`--c-p`, `--c-bg`, `--c-line`, …) declared twice at the top of `input.css`: `:root` for printout, `.dark` for CRT. Tailwind maps them via `rgb(var(--x) / <alpha-value>)` to names like `text-p`, `bg-surface`, `border-line-2`. **Because the variables swap, you almost never need a `dark:` variant** — write `bg-surface`, not `bg-white dark:bg-black`. Reach for `.dark`-prefixed CSS only for things that differ structurally (scanlines, fanfold ruling).

**The phosphor ramp** runs `p-hi` → `p` → `p-body` → `p-dim` → `p-faint`. Stay inside it. `ok` and `warn` are the only non-amber colours and are reserved for status; syntax highlighting is deliberately monochrome.

**Opacity modifiers must be on Tailwind's scale** (multiples of 5) or use bracket syntax. `bg-p/62` silently generates nothing; `bg-p/60` or `bg-p/[0.62]` work. This has bitten this repo before.

**Component classes go in `@layer components`.** `.btn`, `.btn-ghost`, `.chip`, `.kbd`, `.tag`, `.ls-row`, `.panel-hd`, `.panel-body` are layered so utilities still override them. An unlayered class that sets `display` will beat `hidden` and silently break responsive/toggle behaviour. `[hidden] { display: none !important }` exists in the base layer for the same reason — every overlay toggles via the `hidden` attribute.

**Effects budget.** `--scan-alpha`, `--grille-alpha`, `--vignette-alpha`, `--aberr`, `--bloom` drive every screen effect; `html.fx-off` dials them down (status-bar `FX` toggle, `f` key, persisted in `localStorage`). Anything animated must also be neutralised under `prefers-reduced-motion`.

**Pre-paint script.** `head.njk` sets `.dark`, `.fx-off` and `.booted` on `<html>` before first paint, and removes `.no-js`. Theme/effects/boot decisions belong there, not in `main.js`, or they flash.

**Navigation is data.** `src/_data/nav.json` feeds the rail, mobile drawer, footer, command palette and the `g`-prefix goto keys. Each page sets `section:` in front matter; the rail matches on it for the active state. Add nav items there, not inline.

**Command palette index** is inlined as `<script type="application/json" id="nav-index">` at the bottom of `overlays.njk`, built with the Nunjucks `dump` filter. Add new record types there and in `commandPalette()`.

**Tailwind content globs** include `./src/**/*.{html,njk,md,js}` and `./eleventy.config.js` (the code-block transform injects `.copy-btn` from there). Classes generated in JS must appear as literal strings in a scanned file.

**Filters** in `eleventy.config.js`: `readableDate` (UTC-pinned — do not remove the `timeZone`, dates shift a day otherwise), `htmlDateString`, `dateYear`, `readingTime`, `wordCount`, `limit`, `head`, `getByTag`, plus `isValidTagSlug` / `slugifySafe` / `getValidTagList` which exclude `posts`/`all`/`tags`.

**Images**: shortcodes `{% image %}` / `{% galleryImage %}` via `@11ty/eleventy-img`. Sources must exist at build time and `alt` is mandatory or the build throws.

## Gotchas

- `src/styles/output.css` must exist for anything to render; build order is CSS before Eleventy. Don't commit it.
- **`eleventy --serve` does not reliably re-copy `output.css` when Tailwind rewrites it out-of-band.** If a style change appears not to apply, you are probably looking at stale CSS — restart the server, or verify against a real `npm run build` + a static server over `_site/`. Do not chase a phantom CSS bug first.
- The repo currently has **zero posts**. Empty states on `/`, `/posts/` and `/tags/` are designed, not placeholders — keep them working. To verify post rendering, add a throwaway `.md`, check it, then delete it.
- The `.crt` overlay is `z-9998` and `pointer-events: none`; modals sit at `z-9999` and intentionally render *under* it so they get the same screen treatment.
- Full-page screenshots misrepresent this design — the fixed rail, status line and CRT layers only compose correctly in viewport-sized captures.
- CI: `.github/workflows/deploy.yml` — Node 24, `npm ci` → `npm run build` → `wrangler-action`, `directory: _site`. Needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`.
- No `CLAUDE.md` — this file is the sole agent instruction source.
