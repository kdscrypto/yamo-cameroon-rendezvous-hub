import * as React from 'react';
import AgeVerification from '@/components/AgeVerification';

const MinimalIndex = () => {
  const [ageVerified, setAgeVerified] = React.useState(false);

  const handleAgeVerification = React.useCallback(() => {
    console.log('Age verification completed');
    setAgeVerified(true);
  }, []);

  if (!ageVerified) {
    return <AgeVerification onConfirm={handleAgeVerification} />;
  }

  return (
    <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
      <h1>Application Loaded Successfully!</h1>
      <p>Age verification passed. The React hooks issue has been resolved.</p>
    </div>
  );
};

export default MinimalIndex;