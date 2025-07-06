
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const CreateAdSidebar = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-400">
            <Star className="w-5 h-5 text-primary mr-2" />
            Avantages VIP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <h4 className="font-medium text-primary mb-2">VIP 24h - 500 FCFA</h4>
              <ul className="text-sm space-y-1 text-white">
                <li>✅ Affichage prioritaire 24h</li>
                <li>✅ Badge VIP visible</li>
                <li>✅ 3x plus de vues</li>
              </ul>
            </div>
            
            <div className="p-3 bg-primary/10 rounded-lg">
              <h4 className="font-medium text-primary mb-2">VIP 7 jours - 2,500 FCFA</h4>
              <ul className="text-sm space-y-1 text-white">
                <li>✅ Affichage prioritaire 7 jours</li>
                <li>✅ Badge VIP visible</li>
                <li>✅ 5x plus de vues</li>
                <li>✅ Support prioritaire</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-yellow-400">Conseils pour une bonne annonce</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-white">
          <p>• Utilisez un titre accrocheur</p>
          <p>• Décrivez précisément vos services</p>
          <p>• Ajoutez des photos de qualité</p>
          <p>• Indiquez vos tarifs clairement</p>
          <p>• Ajoutez votre WhatsApp pour plus de contacts</p>
          <p>• Respectez les règles de la plateforme</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdSidebar;
