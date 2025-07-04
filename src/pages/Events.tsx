
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventsWaitlistForm from '@/components/Events/EventsWaitlistForm';
import BackgroundImageSlider from '@/components/Events/BackgroundImageSlider';
import { Calendar, Clock, Users, Star } from 'lucide-react';

const Events = () => {
  return (
    <>
      <Helmet>
        <title>Événements Spéciaux - Yamo</title>
        <meta name="description" content="Découvrez nos événements spéciaux exclusifs. Inscrivez-vous à notre liste d'attente pour être parmi les premiers informés de nos événements à venir." />
        <meta name="keywords" content="événements, soirées exclusives, événements adultes, Yamo événements" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section with Background Slider */}
          <section className="relative py-20 px-4 overflow-hidden">
            {/* Background Image Slider */}
            <BackgroundImageSlider />
            
            <div className="container mx-auto text-center max-w-4xl relative z-10">
              <div className="mb-8">
                <Calendar className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-gold">
                  Événements Spéciaux
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                  Des expériences uniques et exclusives arrivent bientôt
                </p>
              </div>
            </div>
          </section>

          {/* Under Development Section */}
          <section className="py-16 px-4 relative">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-6">Section en développement</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Nous travaillons actuellement sur quelque chose d'extraordinaire pour vous. 
                  Notre équipe prépare des événements exclusifs qui transformeront votre expérience sur Yamo.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="flex flex-col items-center p-6">
                    <Users className="w-8 h-8 mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Événements exclusifs</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Rencontres privées et expériences premium
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-6">
                    <Star className="w-8 h-8 mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Accès VIP</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Priorité d'accès aux événements les plus demandés
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-6">
                    <Calendar className="w-8 h-8 mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Programmation unique</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Des événements soigneusement sélectionnés
                    </p>
                  </div>
                </div>

                <EventsWaitlistForm />
              </div>
            </div>
          </section>

          {/* Coming Soon Features */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-8">Ce qui vous attend</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Soirées thématiques</h3>
                  <p className="text-muted-foreground">
                    Des événements organisés autour de thèmes spécifiques pour des expériences inoubliables.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Rencontres premium</h3>
                  <p className="text-muted-foreground">
                    Des opportunités exclusives de rencontres dans un cadre privilégié et discret.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Événements privés</h3>
                  <p className="text-muted-foreground">
                    Des rassemblements intimes réservés aux membres les plus actifs de la communauté.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Expériences sur mesure</h3>
                  <p className="text-muted-foreground">
                    Des événements personnalisés selon vos préférences et centres d'intérêt.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Events;
