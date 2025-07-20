import * as React from 'react';

const SimpleFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Yamo
            </span>
          </div>
          <p className="text-muted-foreground">
            Plateforme d'annonces sécurisée au Cameroun
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;