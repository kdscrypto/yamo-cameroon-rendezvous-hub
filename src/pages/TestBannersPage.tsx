import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdsterraBanner from '@/components/AdsterraBanner';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TestBannersPage = () => {
  return (
    <>
      <SEO 
        title="Test des bannières Adsterra"
        description="Page de test pour vérifier le bon fonctionnement des bannières publicitaires Adsterra"
        url="/test-banners"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Test des bannières Adsterra</h1>
            <p className="text-muted-foreground">
              Cette page permet de tester l'affichage et le chargement des différents formats de bannières
            </p>
          </div>

          <div className="space-y-8">
            {/* Bannière Header */}
            <Card>
              <CardHeader>
                <CardTitle>Bannière Header (728x90)</CardTitle>
                <CardDescription>Format leaderboard standard pour l'en-tête</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AdsterraBanner 
                  slot="BANNER_728x90"
                />
              </CardContent>
            </Card>

            {/* Bannière rectangulaire - Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Rectangle Sidebar (300x250)</CardTitle>
                <CardDescription>Format rectangle moyen pour les barres latérales</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AdsterraBanner 
                  slot="SIDEBAR_RECTANGLE"
                />
              </CardContent>
            </Card>

            {/* Bannière de contenu */}
            <Card>
              <CardHeader>
                <CardTitle>Rectangle Contenu (336x280)</CardTitle>
                <CardDescription>Format rectangle large pour l'intégration dans le contenu</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AdsterraBanner 
                  slot="CONTENT_RECTANGLE"
                />
              </CardContent>
            </Card>

            {/* Bannière Footer */}
            <Card>
              <CardHeader>
                <CardTitle>Bannière Footer (728x90)</CardTitle>
                <CardDescription>Format leaderboard pour le pied de page</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AdsterraBanner 
                  slot="FOOTER_BANNER"
                />
              </CardContent>
            </Card>

            {/* Bannière Mobile */}
            <Card>
              <CardHeader>
                <CardTitle>Bannière Mobile (320x50)</CardTitle>
                <CardDescription>Format optimisé pour les appareils mobiles</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AdsterraBanner 
                  slot="MOBILE_BANNER"
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Instructions de test :</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Vérifiez que chaque bannière se charge correctement</li>
              <li>• Observez les temps de chargement (doivent être &lt; 5 secondes)</li>
              <li>• Testez sur différentes tailles d'écran</li>
              <li>• Vérifiez la console pour les erreurs JavaScript</li>
              <li>• Assurez-vous que les clés Adsterra sont uniques pour chaque emplacement</li>
            </ul>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TestBannersPage;