import { generateStructuredData } from '@/utils/seoOptimizations';

interface DynamicSEOProps {
  pageType: 'homepage' | 'ad' | 'category' | 'search';
  data?: any;
  children?: React.ReactNode;
}

const DynamicSEO = ({ pageType, data = {}, children }: DynamicSEOProps) => {
  const structuredData = generateStructuredData(pageType, data);

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
};

export default DynamicSEO;