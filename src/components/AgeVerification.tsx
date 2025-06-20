
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AgeVerificationProps {
  onConfirm: () => void;
}

const AgeVerification = ({ onConfirm }: AgeVerificationProps) => {
  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-2xl">Y</span>
            </div>
            <span className="text-3xl font-bold text-gradient-gold">amo</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Ceci est un site web destiné aux adultes
        </h1>

        {/* Description */}
        <div className="text-lg text-muted-foreground space-y-4 max-w-4xl mx-auto leading-relaxed">
          <p>
            Ce site Web contient du matériel avec des restrictions d'âge, y compris de la nudité 
            et des représentations explicites de l'activité sexuelle. En vous inscrivant, vous 
            affirmez que vous avez au moins 18 ans ou l'âge de la majorité dans la juridiction à 
            partir de laquelle vous accédez au site Web et que vous consentez à visionner du 
            contenu sexuellement explicite.
          </p>
        </div>

        {/* Buttons - Correction des couleurs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button 
            onClick={onConfirm}
            size="lg"
            className="gradient-gold text-black hover:opacity-90 px-8 py-4 text-lg font-semibold border-0"
          >
            J'ai 18 ans ou plus - Entrer
          </Button>
          
          <Button 
            onClick={handleExit}
            variant="outline"
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-black px-8 py-4 text-lg font-semibold bg-transparent"
          >
            J'ai moins de 18 ans - Sortir
          </Button>
        </div>

        {/* Footer text */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            Notre <span className="text-primary underline cursor-pointer">page sur le contrôle parental</span> explique 
            comment vous pouvez facilement bloquer l'accès à ce site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
