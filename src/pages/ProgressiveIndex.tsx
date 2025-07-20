import * as React from 'react';

const ProgressiveIndex = () => {
  const [ageVerified, setAgeVerified] = React.useState(false);

  const handleAgeVerification = React.useCallback(() => {
    console.log('Age verification completed');
    setAgeVerified(true);
  }, []);

  // Version simple sans hooks personnalisés
  if (!ageVerified) {
    return (
      <div style={{ padding: '20px', color: 'white' }}>
        <h1>Age Verification Required</h1>
        <button 
          onClick={handleAgeVerification}
          style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          I am 18 or older
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Main Content - Progressive Index</h1>
      <p>Age verified successfully</p>
      <button 
        onClick={() => setAgeVerified(false)}
        style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Reset
      </button>
    </div>
  );
};

export default ProgressiveIndex;