import typography from '@tailwindcss/typography';

/** Channel-triplet CSS vars so Tailwind opacity modifiers (`text-signal/40`) work. */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  // Dark only. There is no light counterpart and no `dark:` variant in use.
  content: [
    './src/**/*.{html,njk,md,js}',
    './eleventy.config.js', // the code-block transform injects .copy-btn
    '!./node_modules/**',
  ],
  theme: {
    extend: {
      colors: {
        bg: v('--c-bg'),
        'bg-deep': v('--c-bg-deep'),
        surface: v('--c-surface'),
        'surface-2': v('--c-surface-2'),
        line: v('--c-line'),
        'line-2': v('--c-line-2'),

        // Crawl yellow. Headings, wordmark, active state — never body copy.
        signal: v('--c-signal'),
        // "A long time ago…" blue. Links and secondary accents.
        blue: v('--c-blue'),

        // Reading ramp. Neutral by design: body text is never coloured.
        'ink-hi': v('--c-ink-hi'),
        ink: v('--c-ink'),
        'ink-dim': v('--c-ink-dim'),
        'ink-faint': v('--c-ink-faint'),

        ok: v('--c-ok'),
        warn: v('--c-warn'),
      },
      fontFamily: {
        // News Cycle is the News Gothic analogue the crawl is set in.
        display: ['"News Cycle"', 'Archivo', 'system-ui', 'sans-serif'],
        // Archivo carries body copy — proportional, high legibility at 17px.
        sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.28em',
        crawl: '0.06em',
      },
      maxWidth: {
        screenframe: '78rem',
        measure: '68ch',
      },
      boxShadow: {
        signal: '0 0 24px -6px rgb(var(--c-signal) / 0.45)',
        'signal-lg': '0 0 70px -14px rgb(var(--c-signal) / 0.4)',
        panel: '0 18px 50px -24px rgb(0 0 0 / 0.9)',
      },
      animation: {
        blink: 'blink 1.05s step-end infinite',
        sweep: 'sweep 2.4s ease-in-out infinite',
        'bar-pulse': 'barPulse 1.6s ease-in-out infinite',
        'fade-up': 'fadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        sweep: {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        barPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      typography: () => ({
        crawl: {
          css: {
            '--tw-prose-body': 'rgb(var(--c-ink))',
            '--tw-prose-headings': 'rgb(var(--c-signal))',
            '--tw-prose-lead': 'rgb(var(--c-ink-dim))',
            '--tw-prose-links': 'rgb(var(--c-blue))',
            '--tw-prose-bold': 'rgb(var(--c-ink-hi))',
            '--tw-prose-counters': 'rgb(var(--c-ink-dim))',
            '--tw-prose-bullets': 'rgb(var(--c-signal) / 0.7)',
            '--tw-prose-hr': 'rgb(var(--c-line))',
            '--tw-prose-quotes': 'rgb(var(--c-ink-hi))',
            '--tw-prose-quote-borders': 'rgb(var(--c-signal) / 0.7)',
            '--tw-prose-captions': 'rgb(var(--c-ink-dim))',
            '--tw-prose-code': 'rgb(var(--c-ink-hi))',
            '--tw-prose-pre-code': 'rgb(var(--c-ink))',
            '--tw-prose-pre-bg': 'rgb(var(--c-bg-deep))',
            '--tw-prose-th-borders': 'rgb(var(--c-line-2))',
            '--tw-prose-td-borders': 'rgb(var(--c-line))',
            maxWidth: 'none',
          },
        },
      }),
    },
  },
  plugins: [typography],
};
