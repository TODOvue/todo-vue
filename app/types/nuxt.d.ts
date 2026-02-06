import type { Database } from 'firebase/database'
import type { Firestore } from 'firebase/firestore'
import type { ContentLocalePluginApi } from '@/types/plugins'

declare module '#app' {
  interface NuxtApp {
    $database?: Database
    $firestore?: Firestore
    $localizedContent?: ContentLocalePluginApi
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $database?: Database
    $firestore?: Firestore
    $localizedContent?: ContentLocalePluginApi
  }
}

export {}
