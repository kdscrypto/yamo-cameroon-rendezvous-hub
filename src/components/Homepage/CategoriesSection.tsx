
import { Users, Heart, Settings, Calendar } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';

const CategoriesSection = () => {
  return (
    <section className="py-16 px-4 bg-neutral-900">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Nos catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CategoryCard
            title="Rencontres"
            description="Rencontres discrètes, escorts, accompagnatrices"
            icon={Users}
            href="/rencontres"
            gradient="gradient-gold"
            backgroundImage="/images/categories/rencontres.jpg"
          />
          <CategoryCard
            title="Massages"
            description="Massages relaxants, thérapeutiques et bien-être"
            icon={Heart}
            href="/massages"
            gradient="gradient-luxe"
            backgroundImage="/images/categories/massages.jpg"
          />
          <CategoryCard
            title="Produits adultes"
            description="Accessoires, lingerie et produits intimes"
            icon={Settings}
            href="/produits"
            gradient="gradient-accent"
            backgroundImage="/images/categories/produits.jpg"
          />
          <CategoryCard
            title="Événements Spéciaux"
            description="Événements exclusifs et occasions spéciales"
            icon={Calendar}
            href="/events"
            gradient="bg-gradient-to-br from-red-500 to-orange-400"
            backgroundImage="/images/categories/evenements.jpg"
          />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
