# AGENTS.md

Eleventy 3.x (ESM, `type: module`) + Tailwind CSS 3.4 blog. Deployed to Cloudflare Pages via GitHub Actions on `main`.

Theme is the **opening crawl**: crawl yellow `#FFE81F` on near-black, dark only. There is no light mode, no theme toggle and no `dark:` variant — do not reintroduce one.

**Readability is a hard constraint, not a preference.** The previous amber-CRT theme measured a perfectly good 9.9:1 and still caused real eye strain, because the damage came from what was drawn *over* the text rather than from contrast. The rules, in priority order:

1. Never draw anything on top of running text — no scanlines, grille, grain or overlay. A repeating luminance grating at the spatial frequency of letter strokes is the single worst thing you can do to a reader.
2. No chromatic aberration on type.
3. No `text-shadow` on body copy. `.title-card` is the only exception and is deliberately faint.
4. Body copy stays proportional (Archivo) at 17px/1.7 — never monospace, never 15px.
5. `signal` (yellow) is for headings, wordmark and accents. Body copy is neutral `ink`.
6. Background is near-black, not `#000`; body text is `#E4E4E7`, not `#FFF`. Maximum contrast causes halation.

Check any new atmospheric effect against rule 1 before building it.

## Commands

- `npm run build` — CSS then Eleventy; outputs `_site/`. Always use this for verification (exits 0 = ok).
- `npm run build:css` — writes `src/styles/output.css`, which is **gitignored** but required for the site to render. Passthrough-copied by Eleventy.
- `npm run dev` — CSS build, then concurrent `watch:css` + `watch:11ty` on :8080.
- No lint, typecheck, or test scripts. `playwright` is a dependency but is not wired to a runner.

## Structure

- `src/` is Eleventy input, `_site/` output. Layouts `_layouts/`, partials `_includes/`, data `_data/`.
- Chrome is split: `head.njk` (meta + pre-paint script), `rail.njk` (fixed top nav), `statusline.njk` (fixed bottom bar), `overlays.njk` (title card / command palette / keymap), `footer.njk`. `base.njk` assembles them plus the `.starfield`.
- `_includes/macros.njk` holds `lsRow` (the shared post-listing row), `panelHead`, and `rule`. Import with `{% from "macros.njk" import lsRow, rule %}`.
- JS: single `src/assets/js/main.js` — all interactivity, vanilla, no dependencies.
- Styles: `src/styles/input.css` -> `src/styles/output.css` (generated).
- Content: `src/posts/YYYY-MM-DD-slug.md`; the date prefix is stripped by an `addPreprocessor` into `/{year}/{month}/{slug}/`. Defaults in `src/posts/posts.json`.
- Pages: `index.njk`, `posts.njk` (`/posts/` archive), `notes.njk` (`/notes/` microblog), `tags.njk`, `tags-tag.njk`, `about.njk`, `projects.njk`, `photography.njk`.
- Notes (microblog): `src/notes/*.md`, defaults in `src/notes/notes.json`. Separate Atom feed at `notes-feed.xml.njk`.

## Conventions & Quirks

**Colour.** Channel-triplet CSS variables at the top of `input.css`, mapped by Tailwind via `rgb(var(--x) / <alpha-value>)`. `signal` = crawl yellow (headings, wordmark, accents — *never* body copy). `blue` = links. The reading ramp is `ink-hi` → `ink` → `ink-dim` → `ink-faint` and is deliberately neutral. `ok`/`warn` are status only.

**Do not colour body text.** The single most common way to regress this theme is to reach for `text-signal` on a paragraph.

**Opacity modifiers must be on Tailwind's scale** (multiples of 5) or use bracket syntax. `bg-p/62` silently generates nothing; `bg-p/60` or `bg-p/[0.62]` work. This has bitten this repo before.

**Component classes go in `@layer components`.** `.btn`, `.btn-ghost`, `.chip`, `.kbd`, `.tag`, `.ls-row`, `.panel-hd`, `.panel-body` are layered so utilities still override them. An unlayered class that sets `display` will beat `hidden` and silently break responsive/toggle behaviour. `[hidden] { display: none !important }` exists in the base layer for the same reason — every overlay toggles via the `hidden` attribute.

**Atmosphere** is one fixed `.starfield` div behind the content: static radial-gradient tiles, no images, no JS, no motion. **`<body>` must not carry a background** — `html` supplies the base colour, and an opaque body background paints over the negative-z-index starfield and hides it entirely. This has already been fixed once. Anything animated must be neutralised under `prefers-reduced-motion`.

