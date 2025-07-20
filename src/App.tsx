
import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  console.log("App component is rendering...");
  
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Test App - React + BrowserRouter</h1>
        <p>Si vous voyez ce message, React et BrowserRouter fonctionnent correctement.</p>
        <Routes>
          <Route path="/" element={<div>Page d'accueil</div>} />
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
