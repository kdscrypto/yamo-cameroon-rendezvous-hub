
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserAds from '@/components/dashboard/UserAds';
import RealTimeMessages from '@/components/dashboard/RealTimeMessages';
import AdContainer from '@/components/ads/AdContainer';
import AdBanner from '@/components/ads/AdBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoogleAds } from '@/hooks/useGoogleAds';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { refreshAds } = useGoogleAds();

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

          {/* Sidebar Ad for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            
            {/* Sidebar with ads - hidden on mobile */}
            <div className="hidden lg:block space-y-6">
              <AdContainer variant="bordered" title="Sponsorisé">
                <AdBanner placement="sidebar" />
              </AdContainer>
              
              <AdContainer variant="subtle" title="Publicité">
                <AdBanner placement="sidebar" />
              </AdContainer>
            </div>
          </div>

          {/* Mobile ad banner */}
          <div className="lg:hidden mt-6">
            <AdContainer variant="subtle">
              <AdBanner placement="content" />
            </AdContainer>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
