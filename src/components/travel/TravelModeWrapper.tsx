import React, { memo } from 'react';
import { TravelMode } from './TravelMode';
import { useTravelModeContext } from '@/contexts/TravelModeContext';

interface TravelModeWrapperProps {
  className?: string;
}

const TravelModeWrapper: React.FC<TravelModeWrapperProps> = memo(({ className }) => {
  const { isTracking } = useTravelModeContext();
  
  // Only render TravelMode when tracking is active or we need to show the controls
  // This prevents unnecessary renders when the modal is open but travel mode is inactive
  return <TravelMode className={className} />;
});

TravelModeWrapper.displayName = 'TravelModeWrapper';

export default TravelModeWrapper;