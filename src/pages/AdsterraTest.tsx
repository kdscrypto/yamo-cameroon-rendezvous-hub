import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdsterraSystemCheck from '@/components/ads/AdsterraSystemCheck';
import AdsterraPreDeploymentChecklist from '@/components/ads/AdsterraPreDeploymentChecklist';
import AdsterraVerification from '@/components/ads/AdsterraVerification';
import AdsterraAutoFix from '@/components/ads/AdsterraAutoFix';
import AdsterraSystemFix from '@/components/ads/AdsterraSystemFix';
import LiveAdsterraTest from '@/components/ads/LiveAdsterraTest';
import AdsterraTestBanners from '@/components/ads/AdsterraTestBanners';
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

          <Tabs defaultValue="systemfix" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="systemfix">🚀 Réparation système</TabsTrigger>
              <TabsTrigger value="testbanners">🎯 Bannières de test</TabsTrigger>
              <TabsTrigger value="livetest">📺 Test en direct</TabsTrigger>
              <TabsTrigger value="checklist">✅ Checklist</TabsTrigger>
              <TabsTrigger value="autofix">🔧 Auto-fix</TabsTrigger>
              <TabsTrigger value="diagnostic">🔍 Diagnostic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="systemfix" className="mt-6">
              <AdsterraSystemFix />
            </TabsContent>
            
            <TabsContent value="testbanners" className="mt-6">
              <AdsterraTestBanners />
            </TabsContent>
            
            <TabsContent value="livetest" className="mt-6">
              <LiveAdsterraTest />
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-6">
              <AdsterraPreDeploymentChecklist />
            </TabsContent>
            
            <TabsContent value="autofix" className="mt-6">
              <AdsterraAutoFix />
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