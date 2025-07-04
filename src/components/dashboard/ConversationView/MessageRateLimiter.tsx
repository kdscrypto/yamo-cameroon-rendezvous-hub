
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface MessageRateLimiterProps {
  userId: string;
  onRateLimit: (isLimited: boolean) => void;
}

interface RateLimitState {
  messageCount: number;
  lastReset: number;
}

const MESSAGE_LIMIT = 10; // messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export const useMessageRateLimit = (userId: string) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const rateLimitRef = useRef<RateLimitState>({
    messageCount: 0,
    lastReset: Date.now()
  });

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const state = rateLimitRef.current;

    // Reset counter if window has passed
    if (now - state.lastReset > RATE_LIMIT_WINDOW) {
      state.messageCount = 0;
      state.lastReset = now;
    }

    // Check if limit exceeded
    if (state.messageCount >= MESSAGE_LIMIT) {
      setIsRateLimited(true);
      toast.error('Limite de messages atteinte. Veuillez attendre avant d\'envoyer un autre message.');
      return false;
    }

    // Increment counter
    state.messageCount++;
    setIsRateLimited(false);
    return true;
  };

  // Auto-reset rate limit after window
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const state = rateLimitRef.current;
      
      if (now - state.lastReset > RATE_LIMIT_WINDOW) {
        state.messageCount = 0;
        state.lastReset = now;
        setIsRateLimited(false);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { checkRateLimit, isRateLimited };
};
