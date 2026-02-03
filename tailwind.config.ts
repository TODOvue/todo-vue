// @ts-ignore
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './node_modules/@todovue/tv-ui/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        'body-bg': 'var(--body-bg)',
        'card-bg': 'var(--card-bg)',
        'text': 'var(--text)',
        'button-bg': 'var(--button-bg)',
        'button-text': 'var(--button-text)',
        'primary': 'var(--button-bg)',
      },
    },
    animation: {
      fadeIn: 'fadeIn 0.5s ease-in forwards',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
    }
  }
} satisfies Config
