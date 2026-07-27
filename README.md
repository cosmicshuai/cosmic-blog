# COSMIC-OS

A personal blog built with [Eleventy](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/), deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## The theme

Dark only, styled after the opening crawl.

- **Crawl yellow** `#FFE81F` for headings, the wordmark and accents — never body copy.
- **Body text** is neutral near-white `#E4E4E7` at **15.8:1**, set in Archivo at 17px/1.7.
- **Links** use the "a long time ago…" blue `#75DDEE`.
- A **static starfield** sits behind the content, and a title card plays once
  per session on the first page you land on.

Type is [News Cycle](https://fonts.google.com/specimen/News+Cycle) (the News
Gothic analogue the crawl is set in) for display,
[Archivo](https://fonts.google.com/specimen/Archivo) for body copy, and
[IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for code.

### Readability rules

The previous theme simulated an amber CRT and was genuinely tiring to read. Its
body text measured 9.9:1 — nominally fine — so the problem was never contrast.
These rules are why, and they are load-bearing:

1. **Nothing is ever drawn on top of running text.** No scanlines, no grille, no
   grain. A repeating luminance grating at the spatial frequency of letter
   strokes is what makes eyes fight to focus. This was the worst offender.
2. **No chromatic aberration on type.** Simulating what the eye's lens works to
   correct means that effort never resolves.
3. **No `text-shadow` on body copy.** Glow softens letterform edges. The wordmark
   is the sole exception, and only faintly.
4. **Body copy is proportional**, not monospace, and 17px rather than 15px.
5. **Colour is for headings, not prose.** Long-form reading in saturated yellow
   is exactly what was tiring.
6. **Background is near-black, not `#000`; body text is `#E4E4E7`, not `#FFF`.**
   Maximum contrast causes halation; ~15:1 is the comfortable ceiling.

Before adding any atmospheric effect, check it against rule 1.

## Features

- ⚡ Static site generation with Eleventy 3.x
- 🌌 Static starfield and a once-per-session title card
- ⌨️ Command palette (<kbd>⌘K</kbd>), `g`-prefixed goto keys, `j`/`k` scrolling,
  <kbd>?</kbd> keymap — see the status bar
- 📝 `/notes/` microblog — a short-form stream with its own feed
- 🏷️ Tags, archive listing, and per-topic indexes rendered as `ls -la` output
- 📑 Auto-generated table of contents via `[[toc]]`
- 🖼️ Responsive WebP/JPEG images; gallery rests desaturated until focused
- 📅 Date-based URLs like `/2026/01/hello-world/`
- 📡 RSS feed
- ♿ Every effect respects `prefers-reduced-motion`; the page reads fine with
  JavaScript disabled

## Keyboard

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` / `/` | Command palette |
| `g` then `h p n t m r a` | Goto home / posts / notes / tags / photos / projects / about |
| `j` / `k` | Scroll down / up |
| `?` | Keymap |

## Quick Start

### 1. Clone and Install

```bash
cd blog
npm install
```

### 2. Development

```bash
# Start development server (includes Tailwind watch)
npm run dev

# Or run CSS and Eleventy separately
npm run watch:css    # Terminal 1: Watch Tailwind
npm run watch:11ty   # Terminal 2: Watch Eleventy
```

Site will be available at `http://localhost:8080`

### 3. Build

```bash
npm run build
```

Output will be in `_site/` directory.

## Writing Posts

### Create a New Post

1. Create a file in `src/posts/` with format: `YYYY-MM-DD-title.md`

```markdown
---
title: Your Post Title
date: 2024-03-15
description: Brief description for preview
tags:
  - tag1
  - tag2
---

[[toc]]

Your content here...
```

### Front Matter Options

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Post title |
| `date` | ✅ | Publish date (YYYY-MM-DD) |
| `description` | ❌ | Short description shown in list |
| `tags` | ❌ | Array of tags |

### Table of Contents

Add `[[toc]]` anywhere in your post to insert a table of contents. It will automatically link to H2, H3, and H4 headings.

### Images

Use the image shortcode for optimized images:

```nunjucks
{% image "./src/assets/images/photo.jpg", "Alt text", "100vw", "rounded-lg" %}
```

Images are automatically optimized to WebP/JPEG with multiple sizes.

### Code Highlighting

Use fenced code blocks with language:

<pre>
```javascript
function hello() {
  console.log("Hello, World!");
}
```
</pre>

## Notes (microblog)

`/notes/` is a separate, short-form stream — a `tail -f` of a log rather than an
archive. It has its own Atom feed at `/notes/feed.xml`, so subscribing to short
notes doesn't fill a reader with long-form and vice versa.

A note is one Markdown file in `src/notes/`:

```markdown
---
date: 2026-07-26T02:41:17Z
---

Finally read the Dune appendices. Worth it for the ecology alone.
```

That's the whole format. Notes:

- **`date` must be a full timestamp**, not just a day. Eleventy derives dates from
  the `YYYY-MM-DD-` filename prefix and would otherwise floor every note to
  midnight, collapsing the ordering within a day.
- Name files `YYYY-MM-DD-HHMMSS.md` by convention. The anchor id is derived from
  the *timestamp*, not the filename, so renaming a file won't break a permalink.
- Notes are `permalink: false` — they never get their own page. They render only
  inside `/notes/`, its feed, the homepage, and the command palette, and each one
  is addressable at `/notes/#n-20260726-024117`.
- Bare URLs auto-link (markdown-it `linkify`), so you can paste a link and stop.
- Notes deliberately do **not** appear in `/posts/`, the main feed, or the
  tag index. They're a separate stream.

Publish from your phone with an Apple Shortcut that commits straight to
`src/notes/` — setup in [docs/publishing-from-ios.md](docs/publishing-from-ios.md).
One tap, live in about 40 seconds, no server and no running Mac.

`date:` is optional. When it's absent the build recovers the full timestamp from
a `YYYY-MM-DD-HHMMSS` filename (read as UTC), so a file made by hand in the
GitHub web UI is safe too. Explicit front matter always wins.

### Publishing over iMessage (not implemented)

Apple exposes no API for receiving iMessages; the only genuine route is a Mac
that stays powered on running an agent with Full Disk Access that polls
`~/Library/Messages/chat.db`. The Shortcut above covers the same need without
depending on a machine being awake, so this is parked rather than planned.


## Project Structure

```
blog/
├── src/
│   ├── _data/
│   │   ├── site.json          # Title, url, author, contact
│   │   ├── nav.json           # Nav items + goto keys (single source of truth)
│   │   ├── projects.json      # Process table entries
│   │   └── photos.json        # Frame buffer entries
│   ├── _includes/
│   │   ├── head.njk           # Meta, fonts, pre-paint theme/boot script
│   │   ├── rail.njk           # Fixed top nav
│   │   ├── statusline.njk     # Fixed bottom status bar
│   │   ├── overlays.njk       # Boot screen, command palette, keymap
│   │   ├── macros.njk         # lsRow / panelHead / rule
│   │   └── footer.njk
│   ├── _layouts/
│   │   ├── base.njk           # Chrome + starfield
│   │   └── post.njk           # Post layout
│   ├── assets/js/main.js      # All interactivity, vanilla
│   ├── posts/                 # YYYY-MM-DD-*.md + posts.json defaults
│   ├── notes/                 # Note entries, permalink:false
│   ├── styles/input.css       # Tailwind entry + theme variables
│   ├── index.njk              # Homepage
│   ├── posts.njk              # /posts/ archive
│   ├── notes.njk              # /notes/ microblog
│   ├── notes-feed.xml.njk     # /notes/feed.xml
│   ├── tags.njk               # Topic index
│   ├── tags-tag.njk           # Per-topic pages
│   ├── about.njk              # whoami
│   ├── projects.njk           # Process table
│   └── photography.njk        # Frame buffer + lightbox
├── .github/workflows/deploy.yml
├── eleventy.config.js
├── tailwind.config.js
└── package.json
```

## Deployment to Cloudflare Pages

### 1. Create Cloudflare Pages Project

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect your GitHub repository
4. Choose "Direct upload" or "Connect to Git"

### 2. Set Up GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Your Pages project name
- `CLOUDFLARE_API_TOKEN` - API token with Pages:Edit permission

To create an API token:
1. Go to Cloudflare dashboard → My Profile → API Tokens
2. Create token with **Cloudflare Pages:Edit** permission

### 3. Configure Build Settings (if using Git integration)

If connecting directly in Cloudflare dashboard:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `_site` |
| Root directory | `blog` (if repo root is different) |

### 4. Deploy

Push to the `main` branch - GitHub Actions will automatically deploy to Cloudflare Pages!

```bash
git add .
git commit -m "Initial blog setup"
git push origin main
```

## Customization

### Site Config

Edit `src/_data/site.json`:

```json
{
  "title": "Your Blog Name",
  "description": "Your blog description",
  "url": "https://your-blog.pages.dev",
  "author": "Your Name",
  "role": "what you do",
  "email": "you@example.com",
  "github": "https://github.com/you"
}
```

### Navigation

`src/_data/nav.json` drives the top rail, the mobile drawer, the footer index,
the command palette and the `g`-prefix goto keys at once. Add an entry there and
every one of those updates. `section` must match the `section:` front matter of
the page it points at for the active state to light up.

### Colours & styling

The palette lives as channel-triplet CSS variables at the top of
`src/styles/input.css`. Change those and the whole site re-tints; nothing
hardcodes a colour. `tailwind.config.js` maps them to utility names so opacity
modifiers like `bg-signal/60` keep working.

| Token | Role |
|-------|------|
| `signal` | crawl yellow — headings, wordmark, accents. Never body copy. |
| `blue` | links and secondary accents |
| `ink` / `ink-hi` / `ink-dim` / `ink-faint` | the neutral reading ramp |
| `bg` / `bg-deep` / `surface` / `surface-2` | surfaces |
| `line` / `line-2` | hairlines |
| `ok` / `warn` | status only |

> **Note:** component classes such as `.btn` and `.kbd` are defined inside
> `@layer components` so utilities can still override them. Keep new ones there
> too, or a class like `hidden` will silently lose.

## License

MIT
