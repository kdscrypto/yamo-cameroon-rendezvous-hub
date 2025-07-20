import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Temporary fallback without React hooks to avoid initialization issues
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Direct check without React state
  return window.innerWidth < MOBILE_BREAKPOINT;
}
