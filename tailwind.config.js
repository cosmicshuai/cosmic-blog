import typography from '@tailwindcss/typography';

/** Channel-triplet CSS vars so Tailwind opacity modifiers (`text-p/40`) work. */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Phosphor ramp — the whole UI is one hue at varying intensity.
        p: v('--c-p'),
        'p-hi': v('--c-p-hi'),
        'p-body': v('--c-p-body'),
        'p-dim': v('--c-p-dim'),
        'p-faint': v('--c-p-faint'),
        // The only two escapes from monochrome.
        ok: v('--c-ok'),
        warn: v('--c-warn'),
      },
      fontFamily: {
        display: ['VT323', 'ui-monospace', 'monospace'],
        pixel: ['Silkscreen', 'ui-monospace', 'monospace'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      maxWidth: {
        screenframe: '78rem',
        measure: '70ch',
      },
      boxShadow: {
        bloom: '0 0 24px -6px rgb(var(--c-p) / 0.55)',
        'bloom-lg': '0 0 60px -12px rgb(var(--c-p) / 0.5)',
        inset1: 'inset 0 1px 0 0 rgb(var(--c-p) / 0.10)',
      },
      animation: {
        flicker: 'flicker 6s steps(1, end) infinite',
        roll: 'roll 9s linear infinite',
        blink: 'blink 1.05s step-end infinite',
        sweep: 'sweep 2.4s ease-in-out infinite',
        'bar-pulse': 'barPulse 1.6s ease-in-out infinite',
        'power-on': 'powerOn 620ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        flicker: {
          '0%, 96%, 100%': { opacity: '0' },
          '97%': { opacity: '0.35' },
          '98%': { opacity: '0.08' },
          '99%': { opacity: '0.22' },
        },
        roll: {
          '0%': { transform: 'translateY(-30vh)' },
          '100%': { transform: 'translateY(130vh)' },
        },
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
        powerOn: {
          '0%': { transform: 'scaleY(0.004) scaleX(1.1)', filter: 'brightness(4)', opacity: '0' },
          '35%': { transform: 'scaleY(0.02) scaleX(1)', filter: 'brightness(3)', opacity: '1' },
          '100%': { transform: 'scaleY(1) scaleX(1)', filter: 'brightness(1)', opacity: '1' },
        },
      },
      typography: () => ({
        crt: {
          css: {
            '--tw-prose-body': 'rgb(var(--c-p-body))',
            '--tw-prose-headings': 'rgb(var(--c-p-hi))',
            '--tw-prose-lead': 'rgb(var(--c-p-dim))',
            '--tw-prose-links': 'rgb(var(--c-p))',
            '--tw-prose-bold': 'rgb(var(--c-p-hi))',
            '--tw-prose-counters': 'rgb(var(--c-p-dim))',
            '--tw-prose-bullets': 'rgb(var(--c-p) / 0.55)',
            '--tw-prose-hr': 'rgb(var(--c-line))',
            '--tw-prose-quotes': 'rgb(var(--c-p-hi))',
            '--tw-prose-quote-borders': 'rgb(var(--c-p) / 0.6)',
            '--tw-prose-captions': 'rgb(var(--c-p-dim))',
            '--tw-prose-code': 'rgb(var(--c-p))',
            '--tw-prose-pre-code': 'rgb(var(--c-p-body))',
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
