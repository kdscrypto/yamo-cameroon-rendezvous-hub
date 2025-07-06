
import React, { useEffect, useState } from 'react';

const DynamicColorBackground = () => {
  const [currentGradient, setCurrentGradient] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Expanded array of gradient combinations with more variety
  const gradients = [
    // Warm orange to deep purple flow
    'linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #8b4cb8 75%, #2d1b69 100%)',
    // Golden hour to midnight blue
    'linear-gradient(135deg, #ffa726 0%, #ff7043 30%, #5e35b1 70%, #1a237e 100%)',
    // Sunset amber to cosmic purple
    'linear-gradient(135deg, #ffb74d 0%, #ff8a65 25%, #7b1fa2 75%, #311b92 100%)',
    // Fire orange to deep space
    'linear-gradient(135deg, #ff8f00 0%, #ff6f00 20%, #673ab7 80%, #1a237e 100%)',
    // Tropical sunset to ocean depths
    'linear-gradient(135deg, #ff9800 0%, #ff5722 30%, #3f51b5 70%, #1a237e 100%)',
    // Rose gold to midnight
    'linear-gradient(135deg, #ffab91 0%, #ff7043 25%, #512da8 75%, #1a237e 100%)',
    // Copper to royal purple
    'linear-gradient(135deg, #ff8a50 0%, #ff6f00 20%, #5e35b1 80%, #283593 100%)',
    // Amber waves to deep cosmos
    'linear-gradient(135deg, #ffcc02 0%, #ff8f00 25%, #673ab7 75%, #1a237e 100%)',
  ];

  // Cycle through gradients every 12 seconds with smoother transition effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentGradient((prev) => (prev + 1) % gradients.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 800); // Longer transition period
      }, 600); // Smoother transition timing
    }, 12000); // Doubled the interval for more subtle changes

    return () => clearInterval(interval);
  }, [gradients.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main flowing gradient background with enhanced transitions */}
      <div 
        className={`absolute inset-0 transition-all duration-[4000ms] ease-in-out ${
          isTransitioning ? 'opacity-85 scale-[1.02]' : 'opacity-90'
        }`}
        style={{
          background: gradients[currentGradient],
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Secondary gradient overlay for depth with slower transitions */}
      <div 
        className="absolute inset-0 transition-all duration-[5000ms] ease-in-out opacity-30"
        style={{
          background: gradients[(currentGradient + 2) % gradients.length],
          mixBlendMode: 'overlay',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      />
      
      {/* Third gradient layer for even more depth */}
      <div 
        className="absolute inset-0 transition-all duration-[6000ms] ease-in-out opacity-20"
        style={{
          background: gradients[(currentGradient + 4) % gradients.length],
          mixBlendMode: 'soft-light',
          transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        }}
      />
      
      {/* Enhanced animated flowing orbs with morphing effects */}
      <div className="absolute inset-0">
        {/* Large morphing orb 1 with slower pulsation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse">
          <div 
            className="w-full h-full rounded-full animate-[morph_35s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(ellipse 120% 80%, rgba(255,179,77,0.4) 0%, rgba(255,107,53,0.25) 40%, rgba(255,138,101,0.15) 70%, transparent 100%)',
              filter: 'blur(3px)',
            }}
          />
        </div>
        
        {/* Large morphing orb 2 with counter-rotation */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15">
          <div 
            className="w-full h-full rounded-full animate-[morph-reverse_40s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(ellipse 80% 120%, rgba(139,76,184,0.4) 0%, rgba(123,31,162,0.25) 40%, rgba(94,53,177,0.15) 70%, transparent 100%)',
              filter: 'blur(4px)',
            }}
          />
        </div>
        
        {/* Medium flowing orb 3 with wave motion */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-12">
          <div 
            className="w-full h-full rounded-full animate-[wave-flow_30s_ease-in-out_infinite]"
            style={{
              background: 'radial-gradient(circle, rgba(255,138,101,0.3) 0%, rgba(255,111,0,0.15) 50%, rgba(255,152,0,0.08) 80%, transparent 100%)',
              filter: 'blur(2px)',
            }}
          />
        </div>
        
        {/* Small accent orbs for extra depth with slower movement */}
        <div className="absolute top-1/3 left-1/2 w-32 h-32 rounded-full opacity-8">
          <div 
            className="w-full h-full rounded-full animate-[float_25s_ease-in-out_infinite_2s]"
            style={{
              background: 'radial-gradient(circle, rgba(255,193,7,0.5) 0%, rgba(255,152,0,0.25) 60%, transparent 100%)',
            }}
          />
        </div>
        
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48 rounded-full opacity-10">
          <div 
            className="w-full h-full rounded-full animate-[float_28s_ease-in-out_infinite_reverse_1s]"
            style={{
              background: 'radial-gradient(circle, rgba(156,39,176,0.3) 0%, rgba(123,31,162,0.15) 60%, transparent 100%)',
            }}
          />
        </div>
      </div>
      
      {/* Enhanced noise texture with dynamic opacity */}
      <div 
        className={`absolute inset-0 mix-blend-overlay transition-opacity duration-[2000ms] ${
          isTransitioning ? 'opacity-[0.04]' : 'opacity-[0.025]'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Dynamic light rays effect with slower rotation */}
      <div className="absolute inset-0 opacity-8">
        <div 
          className="absolute inset-0 animate-[light-rays_60s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,215,0,0.25) 60deg, transparent 120deg, rgba(255,152,0,0.15) 180deg, transparent 240deg, rgba(255,193,7,0.25) 300deg, transparent 360deg)',
            transform: 'scale(2)',
          }}
        />
      </div>
      
      {/* Enhanced dark overlay with subtle gradient for better text readability */}
      <div 
        className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out ${
          isTransitioning ? 'opacity-90' : 'opacity-85'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.40) 100%)',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      />
    </div>
  );
};

export default DynamicColorBackground;
