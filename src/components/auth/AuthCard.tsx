
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

const AuthCard = ({ title, description, children, showLogo = true }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md mx-auto animate-slide-up px-4 sm:px-0">
      {showLogo && (
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-18 sm:h-18 gradient-luxe rounded-2xl flex items-center justify-center shadow-strong transform hover:scale-105 transition-all duration-300 animate-scale-in">
              <span className="text-black font-bold text-2xl sm:text-3xl select-none">Y</span>
            </div>
          </div>
          <h1 className="heading-md mb-2 sm:mb-3 text-gradient-luxe">Yamo</h1>
          <p className="body-sm sm:body-md opacity-80">Plateforme de petites annonces</p>
        </div>
      )}

      <Card className="card-elevated bg-card/98 backdrop-blur-md border-border/50 shadow-strong hover:shadow-primary/10 transition-all duration-300 animate-scale-in">
        <CardHeader className="text-center pb-4 sm:pb-6 space-y-2 sm:space-y-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="heading-sm text-gradient-accent text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="body-sm opacity-80 text-sm">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;
