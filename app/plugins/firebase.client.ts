import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import type { FirebasePublicRuntimeConfig } from '@/types/plugins'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const firebaseConfig = config.public.firebase as FirebasePublicRuntimeConfig as FirebaseOptions

  const app = initializeApp(firebaseConfig, 'todovue')
  const firestore = getFirestore(app)
  const database = getDatabase(app)

  return {
    provide: {
      firestore,
      database
    }
  }
})
