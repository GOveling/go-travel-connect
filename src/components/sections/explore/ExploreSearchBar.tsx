
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExploreSearchBarProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

const ExploreSearchBar = ({ searchTerm, setSearchTerm }: ExploreSearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <Input
        placeholder="Search destinations, attractions..."
        className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500"
        value={searchTerm || ""}
        onChange={(e) => setSearchTerm?.(e.target.value)}
      />
      <Button size="sm" className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-orange-500">
        <Filter size={16} />
      </Button>
    </div>
  );
};

export default ExploreSearchBar;
