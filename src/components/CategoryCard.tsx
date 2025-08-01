
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  backgroundImage?: string;
}

const CategoryCard = ({ title, description, icon: Icon, href, gradient, backgroundImage }: CategoryCardProps) => {
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

  const cardStyle = backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <Link 
      to={destinationUrl}
      className="group block bg-card hover:bg-card/80 rounded-lg border border-border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 relative overflow-hidden"
      style={cardStyle}
    >
      <div className={`w-12 h-12 rounded-lg gradient-luxe flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-yellow-400 transition-colors relative z-10">
        {title}
      </h3>
      <p className="text-white/90 group-hover:text-white transition-colors relative z-10">
        {description}
      </p>
    </Link>
  );
};

export default CategoryCard;
