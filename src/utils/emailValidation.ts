
/**
 * Utilitaires pour la validation d'emails et la prévention des bounces
 */

// Domaines email temporaires/jetables courants à éviter (liste étendue)
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
  '33mail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dispostable.com',
  'fake-mail.ml',
  'getairmail.com',
  'getnada.com',
  'inboxkitten.com',
  'mail-temporaire.fr',
  'mohmal.com',
  'rootfest.net',
  'spambox.us',
  'tempmailaddress.com',
  'trashmail.com',
  'wegwerfmail.de',
  'emailondeck.com',
  'mintemail.com',
  'disposablemail.com'
];

// Domaines populaires avec leurs variantes de typos courantes
const COMMON_DOMAIN_TYPOS = {
  'gmail.com': ['gmai.com', 'gmailcom', 'gmail.co', 'gmaill.com', 'gmial.com', 'gmail.cm'],
  'outlook.com': ['outlok.com', 'outlook.co', 'outloo.com', 'outlookcom'],
  'hotmail.com': ['hotmailcom', 'hotmai.com', 'hotmail.co', 'hotmial.com'],
  'yahoo.com': ['yahooo.com', 'yahoo.co', 'yahoocom', 'yaho.com'],
  'icloud.com': ['icloudcom', 'icloud.co', 'icoud.com'],
  'live.com': ['live.co', 'livecom', 'liv.com'],
  'msn.com': ['msncom', 'msn.co'],
  'aol.com': ['aolcom', 'aol.co']
};

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
  
  // Vérifier les typos de domaines courants
  const correctDomain = detectDomainTypo(domain);
  if (correctDomain) {
    return { isValid: false, reason: `Voulez-vous dire ${correctDomain} ?` };
  }
  
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

  // Analyse comportementale pour détecter les bots
  const behaviorAnalysis = analyzeSuspiciousBehavior(email);
  if (behaviorAnalysis.isSuspicious) {
    return { isValid: false, reason: behaviorAnalysis.reason };
  }

  return { isValid: true };
};

/**
 * Détecte les typos dans les domaines email populaires
 */
const detectDomainTypo = (domain: string): string | null => {
  for (const [correctDomain, typos] of Object.entries(COMMON_DOMAIN_TYPOS)) {
    if (typos.includes(domain)) {
      return correctDomain;
    }
  }
  return null;
};

/**
 * Analyse comportementale pour détecter les comptes suspects
 */
const analyzeSuspiciousBehavior = (email: string): { isSuspicious: boolean; reason?: string } => {
  const localPart = email.split('@')[0];
  
  // Détecter les séquences numériques très longues (8+ chiffres consécutifs)
  const longNumericRegex = /\d{8,}/;
  if (longNumericRegex.test(localPart)) {
    return { isSuspicious: true, reason: "Adresse email suspecte (séquence numérique trop longue)" };
  }
  
  // Détecter les patterns de bot (combinaisons répétitives)
  const botPatternRegex = /^[a-z]{1,3}\d{6,}$|^[a-z]+\d+[a-z]+\d+$/;
  if (botPatternRegex.test(localPart)) {
    return { isSuspicious: true, reason: "Adresse email suspecte (pattern automatisé détecté)" };
  }
  
  // Détecter les caractères répétés excessifs
  const excessiveRepeatRegex = /(.)\1{5,}/;
  if (excessiveRepeatRegex.test(localPart)) {
    return { isSuspicious: true, reason: "Adresse email suspecte (caractères répétés excessifs)" };
  }
  
  return { isSuspicious: false };
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
