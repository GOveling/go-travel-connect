
import { useState, useEffect } from "react";
import { Trip } from "@/types";
import { initialTripsData } from "../data/mockTripsData";

export const useHomeData = () => {
  const [trips, setTrips] = useState<Trip[]>(initialTripsData);

  return {
    trips,
    setTrips,
  };
};
