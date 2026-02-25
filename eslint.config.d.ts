declare module './.nuxt/eslint.config.mjs' {
  import type { Linter } from 'eslint'

  type FlatConfig = Linter.Config
  type WithNuxt = (...customs: FlatConfig[]) => FlatConfig[]

  const withNuxt: WithNuxt
  export default withNuxt
}
