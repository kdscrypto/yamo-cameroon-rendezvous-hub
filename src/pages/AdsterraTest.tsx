import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdsterraSystemCheck from '@/components/ads/AdsterraSystemCheck';
import AdsterraPreDeploymentChecklist from '@/components/ads/AdsterraPreDeploymentChecklist';
import AdsterraVerification from '@/components/ads/AdsterraVerification';
import AdsterraAutoFix from '@/components/ads/AdsterraAutoFix';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdsterraTest = () => {
  return (
    <>
      <SEO 
        title="Test système Adsterra - Vérification complète"
        description="Page de test et vérification du système Adsterra"
        url="/adsterra-test"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Test système Adsterra</h1>
            <p className="text-muted-foreground">
              Diagnostic et vérifications pré-déploiement
            </p>
          </div>

          <Tabs defaultValue="autofix" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="autofix">Correction automatique</TabsTrigger>
              <TabsTrigger value="checklist">Checklist pré-déploiement</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostic système</TabsTrigger>
            </TabsList>
            
            <TabsContent value="autofix" className="mt-6">
              <AdsterraAutoFix />
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-6">
              <AdsterraPreDeploymentChecklist />
            </TabsContent>
            
            <TabsContent value="diagnostic" className="mt-6">
              <AdsterraSystemCheck />
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
        <AdsterraVerification />
      </div>
    </>
  );
};

export default AdsterraTest;