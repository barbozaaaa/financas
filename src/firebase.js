import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Configuração do Firebase
// Usa variáveis de ambiente no Vercel, ou valores padrão para desenvolvimento
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCS_j4JcHK0Lk2KmMFzQONL8UUQDNNyK2M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "financas-833ad.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "financas-833ad",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "financas-833ad.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "996167071736",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:996167071736:web:f312204e42ec822641080d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FZ6F4QCF86"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Firestore
export const db = getFirestore(app)
export default app
