
import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
      <BrowserRouter>
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'white' }}>
          <h1>Test App - React + BrowserRouter + QueryClient</h1>
          <p>Si vous voyez ce message, React, BrowserRouter et QueryClient fonctionnent correctement.</p>
          <Routes>
            <Route path="/" element={<div style={{ color: 'white' }}>Page d'accueil - QueryClient OK</div>} />
            <Route path="*" element={<div style={{ color: 'white' }}>Page non trouvée</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
