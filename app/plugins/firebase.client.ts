import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const firebaseConfig = config.public.firebase as FirebaseOptions

  const app = initializeApp(firebaseConfig, 'todovue')
  const firestore = getFirestore(app)

  return {
    provide: {
      firestore
    }
  }
})
