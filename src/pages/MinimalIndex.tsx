import React, { useState } from 'react';

// Hook SEO simplifié pour test
const useSimpleSEO = () => {
  const getSEOForPath = (path: string) => ({
    title: 'Test SEO - Yamo',
    description: 'Description test',
    keywords: 'test'
  });
  
  return { getSEOForPath };
};

const MinimalIndex = () => {
  const [test, setTest] = useState(0);
  const { getSEOForPath } = useSimpleSEO();

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Index Minimal avec SEO simplifié - Test {test}</h1>
      <button 
        onClick={() => setTest(test + 1)}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Test useState + SEO simple
      </button>
      <p>SEO simple: {getSEOForPath('/').title}</p>
    </div>
  );
};

export default MinimalIndex;