**Pre-paint script.** `head.njk` sets `.booted` on `<html>` before first paint and removes `.no-js`. The title-card decision belongs there, not in `main.js`, or it flashes.

**Navigation is data.** `src/_data/nav.json` feeds the rail, mobile drawer, footer, command palette and the `g`-prefix goto keys. Each page sets `section:` in front matter; the rail matches on it for the active state. Add nav items there, not inline.

**Command palette index** is inlined as `<script type="application/json" id="nav-index">` at the bottom of `overlays.njk`, built with the Nunjucks `dump` filter. Add new record types there and in `commandPalette()`.

**Tailwind content globs** include `./src/**/*.{html,njk,md,js}` and `./eleventy.config.js` (the code-block transform injects `.copy-btn` from there). Classes generated in JS must appear as literal strings in a scanned file.

**Notes are a second content stream, not a tag.** `src/notes/*.md` are `permalink: false` (page-less) and reach the reader only through `/notes/`, `/notes/feed.xml`, the homepage panel and the command palette. Do **not** give them `tags:` — it would pollute the topic index — and do **not** set `eleventyExcludeFromCollections`, which would hide them from `getFilteredByGlob` and empty the collection. Each note needs a **full timestamp** in `date:`; Eleventy derives dates from the `YYYY-MM-DD-` filename prefix and would otherwise floor every note to midnight.

**A note's `date` is fixed up in the `notes` collection, not in a preprocessor.** Eleventy resolves `page.date` during the data cascade, so mutating `data.date` from `addPreprocessor` is too late and silently does nothing — this was tried and does not work. The collection callback maps over items and recovers the time from a `YYYY-MM-DD-HHMMSS` filename when front matter has no `date:`. Without it, same-day notes all land on `00:00:00Z` and, because anchors derive from the timestamp, share a DOM id.

**Note anchors come from the timestamp, not the filename.** Eleventy strips the `YYYY-MM-DD-` prefix off `fileSlug`, so `2026-07-26-081500.md` yields `081500` — two notes on different days at the same second would collide. Use the `noteId` filter (`20260726-081500`).

**Nunjucks binds `|` looser than `+`.** `("/notes/#n-" + note.date | noteId)` pipes the *concatenated* string into the filter. Always parenthesise: `("/notes/#n-" + (note.date | noteId))`.

**Filters** in `eleventy.config.js`: `readableDate` (UTC-pinned — do not remove the `timeZone`, dates shift a day otherwise), `htmlDateString`, `utcTime`, `dateYear`, `readingTime`, `wordCount`, `charCount`, `excerpt`, `pad`, `noteId`, `limit`, `head`, `getByTag`, plus `isValidTagSlug` / `slugifySafe` / `getValidTagList` which exclude `posts`/`all`/`tags`.

**Images**: shortcodes `{% image %}` / `{% galleryImage %}` via `@11ty/eleventy-img`. Sources must exist at build time and `alt` is mandatory or the build throws.

## Gotchas

- `src/styles/output.css` must exist for anything to render; build order is CSS before Eleventy. Don't commit it.
- **`eleventy --serve` does not reliably re-copy `output.css` when Tailwind rewrites it out-of-band.** If a style change appears not to apply, you are probably looking at stale CSS — restart the server, or verify against a real `npm run build` + a static server over `_site/`. Do not chase a phantom CSS bug first.
- The repo currently has **zero posts and zero notes**. Empty states on `/`, `/posts/`, `/tags/` and `/notes/` are designed, not placeholders — keep them working. To verify rendering, add a throwaway `.md`, check it, then delete it.
- Notes are published from iOS via an Apple Shortcut hitting the GitHub Contents API (`docs/publishing-from-ios.md`). iMessage ingestion is **parked, not planned** (see README). Apple has no receive API; it needs an always-on Mac polling `~/Library/Messages/chat.db` with Full Disk Access. Don't promise it works.
- Full-page screenshots misrepresent this design — the fixed rail, status line and starfield only compose correctly in viewport-sized captures.
- CI: `.github/workflows/deploy.yml` — Node 24, `npm ci` → `npm run build` → `wrangler-action`, `directory: _site`. Needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`.
- No `CLAUDE.md` — this file is the sole agent instruction source.
