
import * as React from "react";

const App: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>Application de base - React fonctionne</h1>
      <p>Diagnostic: Si vous voyez ce message, React est correctement initialisé.</p>
      <p>Version ultra-minimaliste sans hooks, providers ou routing.</p>
    </div>
  );
};

export default App;
