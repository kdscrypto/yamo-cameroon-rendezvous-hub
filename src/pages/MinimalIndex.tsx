import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';

const MinimalIndex = () => {
  const [test, setTest] = useState(0);
  const { getSEOForPath } = useSEO();

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Index Minimal avec useSEO - Test {test}</h1>
      <button 
        onClick={() => setTest(test + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test useState + useSEO
      </button>
      <p>useSEO: {getSEOForPath('/').title}</p>
    </div>
  );
};

export default MinimalIndex;