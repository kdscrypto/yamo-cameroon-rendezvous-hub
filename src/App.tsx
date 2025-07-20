
import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";

// Create QueryClient outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  console.log("App component is rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="yamo-theme">
        <BrowserRouter>
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'white' }}>
            <h1>Test App - React + QueryClient + ThemeProvider</h1>
            <p>Si vous voyez ce message, React, QueryClient et ThemeProvider fonctionnent correctement.</p>
            <Routes>
              <Route path="/" element={<div style={{ color: 'white' }}>Page d'accueil - ThemeProvider OK</div>} />
              <Route path="*" element={<div style={{ color: 'white' }}>Page non trouvée</div>} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
