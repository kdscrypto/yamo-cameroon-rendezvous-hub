
// Fonction utilitaire pour normaliser les numéros de téléphone
export const normalizePhoneNumber = (phone: string): string => {
  // Supprime tous les espaces, tirets et parenthèses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence par 0, le remplace par +33
  if (normalized.startsWith('0')) {
    normalized = '+33' + normalized.substring(1);
  }
  
  // Si le numéro commence par 33 sans +, ajoute le +
  if (normalized.startsWith('33') && !normalized.startsWith('+33')) {
    normalized = '+' + normalized;
  }
  
  // Si le numéro ne commence pas par +, ajoute +33 par défaut (pour la France)
  if (!normalized.startsWith('+')) {
    normalized = '+33' + normalized;
  }
  
  return normalized;
};

// Validation stricte des numéros de téléphone
export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Format international: +[code pays][numéro] (8 à 15 chiffres après le code pays)
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(normalized);
};

// Détection des numéros de téléphone
export const isPhoneNumberFormat = (value: string): boolean => {
  const phoneRegex = /^[\+0-9\s\-\(\)]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return phoneRegex.test(value) && !emailRegex.test(value);
};
