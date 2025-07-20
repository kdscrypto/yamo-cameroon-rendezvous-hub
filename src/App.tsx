
import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Composant de test simple sans hooks complexes
const TestHomePage = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Page d'accueil - Test {count}</h1>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test Counter
      </button>
      <p>BrowserRouter + Routes + useState = OK</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/" element={<TestHomePage />} />
          <Route path="*" element={<div style={{ padding: '20px', color: 'white' }}>Page non trouvée</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
