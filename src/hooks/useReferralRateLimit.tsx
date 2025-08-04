import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/environmentUtils';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  isBlocked: boolean;
  blockUntil: number;
}

export const useReferralRateLimit = (config: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000 // 5 minutes
}) => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    isBlocked: false,
    blockUntil: 0
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const checkRateLimit = useCallback((operation: string): boolean => {
    const now = Date.now();
    const currentState = stateRef.current;

    // Vérifier si on est encore bloqué
    if (currentState.isBlocked && now < currentState.blockUntil) {
      logger.warn(`Opération ${operation} bloquée par rate limiting`);
      return false;
    }

    // Reset si la fenêtre a expiré
    if (now - currentState.windowStart > config.windowMs) {
      setState({
        attempts: 1,
        windowStart: now,
        isBlocked: false,
        blockUntil: 0
      });
      return true;
    }

    // Incrémenter les tentatives
    const newAttempts = currentState.attempts + 1;

    if (newAttempts > config.maxAttempts) {
      // Bloquer l'utilisateur
      const blockUntil = now + config.blockDurationMs;
      setState({
        ...currentState,
        attempts: newAttempts,
        isBlocked: true,
        blockUntil
      });

      logger.warn(`Rate limit dépassé pour ${operation}. Blocage jusqu'à ${new Date(blockUntil).toLocaleTimeString()}`);
      return false;
    }

    setState({
      ...currentState,
      attempts: newAttempts
    });

    return true;
  }, [config.maxAttempts, config.windowMs, config.blockDurationMs]);

  const getRemainingTime = useCallback((): number => {
    const now = Date.now();
    if (state.isBlocked && now < state.blockUntil) {
      return state.blockUntil - now;
    }
    return 0;
  }, [state.isBlocked, state.blockUntil]);

  const getAttemptsLeft = useCallback((): number => {
    const now = Date.now();
    
    // Si on est dans une nouvelle fenêtre, reset
    if (now - state.windowStart > config.windowMs) {
      return config.maxAttempts;
    }
    
    return Math.max(0, config.maxAttempts - state.attempts);
  }, [state.attempts, state.windowStart, config.maxAttempts, config.windowMs]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      windowStart: Date.now(),
      isBlocked: false,
      blockUntil: 0
    });
  }, []);

  return {
    checkRateLimit,
    getRemainingTime,
    getAttemptsLeft,
    isBlocked: state.isBlocked,
    reset
  };
};