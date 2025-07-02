
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

const AuthCard = ({ title, description, children, showLogo = true }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md mx-auto">
      {showLogo && (
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center shadow-lg interactive-hover">
              <span className="text-black font-bold text-2xl select-none">Y</span>
            </div>
          </div>
          <h1 className="heading-md mb-2">Yamo</h1>
          <p className="body-md">Plateforme de petites annonces</p>
        </div>
      )}

      <Card className="card-elevated bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="heading-sm">{title}</CardTitle>
          <CardDescription className="body-sm">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;
