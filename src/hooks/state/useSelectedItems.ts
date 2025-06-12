
import { useState } from "react";
import { Trip, ProfilePost } from "@/types";

export const useSelectedItems = () => {
  const [selectedTripForPhotobook, setSelectedTripForPhotobook] = useState<Trip | null>(null);
  const [selectedPostForTrip, setSelectedPostForTrip] = useState<ProfilePost | null>(null);

  return {
    selectedTripForPhotobook,
    setSelectedTripForPhotobook,
    selectedPostForTrip,
    setSelectedPostForTrip,
  };
};
