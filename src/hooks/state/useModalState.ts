import { useState } from "react";

export const useModalState = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [isInstaTripModalOpen, setIsInstaTripModalOpen] = useState(false);
  const [isProfilePublicationModalOpen, setIsProfilePublicationModalOpen] =
    useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isTripDetailModalOpen, setIsTripDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isFlightBookingModalOpen, setIsFlightBookingModalOpen] =
    useState(false);
  const [isManualFlightModalOpen, setIsManualFlightModalOpen] = useState(false);

  return {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    isAddMemoryModalOpen,
    setIsAddMemoryModalOpen,
    isInstaTripModalOpen,
    setIsInstaTripModalOpen,
    isProfilePublicationModalOpen,
    setIsProfilePublicationModalOpen,
    isNewTripModalOpen,
    setIsNewTripModalOpen,
    isAddToTripModalOpen,
    setIsAddToTripModalOpen,
    isTripDetailModalOpen,
    setIsTripDetailModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignUpModalOpen,
    setIsSignUpModalOpen,
    isFlightBookingModalOpen,
    setIsFlightBookingModalOpen,
    isManualFlightModalOpen,
    setIsManualFlightModalOpen,
  };
};
