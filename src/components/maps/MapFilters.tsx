import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { Calendar, Filter, RotateCcw, Users, ChevronDown } from "lucide-react";

interface MapFiltersProps {
  filters: {
    status: string[];
    isGroupTrip: boolean | null;
    dateRange: string;
    selectedTripId: string | null;
  };
  stats: {
    totalTrips: number;
    upcomingTrips: number;
    planningTrips: number;
    completedTrips: number;
    groupTrips: number;
    totalDestinations: number;
    totalSavedPlaces: number;
  };
  onToggleStatus: (status: string) => void;
  onUpdateFilters: (filters: any) => void;
  onResetFilters: () => void;
}

const MapFilters = ({
  filters,
  stats,
  onToggleStatus,
  onUpdateFilters,
  onResetFilters,
}: MapFiltersProps) => {
  const { t } = useLanguage();
  const statusOptions = [
    {
      value: "upcoming",
      label: t("trips.map.upcoming"),
      color: "bg-green-500",
      count: stats.upcomingTrips,
    },
    {
      value: "planning",
      label: t("trips.map.planning"),
      color: "bg-purple-600",
      count: stats.planningTrips,
    },
    {
      value: "completed",
      label: t("trips.map.completed"),
      color: "bg-gray-500",
      count: stats.completedTrips,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600" />
            <span className="font-medium">{t("trips.map.mapFilters")}</span>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 max-w-[90vw] p-0 bg-white border border-gray-200 shadow-lg rounded-lg z-50"
        align="start"
        sideOffset={4}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <DropdownMenuLabel className="text-base font-semibold p-0">
              {t("trips.map.mapFilters")}
            </DropdownMenuLabel>
            <Button
              size="sm"
              variant="ghost"
              onClick={onResetFilters}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              <RotateCcw size={14} className="mr-1" />
              {t("trips.map.clear")}
            </Button>
          </div>

          <DropdownMenuSeparator />

          {/* Status Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("trips.map.tripStatus")}
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.status.includes(option.value) ? "default" : "outline"
                  }
                  className={`cursor-pointer hover:opacity-80 flex-shrink-0 ${
                    filters.status.includes(option.value)
                      ? `${option.color} text-white`
                      : "border-gray-300"
                  }`}
                  onClick={() => onToggleStatus(option.value)}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${option.color}`}
                  ></div>
                  <span className="whitespace-nowrap">
                    {option.label} ({option.count})
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Group Trip Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("trips.map.tripType")}
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.isGroupTrip === null ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 flex-shrink-0"
                onClick={() => onUpdateFilters({ isGroupTrip: null })}
              >
                <span className="whitespace-nowrap">
                  {t("trips.map.allTypes")} ({stats.totalTrips})
                </span>
              </Badge>
              <Badge
                variant={filters.isGroupTrip === true ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 flex-shrink-0"
                onClick={() => onUpdateFilters({ isGroupTrip: true })}
              >
                <Users size={12} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {t("trips.map.groupTrips")} ({stats.groupTrips})
                </span>
              </Badge>
              <Badge
                variant={filters.isGroupTrip === false ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 flex-shrink-0"
                onClick={() => onUpdateFilters({ isGroupTrip: false })}
              >
                <span className="whitespace-nowrap">
                  {t("trips.map.individuals")} (
                  {stats.totalTrips - stats.groupTrips})
                </span>
              </Badge>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("trips.map.period")}
            </label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => onUpdateFilters({ dateRange: value })}
            >
              <SelectTrigger className="w-full">
                <Calendar size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all">Todos los tiempos</SelectItem>
                <SelectItem value="upcoming">Solo próximos</SelectItem>
                <SelectItem value="thisYear">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(filters.status.length !== 3 ||
            filters.isGroupTrip !== null ||
            filters.dateRange !== "all" ||
            filters.selectedTripId) && (
            <div className="pt-2 border-t">
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Mostrando{" "}
                  <span className="font-semibold">{stats.totalTrips}</span> viajes
                  con{" "}
                  <span className="font-semibold">{stats.totalDestinations}</span>{" "}
                  destinos
                </div>
                {stats.totalSavedPlaces > 0 && (
                  <div className="text-blue-600">
                    <span className="font-semibold">
                      {stats.totalSavedPlaces}
                    </span>{" "}
                    lugares guardados
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MapFilters;
