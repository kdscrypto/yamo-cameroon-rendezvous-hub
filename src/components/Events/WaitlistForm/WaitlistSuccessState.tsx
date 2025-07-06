
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface WaitlistSuccessStateProps {
  onAddAnother: () => void;
}

const WaitlistSuccessState = ({ onAddAnother }: WaitlistSuccessStateProps) => {
  return (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
      <h3 className="text-2xl font-bold mb-4 text-yellow-400">Inscription confirmée !</h3>
      <p className="text-white mb-6">
        Merci de votre intérêt ! Nous vous contacterons dès que nos événements spéciaux seront disponibles.
      </p>
      <Button 
        onClick={onAddAnother}
        variant="outline"
        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
      >
        Inscrire une autre personne
      </Button>
    </div>
  );
};

export default WaitlistSuccessState;
