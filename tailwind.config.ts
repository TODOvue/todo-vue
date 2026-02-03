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
        'button-background': 'var(--button-bg)'
      }
    }
  }
} satisfies Config
