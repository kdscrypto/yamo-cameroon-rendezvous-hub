import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Completely static implementation to avoid React hooks issues
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  } catch (error) {
    console.warn('useIsMobile fallback:', error);
    return false;
  }
}
