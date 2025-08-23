
import { useLanguage } from "@/hooks/useLanguage";

export const useAccommodationOptions = () => {
  const { t } = useLanguage();
  return [
    t("trips.newTripModal.accommodation.hotels"),
    t("trips.newTripModal.accommodation.hostels"),
    t("trips.newTripModal.accommodation.vacationRentals"),
    t("trips.newTripModal.accommodation.bedAndBreakfast"),
    t("trips.newTripModal.accommodation.resorts"),
    t("trips.newTripModal.accommodation.apartments"),
    t("trips.newTripModal.accommodation.guesthouses"),
    t("trips.newTripModal.accommodation.camping"),
    t("trips.newTripModal.accommodation.motels"),
  ];
};

export const useTransportationOptions = () => {
  const { t } = useLanguage();
  return [
    t("trips.newTripModal.transportation.flights"),
    t("trips.newTripModal.transportation.train"),
    t("trips.newTripModal.transportation.carRental"),
    t("trips.newTripModal.transportation.bus"),
    t("trips.newTripModal.transportation.taxiRideshare"),
    t("trips.newTripModal.transportation.metroSubway"),
    t("trips.newTripModal.transportation.walking"),
    t("trips.newTripModal.transportation.bicycle"),
    t("trips.newTripModal.transportation.ferry"),
    t("trips.newTripModal.transportation.motorcycle"),
  ];
};
