
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchValue);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="flex-1 max-w-2xl mx-8">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher des annonces..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-12 py-2 bg-muted/50 border-muted-foreground/20 focus:border-amber-500 focus:ring-amber-500/20 rounded-full transition-all duration-200"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-muted rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
