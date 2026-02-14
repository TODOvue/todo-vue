import { FlatCompat } from '@eslint/eslintrc'
import pluginVue from 'eslint-plugin-vue'
import withNuxt from './.nuxt/eslint.config.mjs'

const baseDirectory = decodeURIComponent(new URL('.', import.meta.url).pathname)
  .replace(/^\/([A-Za-z]:\/)/, '$1')

const compat = new FlatCompat({
  baseDirectory
})

const standardConfigs = compat.extends('standard').map((config) => ({
  ...config,
  files: ['**/*.{js,cjs,mjs,jsx}']
}))

export default withNuxt(
  {
    name: 'custom/vue-plugin-setup',
    plugins: {
      vue: pluginVue
    }
  },
  ...standardConfigs,
  {
    name: 'custom/standard-style-overrides',
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }]
    }
  }
)
