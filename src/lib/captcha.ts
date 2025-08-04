// src/lib/captcha.ts

export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Utilisation d'une variable d'environnement sécurisée

  if (!secretKey) {
    console.error('La clé secrète reCAPTCHA est manquante dans les variables d\'environnement.');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    return data.success;
  } catch (error) {
    console.error('Erreur lors de la vérification du CAPTCHA :', error);
    return false;
  }
}