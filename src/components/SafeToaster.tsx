import * as React from "react";
import { Toaster } from "@/components/ui/toaster";

export const SafeToaster = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Délai pour s'assurer que React est complètement initialisé
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
};