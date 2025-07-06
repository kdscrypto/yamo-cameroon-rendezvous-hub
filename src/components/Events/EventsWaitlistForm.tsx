
import React from 'react';
import { Button } from '@/components/ui/button';
import WaitlistFormFields from './WaitlistForm/WaitlistFormFields';
import WaitlistSuccessState from './WaitlistForm/WaitlistSuccessState';
import { useWaitlistForm } from './WaitlistForm/useWaitlistForm';

const EventsWaitlistForm = () => {
  const {
    email,
    setEmail,
    pseudonym,
    setPseudonym,
    gender,
    setGender,
    telegramUsername,
    setTelegramUsername,
    city,
    setCity,
    isSubmitting,
    isSuccess,
    setIsSuccess,
    handleSubmit
  } = useWaitlistForm();

  if (isSuccess) {
    return (
      <WaitlistSuccessState 
        onAddAnother={() => setIsSuccess(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 text-yellow-400">Rejoignez notre liste d'attente</h3>
        <p className="text-white">
          Soyez parmi les premiers informés du lancement de nos événements exclusifs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <WaitlistFormFields
          email={email}
          setEmail={setEmail}
          pseudonym={pseudonym}
          setPseudonym={setPseudonym}
          gender={gender}
          setGender={setGender}
          telegramUsername={telegramUsername}
          setTelegramUsername={setTelegramUsername}
          city={city}
          setCity={setCity}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          {isSubmitting ? 'Inscription en cours...' : 'Rejoindre la liste d\'attente'}
        </Button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        En vous inscrivant, vous acceptez de recevoir des notifications concernant nos événements spéciaux. 
        Vous pourrez vous désinscrire à tout moment.
      </p>
    </div>
  );
};

export default EventsWaitlistForm;
