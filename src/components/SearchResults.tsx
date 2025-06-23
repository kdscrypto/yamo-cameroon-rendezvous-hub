
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdCard from '@/components/AdCard';
import { AdData } from '@/hooks/useSearch';
import { Search } from 'lucide-react';

interface SearchResultsProps {
  results: AdData[];
  query: string;
  totalResults: number;
  loading?: boolean;
}

const SearchResults = ({ results, query, totalResults, loading = false }: SearchResultsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Aucun résultat trouvé</h3>
        <p className="text-muted-foreground mb-4">
          {query ? (
            <>Aucune annonce ne correspond à votre recherche "<strong>{query}</strong>"</>
          ) : (
            'Aucune annonce ne correspond à vos critères de recherche'
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Essayez de modifier vos filtres ou utilisez des mots-clés différents
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </h2>
          {query && (
            <Badge variant="secondary" className="text-sm">
              "{query}"
            </Badge>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((ad) => (
          <AdCard key={ad.id} {...ad} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
