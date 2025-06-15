
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardStats from '@/components/dashboard/DashboardStats';
import UserAds from '@/components/dashboard/UserAds';
import UserMessages from '@/components/dashboard/UserMessages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
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
          <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
          
          <DashboardStats />
          
          <Tabs defaultValue="ads" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ads">Mes annonces</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ads" className="mt-6">
              <UserAds />
            </TabsContent>
            
            <TabsContent value="messages" className="mt-6">
              <UserMessages />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
