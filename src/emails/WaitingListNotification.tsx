// src/emails/WaitingListNotification.tsx
import React from 'react';

interface EmailTemplateProps {
  userName?: string;
}

export const WaitingListNotification: React.FC<Readonly<EmailTemplateProps>> = ({ userName }) => (
  <div>
    <h1>Bonjour {userName || ''},</h1>
    <p>
      Bonne nouvelle ! Nous confirmons que votre inscription sur notre liste d'attente pour les événements spéciaux a bien été prise en compte,  toutefois vous  êtes priez de confirmer vos informations notamment : le Genre, la ville, pseudonyme Telegram .
    </p>
    <p>
      Vous serez parmi les premiers informés dès qu'une nouvelle opportunité se présentera.
    </p>
    <p>
      Merci de votre confiance.
    </p>
    <p>
      Cordialement,<br />
      L'équipe Yamo
    </p>
  </div>
);

export default WaitingListNotification;