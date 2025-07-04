
import CategoryCard from '@/components/CategoryCard';

const CategoriesSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Nos catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CategoryCard
            title="Rencontres"
            description="Rencontres discrètes, escorts, accompagnatrices"
            imageUrl="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop"
            href="/rencontres"
            gradient="gradient-gold"
          />
          <CategoryCard
            title="Massages"
            description="Massages relaxants, thérapeutiques et bien-être"
            imageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop"
            href="/massages"
            gradient="gradient-luxe"
          />
          <CategoryCard
            title="Produits adultes"
            description="Accessoires, lingerie et produits intimes"
            imageUrl="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop"
            href="/produits"
            gradient="gradient-accent"
          />
          <CategoryCard
            title="Nos Événements Spéciaux"
            description="Événements exclusifs et occasions spéciales"
            imageUrl="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=400&fit=crop"
            href="/events"
            gradient="bg-gradient-to-br from-red-500 to-orange-400"
          />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
