import type { Config } from 'tailwindcss'

export default {
  darkMode: ['selector', '.dark-mode'],
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
        'dark-body-bg': 'var(--dark-body-bg)',
        'dark-card-bg': 'var(--dark-card-bg)',
        'dark-text': 'var(--dark-text)',
        'dark-button-bg': 'var(--dark-button-bg)',
        'dark-button-text': 'var(--dark-button-text)',
        'light-body-bg': 'var(--light-body-bg)',
        'light-card-bg': 'var(--light-card-bg)',
        'light-text': 'var(--light-text)',
        'light-button-bg': 'var(--light-button-bg)',
        'light-button-text': 'var(--light-button-text)',
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
