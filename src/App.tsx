
import * as React from "react";

const App: React.FC = () => {
  // Test d'un hook React de base
  const [testCount, setTestCount] = React.useState(0);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>Test React Hooks - Compteur: {testCount}</h1>
      <button 
        onClick={() => setTestCount(testCount + 1)}
        style={{ padding: '10px', marginRight: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Incrémenter
      </button>
      <p>Si ce bouton fonctionne, React hooks sont OK.</p>
      <p>Diagnostic: React est correctement initialisé et useState fonctionne.</p>
    </div>
  );
};

export default App;
