import * as React from "react";

// Copie exacte du TestHomePage qui fonctionne
const TestIndex = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>TestIndex - Test {count}</h1>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test Counter depuis fichier séparé
      </button>
      <p>Test d'un composant identique dans un fichier séparé</p>
    </div>
  );
};

export default TestIndex;