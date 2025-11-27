---
title: Welcome to TODOvue
description: The start of a new modern, accessible, and production-ready Vue 3 component library.
date: 2025-11-25
readingTime: 9
tags:
  - tag: "Vue"
    color: "#42b883"
  - tag: "Composition API"
    color: "#35195e"
  - "Frontend"
cover: https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763701508/jarnmxxvmhbisvpzzfwu.webp
coverAlt: Vue.js logo and code
coverCaption: Starting the journey with TODOvue

---

Welcome to the first official blog post of **TODOvue**\! This is the beginning of an exciting journey where we will document the creation of a complete Vue 3 component library.

## What is TODOvue?

TODOvue is a collection of Vue 3 components designed with best practices in mind:

- **Modern**: Composition API, TypeScript, and the latest Vue 3 features
- **Accessible**: Following ARIA standards and accessibility best practices
- **SSR-Ready**: Compatible with Nuxt 3 and server-side rendering
- **Tree-shakeable**: Import only what you need
- **Well-documented**: Each component comes with complete documentation and examples

## The First Component: TvArticle

Our first released component is `TvArticle`, a specialized component for rendering article content with polished typography and advanced features.

### Key Features

The `TvArticle` component includes:

1.  **Prose typography** for long content (paragraphs, lists, tables, blockquotes, code, images)
2.  **Copyable anchors** on H2-H4 headings with localized feedback
3.  **Optional metadata**: date (with a relative-time component), reading time, and colored tags
4.  **Cover image** with control over `loading`, `decoding`, `fetchpriority`, and aspect ratio
5.  **Configurable layout**: centered container and prose width control

### Usage Example

```vue
<script setup>
import { TvArticle } from '@todovue/tv-article'

const article = {
  title: 'My First Article',
  description: 'An introduction to the TODOvue ecosystem',
  date: '2025-11-12',
  readingTime: 5,
  tags: ['Vue', { tag: 'JavaScript', color: '#F7DF1E' }],
  body: `
    <h2 id="introduction">Introduction</h2>
    <p>Article content...</p>
  `
}
</script>

<template>
  <TvArticle :content="article" lang="en" />
</template>
```

## Why Another Component Library?

There are many excellent libraries like Vuetify, PrimeVue, or Element Plus. So, why TODOvue?

### Different Philosophy

TODOvue is born with a specific philosophy:

- **Specialized components**: We don't try to be everything to everyone. Each component solves one specific problem very well.
- **Zero unnecessary dependencies**: Only strictly necessary dependencies.
- **Injected styles**: CSS automatically injected via JavaScript, with no manual configuration.
- **TypeScript first**: First-class types, not an afterthought.

## The Road Ahead

This blog will document the complete development process:

- Architecture decisions and why we made them
- Technical challenges and how we solve them
- New components and their use cases
- Performance improvements and optimizations
- Community feedback and iterations

## Join the Journey

TODOvue is open source and we welcome contributions. Whether you want to:

- Report bugs or suggest features
- Contribute code or documentation
- Share your use cases
- Simply follow the progress

All forms of participation are welcome\!

## Next Steps

In the following posts we will explore:

1.  The internal architecture of TvArticle
2.  How we handle SSR and style injection
3.  The localization and i18n system
4.  Helper components: TvLabel and TvRelativeTime
5.  Plans for new components

---

Do you have any questions or comments? We would love to hear them\! Follow us on [GitHub](https://github.com/TODOvue) to stay up to date with the latest news.
