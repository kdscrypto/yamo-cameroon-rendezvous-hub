import * as React from "react";

const App: React.FC = () => {
  console.log("App component is rendering...");
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test App - React is working!</h1>
      <p>Si vous voyez ce message, React fonctionne correctement.</p>
    </div>
  );
};

export default App;