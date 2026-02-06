import type { Database } from 'firebase/database'
import type { Firestore } from 'firebase/firestore'
import type { BlogPost, LocalizedContentApi } from '@/types/composables'

export type FirebasePublicRuntimeConfig = {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
  databaseURL?: string
  measurementId?: string
}

export type LocalizedContentCache = Map<string, BlogPost[]>

export type ContentLocalePluginApi = LocalizedContentApi

export type FirebasePluginApi = {
  firestore: Firestore
  database: Database
}
