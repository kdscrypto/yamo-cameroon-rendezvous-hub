
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="flex-1 max-w-2xl mx-8 hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher des annonces..."
          className="w-full pl-10 pr-4 py-2 bg-muted/50 border-muted-foreground/20 focus:border-amber-500 focus:ring-amber-500/20 rounded-full"
        />
      </div>
    </div>
  );
};

export default SearchBar;
