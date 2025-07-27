import React from 'react';
import { generateBreadcrumbStructuredData } from '@/utils/seoOptimizations';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const structuredData = generateBreadcrumbStructuredData(items);

  return (
    <>
      {/* Structured data for breadcrumbs */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Visual breadcrumbs */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <React.Fragment key={item.url}>
              {index > 0 && <li>•</li>}
              <li>
                {index === items.length - 1 ? (
                  <span className="text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a 
                    href={item.url} 
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </a>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;