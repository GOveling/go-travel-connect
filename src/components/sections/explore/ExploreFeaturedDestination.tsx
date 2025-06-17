
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExploreFeaturedDestinationProps {
  onPlaceClick: (place: any) => void;
}

const ExploreFeaturedDestination = ({ onPlaceClick }: ExploreFeaturedDestinationProps) => {
  const nearbyPlace = {
    name: "Parque Central",
    location: "Ciudad de México",
    rating: 4.5,
    image: "🌳",
    category: "Parks",
    description: "Un hermoso parque urbano cerca de tu ubicación actual. Perfecto para caminar, hacer ejercicio y disfrutar de la naturaleza en la ciudad.",
    hours: "6:00 AM - 10:00 PM",
    website: "www.parquecentral.mx",
    phone: "+52 55 1234-5678",
    lat: 19.4326,
    lng: -99.1332
  };

  return (
    <Card 
      className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => onPlaceClick(nearbyPlace)}
    >
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-3xl">📍</span>
          <div>
            <h3 className="text-xl font-bold">Lugares Cercanos</h3>
            <p className="text-sm opacity-90">Recomendados para ti</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Explora lugares recomendados cercanos a tu ubicación
        </p>
        <Button variant="secondary" size="sm">
          Explorar Ahora
        </Button>
      </div>
    </Card>
  );
};

export default ExploreFeaturedDestination;
