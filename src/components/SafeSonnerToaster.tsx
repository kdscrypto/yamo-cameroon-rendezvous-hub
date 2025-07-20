import * as React from "react";

export const SafeSonnerToaster = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [SonnerToaster, setSonnerToaster] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    // Charger dynamiquement le Sonner Toaster pour éviter les problèmes d'initialisation
    const loadSonnerToaster = async () => {
      try {
        const { Toaster } = await import("@/components/ui/sonner");
        setSonnerToaster(() => Toaster);
        setIsMounted(true);
      } catch (error) {
        console.warn("Could not load Sonner Toaster:", error);
      }
    };

    // Délai pour s'assurer que React est complètement initialisé
    const timer = setTimeout(() => {
      loadSonnerToaster();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted || !SonnerToaster) {
    return null;
  }

  return <SonnerToaster />;
};