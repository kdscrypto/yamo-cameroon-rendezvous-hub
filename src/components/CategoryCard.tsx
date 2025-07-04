
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  imageUrl?: string;
  href: string;
  gradient: string;
}

const CategoryCard = ({ title, description, icon: Icon, imageUrl, href, gradient }: CategoryCardProps) => {
  // Map category paths to filter parameters or direct routes
  const getDestinationUrl = (href: string) => {
    const routeMap: { [key: string]: string } = {
      '/rencontres': '/browse?category=rencontres',
      '/massages': '/browse?category=massages', 
      '/produits': '/browse?category=produits',
      '/events': '/events', // Direct route to events page
      '/evenements': '/events' // Also handle /evenements directly
    };
    return routeMap[href] || href;
  };

  const destinationUrl = getDestinationUrl(href);

  return (
    <Link 
      to={destinationUrl}
      className="group block bg-card hover:bg-card/80 rounded-lg border border-border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden mb-4 group-hover:scale-110 transition-transform">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : Icon ? (
          <div className={`w-full h-full gradient-luxe flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        ) : null}
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
    </Link>
  );
};

export default CategoryCard;
