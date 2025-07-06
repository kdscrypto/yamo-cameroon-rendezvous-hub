
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Fonction pour vérifier si le DOM est prêt
const isDOMReady = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    document.readyState !== "loading"
  )
}

// Service Worker registration avec vérification
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

// Fonction d'initialisation de l'application
const initializeApp = () => {
  console.log("Initializing app...")
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found');
    throw new Error('Root element not found');
  }

  console.log("Root container found, creating React root...")
  
  try {
    const root = createRoot(container);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("React app rendered successfully")
    
    // Enregistrer le service worker après le rendu
    registerServiceWorker()
    
  } catch (error) {
    console.error("Error initializing React app:", error)
    throw error
  }
}

// Attendre que le DOM soit prêt avant d'initialiser
if (isDOMReady()) {
  console.log("DOM is ready, initializing immediately")
  initializeApp()
} else {
  console.log("DOM not ready, waiting for DOMContentLoaded")
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired, initializing app")
    initializeApp()
  })
}
