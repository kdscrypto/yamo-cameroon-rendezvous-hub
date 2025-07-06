
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, User, MessageCircle, MapPin, Users } from 'lucide-react';

interface WaitlistFormFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  pseudonym: string;
  setPseudonym: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  telegramUsername: string;
  setTelegramUsername: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
}

const WaitlistFormFields = ({
  email,
  setEmail,
  pseudonym,
  setPseudonym,
  gender,
  setGender,
  telegramUsername,
  setTelegramUsername,
  city,
  setCity
}: WaitlistFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="pseudonym" className="flex items-center gap-2 mb-2 text-white">
          <User className="w-4 h-4" />
          Pseudonyme *
        </Label>
        <Input
          id="pseudonym"
          type="text"
          value={pseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          placeholder="Votre pseudonyme"
          required
          className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
        />
      </div>

      <div>
        <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-white">
          <Mail className="w-4 h-4" />
          Adresse email (optionnel)
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
        />
      </div>

      <div>
        <Label htmlFor="gender" className="flex items-center gap-2 mb-2 text-white">
          <Users className="w-4 h-4" />
          Genre *
        </Label>
        <Select value={gender} onValueChange={setGender} required>
          <SelectTrigger className="w-full bg-black/50 border-yellow-400/30 text-white focus:border-yellow-400">
            <SelectValue placeholder="Sélectionnez votre genre" />
          </SelectTrigger>
          <SelectContent className="bg-black border-yellow-400/30">
            <SelectItem value="homme" className="text-white hover:bg-yellow-400/20">Homme</SelectItem>
            <SelectItem value="femme" className="text-white hover:bg-yellow-400/20">Femme</SelectItem>
            <SelectItem value="couple" className="text-white hover:bg-yellow-400/20">Couple</SelectItem>
            <SelectItem value="autre" className="text-white hover:bg-yellow-400/20">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="telegramUsername" className="flex items-center gap-2 mb-2 text-white">
          <MessageCircle className="w-4 h-4" />
          Nom d'utilisateur Telegram *
        </Label>
        <Input
          id="telegramUsername"
          type="text"
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
          placeholder="@votre_nom_telegram"
          required
          className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
        />
      </div>

      <div>
        <Label htmlFor="city" className="flex items-center gap-2 mb-2 text-white">
          <MapPin className="w-4 h-4" />
          Ville *
        </Label>
        <Input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Votre ville"
          required
          className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
        />
      </div>
    </>
  );
};

export default WaitlistFormFields;
