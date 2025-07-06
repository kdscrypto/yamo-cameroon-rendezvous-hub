
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Fonction utilitaire pour vérifier si le DOM est disponible
const isDOMAvailable = (): boolean => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined" &&
      typeof window.document.documentElement !== "undefined" &&
      window.document.documentElement !== null
    )
  } catch {
    return false
  }
}

// Fonction utilitaire pour vérifier localStorage
const isLocalStorageAvailable = (): boolean => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      window.localStorage !== null
    )
  } catch {
    return false
  }
}

// Fonction utilitaire pour appliquer le thème de manière sécurisée
const safeApplyTheme = (theme: Theme): void => {
  console.log("Attempting to apply theme:", theme)
  
  if (!isDOMAvailable()) {
    console.warn("DOM not available, skipping theme application")
    return
  }

  try {
    const root = window.document.documentElement
    
    if (!root) {
      console.warn("documentElement is null")
      return
    }

    if (!root.classList) {
      console.warn("classList is not available on documentElement")
      return
    }

    // Nettoyage sécurisé
    console.log("Removing existing theme classes")
    root.classList.remove("light", "dark")

    if (theme === "system") {
      try {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        console.log("Detected system theme:", systemTheme)
        root.classList.add(systemTheme)
      } catch (error) {
        console.warn("Error detecting system theme:", error)
        // Fallback sécurisé
        root.classList.add("dark")
      }
    } else {
      console.log("Adding theme class:", theme)
      root.classList.add(theme)
    }
    
    console.log("Theme applied successfully")
  } catch (error) {
    console.error("Error in safeApplyTheme:", error)
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    console.log("Initializing theme state")
    
    if (!isLocalStorageAvailable()) {
      console.log("localStorage not available, using default theme:", defaultTheme)
      return defaultTheme
    }
    
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      const initialTheme = storedTheme || defaultTheme
      console.log("Initial theme from storage:", initialTheme)
      return initialTheme
    } catch (error) {
      console.warn("Error reading from localStorage:", error)
      return defaultTheme
    }
  })

  useEffect(() => {
    console.log("ThemeProvider useEffect triggered with theme:", theme)
    safeApplyTheme(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log("Setting new theme:", newTheme)
      
      if (isLocalStorageAvailable()) {
        try {
          localStorage.setItem(storageKey, newTheme)
          console.log("Theme saved to localStorage")
        } catch (error) {
          console.warn("Error saving theme to localStorage:", error)
        }
      }
      
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
