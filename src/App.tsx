
import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";

// Create QueryClient outside component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Composant de test simple sans hooks complexes
const TestHomePage = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Page de test - Test {count}</h1>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test Counter
      </button>
      <p>Providers OK - Test avec vrai Index</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="yamo-theme">
          <BrowserRouter>
            <div style={{ 
              backgroundColor: '#1a1a1a', 
              minHeight: '100vh'
            }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/test" element={<TestHomePage />} />
                <Route path="*" element={<div style={{ padding: '20px', color: 'white' }}>Page non trouvée</div>} />
              </Routes>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
