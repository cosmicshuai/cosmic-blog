# COSMIC-OS

A personal blog built with [Eleventy](https://www.11ty.dev/) and [Tailwind CSS](https://tailwindcss.com/), deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## The theme

The site is dressed as an amber-phosphor workstation. It has two display modes,
both fully designed, toggled from the status bar or with <kbd>t</kbd>:

- **CRT** (dark) — P3 amber on warm black, with scanlines, aperture-grille
  striping, tube vignette, mains flicker and a drifting vertical-hold roll bar.
- **PRINTOUT** (light) — warm fanfold paper with burnt-amber ink and green-bar
  ruling. No glow; paper doesn't emit.

The palette is deliberately monochrome — one hue across a five-step intensity
ramp — with only `ok` (green) and `warn` (red) escaping it. Even syntax
highlighting is monochrome, separating tokens by intensity and weight.

Type is [VT323](https://fonts.google.com/specimen/VT323) for display,
[IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for body copy,
and [Silkscreen](https://fonts.google.com/specimen/Silkscreen) for bitmap labels.

## Features

- ⚡ Static site generation with Eleventy 3.x
- 🖥️ Two display modes (CRT / printout) with all screen effects toggleable
- ⌨️ Command palette (<kbd>⌘K</kbd>), `g`-prefixed goto keys, `j`/`k` scrolling,
  <kbd>?</kbd> keymap — see the status bar
- 🔌 Power-on self test on the first page of a session
- 🏷️ Tags, archive listing, and per-topic indexes rendered as `ls -la` output
- 📑 Auto-generated table of contents via `[[toc]]`
- 🖼️ Responsive WebP/JPEG images; gallery renders amber duotone until focused
- 📅 Date-based URLs like `/2026/01/hello-world/`
- 📡 RSS feed
- ♿ Every effect respects `prefers-reduced-motion`; the page reads fine with
  JavaScript disabled

## Keyboard

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` / `/` | Command palette |
| `g` then `h p t m r a` | Goto home / posts / tags / photos / projects / about |
| `j` / `k` | Scroll down / up |
| `t` | Switch CRT ⇄ printout |
| `f` | Toggle screen effects |
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
│   │   ├── base.njk           # Chrome + CRT overlay stack
│   │   └── post.njk           # Post layout
│   ├── assets/js/main.js      # All interactivity, vanilla
│   ├── posts/                 # YYYY-MM-DD-*.md + posts.json defaults
│   ├── styles/input.css       # Tailwind entry + theme variables
│   ├── index.njk              # Homepage
│   ├── posts.njk              # /posts/ archive
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
`src/styles/input.css` — `:root` is printout mode, `.dark` is CRT. Change those
twelve values and the whole site re-tints; nothing hardcodes a colour.
`tailwind.config.js` just maps them to utility names (`text-p`, `bg-surface`,
`border-line-2`, …) so opacity modifiers like `bg-p/60` keep working.

Screen effects are driven by `--scan-alpha`, `--grille-alpha`,
`--vignette-alpha`, `--aberr` and `--bloom`. The `html.fx-off` block shows how
to dial them all down at once.

> **Note:** component classes such as `.btn` and `.kbd` are defined inside
> `@layer components` so utilities can still override them. Keep new ones there
> too, or a class like `hidden` will silently lose.

## License

MIT
