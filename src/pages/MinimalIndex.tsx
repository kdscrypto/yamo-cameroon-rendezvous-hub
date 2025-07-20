import React, { useState } from 'react';

const MinimalIndex = () => {
  const [test, setTest] = useState(0);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Index Minimal Ultra Simple - Test {test}</h1>
      <button 
        onClick={() => setTest(test + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test useState simple
      </button>
      <p>Test sans hooks complexes</p>
    </div>
  );
};

export default MinimalIndex;