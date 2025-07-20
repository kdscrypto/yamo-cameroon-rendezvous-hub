import * as React from "react";

const SimpleIndex = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Index Ultra Simple - Test {count}</h1>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test Counter Simple
      </button>
      <p>Test sans hooks personnalisés du tout</p>
    </div>
  );
};

export default SimpleIndex;