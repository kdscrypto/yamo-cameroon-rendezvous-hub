
// Fonction utilitaire pour normaliser les numéros de téléphone camerounais
export const normalizePhoneNumber = (phone: string): string => {
  // Supprime tous les espaces, tirets et parenthèses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence par 6 ou 2 (numéros locaux camerounais), ajoute +237
  if (/^[62]\d{8}$/.test(normalized)) {
    normalized = '+237' + normalized;
  }
  
  // Si le numéro commence par 237 sans +, ajoute le +
  if (normalized.startsWith('237') && !normalized.startsWith('+237')) {
    normalized = '+' + normalized;
  }
  
  // Si le numéro ne commence pas par + et a 9 chiffres, ajoute +237 par défaut
  if (!normalized.startsWith('+') && /^\d{9}$/.test(normalized)) {
    normalized = '+237' + normalized;
  }
  
  return normalized;
};

// Validation stricte des numéros de téléphone camerounais
export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Format camerounais: +237 suivi de 9 chiffres (généralement commençant par 6 ou 2)
  const cameroonPhoneRegex = /^\+237[62]\d{8}$/;
  return cameroonPhoneRegex.test(normalized);
};

// Détection des numéros de téléphone
export const isPhoneNumberFormat = (value: string): boolean => {
  const phoneRegex = /^[\+0-9\s\-\(\)]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return phoneRegex.test(value) && !emailRegex.test(value);
};
