import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Trophy, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTravelStatsDetails, VisitedPlace, VisitedCountry, VisitedCity, Achievement } from "@/hooks/useTravelStatsDetails";

interface TravelStatsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "places" | "countries" | "cities" | "achievements";
  title: string;
}

const TravelStatsDetailModal = ({ isOpen, onClose, type, title }: TravelStatsDetailModalProps) => {
  const { loading, fetchVisitedPlaces, fetchVisitedCountries, fetchVisitedCities, fetchAchievements } = useTravelStatsDetails();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        let result: any[] = [];
        switch (type) {
          case "places":
            result = await fetchVisitedPlaces();
            break;
          case "countries":
            result = await fetchVisitedCountries();
            break;
          case "cities":
            result = await fetchVisitedCities();
            break;
          case "achievements":
            result = await fetchAchievements();
            break;
        }
        setData(result);
      };
      fetchData();
    }
  }, [isOpen, type, fetchVisitedPlaces, fetchVisitedCountries, fetchVisitedCities, fetchAchievements]);

  const renderPlaces = (places: VisitedPlace[]) => (
    <div className="space-y-3">
      {places.map((place) => (
        <div key={place.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium">{place.place_name}</h4>
            </div>
            {place.place_category && (
              <Badge variant="outline" className="text-xs">
                {place.place_category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(place.visited_at), "dd/MM/yyyy HH:mm", { locale: es })}</span>
            </div>
            <div>Trip: {place.trip_name}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Confirmado a {place.confirmation_distance.toFixed(0)}m de distancia
          </div>
        </div>
      ))}
    </div>
  );

  const renderCountries = (countries: VisitedCountry[]) => (
    <div className="space-y-3">
      {countries.map((country) => (
        <div key={country.country} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-600" />
            <h4 className="font-medium">{country.country}</h4>
            <Badge variant="secondary" className="ml-auto">
              {country.visit_count} visita{country.visit_count !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>Primera visita: {format(new Date(country.first_visit), "dd/MM/yyyy", { locale: es })}</div>
            <div>Última visita: {format(new Date(country.last_visit), "dd/MM/yyyy", { locale: es })}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCities = (cities: VisitedCity[]) => (
    <div className="space-y-3">
      {cities.map((city) => (
        <div key={`${city.city}-${city.country}`} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <h4 className="font-medium">{city.city}</h4>
            <span className="text-sm text-muted-foreground">({city.country})</span>
            <Badge variant="secondary" className="ml-auto">
              {city.visit_count} visita{city.visit_count !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>Primera visita: {format(new Date(city.first_visit), "dd/MM/yyyy", { locale: es })}</div>
            <div>Última visita: {format(new Date(city.last_visit), "dd/MM/yyyy", { locale: es })}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAchievements = (achievements: Achievement[]) => (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <div key={achievement.achievement_id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div>
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                className={achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : ''}
              >
                {achievement.points} pts
              </Badge>
              <Badge variant="outline" className="text-xs">
                {achievement.category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Conseguido el {format(new Date(achievement.earned_at), "dd/MM/yyyy", { locale: es })}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay datos disponibles para mostrar</p>
        </div>
      );
    }

    switch (type) {
      case "places":
        return renderPlaces(data as VisitedPlace[]);
      case "countries":
        return renderCountries(data as VisitedCountry[]);
      case "cities":
        return renderCities(data as VisitedCity[]);
      case "achievements":
        return renderAchievements(data as Achievement[]);
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TravelStatsDetailModal;