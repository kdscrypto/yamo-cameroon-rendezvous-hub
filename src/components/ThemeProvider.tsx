
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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Vérification plus sûre de l'environnement
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultTheme
    }
    
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  useEffect(() => {
    // Vérification sécurisée de l'existence du DOM
    if (typeof window === "undefined" || !window.document || !window.document.documentElement) {
      return
    }

    const root = window.document.documentElement

    // Vérification que root existe et a la méthode classList
    if (!root || !root.classList) {
      return
    }

    // Nettoyage sécurisé des classes existantes
    try {
      root.classList.remove("light", "dark")
    } catch (error) {
      console.warn("Error removing theme classes:", error)
      return
    }

    if (theme === "system") {
      try {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"

        root.classList.add(systemTheme)
      } catch (error) {
        console.warn("Error detecting system theme:", error)
        // Fallback à dark theme
        root.classList.add("dark")
      }
      return
    }

    try {
      root.classList.add(theme)
    } catch (error) {
      console.warn("Error adding theme class:", error)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Vérification sécurisée avant d'accéder au localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem(storageKey, theme)
        } catch (error) {
          console.warn("Error saving theme to localStorage:", error)
        }
      }
      setTheme(theme)
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
