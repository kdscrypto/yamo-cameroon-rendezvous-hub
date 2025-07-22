
/**
 * Utilitaires pour la validation d'emails et la prévention des bounces
 */

// Domaines email temporaires/jetables courants à éviter
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'maildrop.cc',
  '0-mail.com',
  '33mail.com'
];

// Domaines avec des problèmes de délivrabilité connus
const PROBLEMATIC_DOMAINS = [
  'example.com',
  'test.com',
  'localhost'
];

/**
 * Validation avancée d'emails avec des règles plus strictes que les validations HTML5 basiques
 */
export const validateEmail = (email: string): { isValid: boolean; reason?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, reason: "L'email ne peut pas être vide" };
  }

  email = email.trim().toLowerCase();

  // Vérification de base avec regex pour la syntaxe générale
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: "Format d'email invalide" };
  }

  // Vérification plus stricte de la structure
  const stricterRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!stricterRegex.test(email)) {
    return { isValid: false, reason: "Format d'email non standard" };
  }

  // Vérifier la longueur
  if (email.length > 320) { // RFC 3696
    return { isValid: false, reason: "Email trop long" };
  }

  // Vérifier le nom de domaine
  const domain = email.split('@')[1];
  
  // Vérifier les domaines jetables
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { isValid: false, reason: "Les emails temporaires ne sont pas acceptés" };
  }

  // Vérifier les domaines problématiques
  if (PROBLEMATIC_DOMAINS.includes(domain)) {
    return { isValid: false, reason: "Ce domaine email n'est pas accepté" };
  }

  // Vérifier les TLDs (au moins 2 caractères)
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2) {
    return { isValid: false, reason: "Domaine email invalide" };
  }

  return { isValid: true };
};

/**
 * Analyse le risque de bounce d'une adresse email
 */
export const analyzeEmailBounceRisk = (email: string): { risk: 'low' | 'medium' | 'high'; reasons: string[] } => {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  if (!email || typeof email !== 'string') {
    return { risk: 'high', reasons: ["Email vide ou invalide"] };
  }

  email = email.trim().toLowerCase();
  const domain = email.split('@')[1];

  // Vérifier la longueur de l'email (trop long peut être problématique)
  if (email.length > 100) {
    reasons.push("Email exceptionnellement long");
    riskLevel = 'medium';
  }

  // Vérifier les domaines gratuits (risque légèrement plus élevé)
  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  if (freeEmailDomains.includes(domain)) {
    // Ce n'est pas un problème en soi, mais peut avoir plus de comptes inactifs
    reasons.push("Domaine email grand public");
  }

  // Vérifier les caractères répétés (souvent des erreurs de frappe)
  const repeatedCharsRegex = /(.)\1{4,}/;
  if (repeatedCharsRegex.test(email.split('@')[0])) {
    reasons.push("Caractères répétés (possible erreur de frappe)");
    riskLevel = 'medium';
  }

  // Email avec trop de chiffres consécutifs (souvent des comptes temporaires)
  const numericalRegex = /\d{4,}/;
  if (numericalRegex.test(email)) {
    reasons.push("Séquence numérique longue (possible compte automatisé)");
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Domaines jetables
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    reasons.push("Service d'email temporaire");
    riskLevel = 'high';
  }

  // Domaines problématiques connus
  if (PROBLEMATIC_DOMAINS.includes(domain)) {
    reasons.push("Domaine avec historique de problèmes de livraison");
    riskLevel = 'high';
  }

  return { risk: riskLevel, reasons };
};
