import React from 'react';
import { PlaceArrivalModal } from '@/components/modals/PlaceArrivalModal';
import { useTravelModeContext } from '@/contexts/TravelModeContext';
import { useVisitConfirmation } from '@/hooks/useVisitConfirmation';
import { useVisitRewards } from '@/hooks/useVisitRewards';

export const PlaceArrivalHandler: React.FC = () => {
  const { 
    showArrivalModal, 
    arrivalPlace, 
    setShowArrivalModal,
    currentPosition 
  } = useTravelModeContext();
  
  const { confirmVisit, isConfirming } = useVisitConfirmation();
  const { processVisitRewards } = useVisitRewards();

  const handleConfirmVisit = async () => {
    if (!arrivalPlace || !currentPosition) {
      console.error('Missing arrival place or current position');
      return;
    }

    try {
      console.log('🎯 Confirming visit to:', arrivalPlace.name);
      
      // Confirm the visit in the database
      const result = await confirmVisit({
        savedPlaceId: arrivalPlace.id,
        distance: arrivalPlace.distance,
        userLat: currentPosition.lat,
        userLng: currentPosition.lng,
      });

      if (result.success) {
        // Process rewards and achievements
        await processVisitRewards({
          placeName: arrivalPlace.name,
          category: arrivalPlace.category,
          country: arrivalPlace.country,
          city: arrivalPlace.city,
        });

        console.log('✅ Visit confirmed and rewards processed');
      } else {
        console.error('❌ Failed to confirm visit:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error confirming visit:', error);
    }
  };

  const handleCloseModal = () => {
    setShowArrivalModal(false);
  };

  if (!showArrivalModal || !arrivalPlace) {
    return null;
  }

  // Transform arrivalPlace data for the modal
  const placeData = {
    id: arrivalPlace.id,
    name: arrivalPlace.name,
    category: arrivalPlace.category,
    image: arrivalPlace.image,
    distance: Math.round(arrivalPlace.distance),
    address: arrivalPlace.formatted_address,
    rating: arrivalPlace.rating,
  };

  return (
    <PlaceArrivalModal
      isOpen={showArrivalModal}
      onClose={handleCloseModal}
      onConfirmVisit={handleConfirmVisit}
      place={placeData}
      loading={isConfirming}
    />
  );
};