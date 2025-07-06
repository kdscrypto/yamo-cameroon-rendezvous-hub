
import React, { useEffect, useState } from 'react';

const DynamicColorBackground = () => {
  const [currentGradient, setCurrentGradient] = useState(0);

  // Array of gradient combinations inspired by the flowing color aesthetic
  const gradients = [
    // Warm orange to deep purple flow
    'linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #8b4cb8 75%, #2d1b69 100%)',
    // Golden hour to midnight blue
    'linear-gradient(135deg, #ffa726 0%, #ff7043 30%, #5e35b1 70%, #1a237e 100%)',
    // Sunset amber to cosmic purple
    'linear-gradient(135deg, #ffb74d 0%, #ff8a65 25%, #7b1fa2 75%, #311b92 100%)',
    // Fire orange to deep space
    'linear-gradient(135deg, #ff8f00 0%, #ff6f00 20%, #673ab7 80%, #1a237e 100%)',
  ];

  // Cycle through gradients every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGradient((prev) => (prev + 1) % gradients.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [gradients.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main flowing gradient background */}
      <div 
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{
          background: gradients[currentGradient],
          opacity: 0.9,
        }}
      />
      
      {/* Animated flowing orbs for depth */}
      <div className="absolute inset-0">
        {/* Large flowing orb 1 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse">
          <div 
            className="w-full h-full rounded-full animate-[float_20s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(circle, rgba(255,179,77,0.4) 0%, rgba(255,107,53,0.2) 50%, transparent 100%)',
            }}
          />
        </div>
        
        {/* Large flowing orb 2 */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-pulse">
          <div 
            className="w-full h-full rounded-full animate-[float_25s_ease-in-out_infinite_reverse]"
            style={{
              background: 'radial-gradient(circle, rgba(139,76,184,0.4) 0%, rgba(123,31,162,0.2) 50%, transparent 100%)',
            }}
          />
        </div>
        
        {/* Medium flowing orb 3 */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10">
          <div 
            className="w-full h-full rounded-full animate-[float_15s_ease-in-out_infinite_0.5s]"
            style={{
              background: 'radial-gradient(circle, rgba(255,138,101,0.3) 0%, rgba(255,111,0,0.1) 50%, transparent 100%)',
            }}
          />
        </div>
      </div>
      
      {/* Subtle noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
};

export default DynamicColorBackground;
