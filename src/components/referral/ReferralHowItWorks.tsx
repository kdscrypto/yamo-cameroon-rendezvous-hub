
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ReferralHowItWorks = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment fonctionne le parrainage ?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">1</Badge>
          <div>
            <h4 className="font-medium">Parrainage direct</h4>
            <p className="text-sm text-muted-foreground">
              Quand quelqu'un s'inscrit avec votre code, vous gagnez <strong>2 points</strong>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge className="bg-green-100 text-green-800 flex-shrink-0">2</Badge>
          <div>
            <h4 className="font-medium">Parrainage indirect</h4>
            <p className="text-sm text-muted-foreground">
              Quand vos filleuls parrainent à leur tour, vous gagnez <strong>1 point</strong> supplémentaire
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge className="bg-amber-100 text-amber-800 flex-shrink-0">🎁</Badge>
          <div>
            <h4 className="font-medium">Récompenses</h4>
            <p className="text-sm text-muted-foreground">
              Plus vous parrainez, plus vous débloquez d'avantages exclusifs !
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralHowItWorks;
