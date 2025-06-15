
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
  return (
    <Link 
      to={href}
      className="group block bg-white hover:bg-white/80 rounded-xl border border-gray-200 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
    >
      <div className={`w-14 h-14 rounded-xl gradient-stripe flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
        {description}
      </p>
    </Link>
  );
};

export default CategoryCard;
