
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserAds from '@/components/dashboard/UserAds';
import RealTimeMessages from '@/components/dashboard/RealTimeMessages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdSense } from '@/hooks/useAdSense';
import LazyAdWrapper from '@/components/AdSense/LazyAdWrapper';
import RectangleAd from '@/components/AdSense/RectangleAd';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isLoaded: adSenseLoaded } = useAdSense();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient-luxe">Tableau de bord</h1>
            <p className="text-muted-foreground">Gérez vos annonces et messages depuis votre espace personnel</p>
          </div>

          {/* Top Ad */}
          {adSenseLoaded && (
            <LazyAdWrapper className="mb-8">
              <RectangleAd adSlot="1234567902" />
            </LazyAdWrapper>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="ads" className="mt-8">
                <TabsList className="grid w-full grid-cols-2 bg-secondary">
                  <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Mes annonces
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Messages
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ads" className="mt-6">
                  <UserAds />
                </TabsContent>
                
                <TabsContent value="messages" className="mt-6">
                  <RealTimeMessages />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar with Ads */}
            <div className="lg:col-span-1">
              {adSenseLoaded && (
                <div className="sticky top-4 space-y-8">
                  <LazyAdWrapper>
                    <RectangleAd adSlot="1234567903" />
                  </LazyAdWrapper>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
