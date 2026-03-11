// content.config.ts
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    blog: defineCollection(
      asSchemaOrgCollection({
        type: 'page',
        source: 'blog/**/*.md',
        schema: z.object({
          title: z.string(),
          description: z.string().optional(),
          cover: z.string().url().optional(),
          coverAlt: z.string().optional(),
          date: z.preprocess((arg) => {
            if (typeof arg === 'string' || typeof arg === 'number') return new Date(arg)
            return arg
          }, z.date()).optional(),
          tags: z.array(
            z.object({
              tag: z.string(),
              color: z.string()
            })
          ).default([]),
          draft: z.boolean(),
          locale: z.enum(['en', 'es']).optional(),
          slug: z.string().optional(),
          series: z.string().optional(),
          seriesOrder: z.number().int().positive().optional(),
          seriesTitle: z.string().optional(),
          seriesDescription: z.string().optional(),
        })
      })
    )
  }
})
