
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
}

const CategoryCard = ({ title, description, icon: Icon, href, gradient }: CategoryCardProps) => {
  // Map category paths to filter parameters or direct routes
  const getDestinationUrl = (href: string) => {
    const routeMap: { [key: string]: string } = {
      '/rencontres': '/browse?category=rencontres',
      '/massages': '/browse?category=massages', 
      '/produits': '/browse?category=produits',
      '/evenements': '/events', // Direct route to events page
      '/events': '/events' // Also handle /events directly
    };
    return routeMap[href] || href;
  };

  const destinationUrl = getDestinationUrl(href);

  return (
    <Link 
      to={destinationUrl}
      className="group block bg-card hover:bg-card/80 rounded-lg border border-border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className={`w-12 h-12 rounded-lg gradient-luxe flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
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
