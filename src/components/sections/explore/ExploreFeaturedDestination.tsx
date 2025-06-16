
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExploreFeaturedDestinationProps {
  onPlaceClick: (place: any) => void;
}

const ExploreFeaturedDestination = ({ onPlaceClick }: ExploreFeaturedDestinationProps) => {
  const maldivesPlace = {
    name: "Maldives",
    location: "Indian Ocean",
    rating: 4.9,
    image: "🏝️",
    category: "Beach",
    description: "A tropical paradise consisting of 1,192 coral islands grouped in 26 atolls. Known for crystal clear waters, pristine beaches, and luxury overwater bungalows.",
    hours: "24/7 (Island Nation)",
    website: "www.visitmaldives.com",
    phone: "+960 330-3224",
    lat: 3.2028,
    lng: 73.2207
  };

  return (
    <Card 
      className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => onPlaceClick(maldivesPlace)}
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-3xl">🏝️</span>
          <div>
            <h3 className="text-xl font-bold">Maldives</h3>
            <p className="text-sm opacity-90">Featured Destination</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Paradise islands with crystal clear waters and overwater bungalows
        </p>
        <Button variant="secondary" size="sm">
          Explore Now
        </Button>
      </div>
    </Card>
  );
};

export default ExploreFeaturedDestination;
