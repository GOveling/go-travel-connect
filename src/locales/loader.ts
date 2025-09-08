// English imports
import enAuth from "./en/auth.json";
import enBooking from "./en/booking.json";
import enCommon from "./en/common.json";
import enExplore from "./en/explore.json";
import enFilters from "./en/filters.json";
import enHome from "./en/home.json";
import enNavigation from "./en/navigation.json";
import enNotifications from "./en/notifications.json";
import enPages from "./en/pages.json";
import enProfile from "./en/profile.json";
import enSettings from "./en/settings.json";
import enTravelers from "./en/travelers.json";
import enTrips from "./en/trips.json";

// Spanish imports
import esAuth from "./es/auth.json";
import esBooking from "./es/booking.json";
import esCommon from "./es/common.json";
import esExplore from "./es/explore.json";
import esFilters from "./es/filters.json";
import esHome from "./es/home.json";
import esNavigation from "./es/navigation.json";
import esNotifications from "./es/notifications.json";
import esPages from "./es/pages.json";
import esProfile from "./es/profile.json";
import esSettings from "./es/settings.json";
import esTravelers from "./es/travelers.json";
import esTrips from "./es/trips.json";

// Chinese imports
import zhBooking from "./zh/booking.json";
import zhCommon from "./zh/common.json";
import zhExplore from "./zh/explore.json";
import zhHome from "./zh/home.json";
import zhNavigation from "./zh/navigation.json";
import zhProfile from "./zh/profile.json";
import zhSettings from "./zh/settings.json";
import zhTravelers from "./zh/travelers.json";
import zhTrips from "./zh/trips.json";

// Other language imports (keeping existing single files for now)
import fr from "./fr.json";
import it from "./it.json";
import pt from "./pt.json";

// Merge function to combine all locale modules
const mergeLocales = (...locales: Record<string, unknown>[]) => {
  return locales.reduce((acc, locale) => ({ ...acc, ...locale }), {});
};

// Create merged translations
const en = mergeLocales(
  enNavigation,
  enCommon,
  enHome,
  enExplore,
  enTrips,
  enBooking,
  enSettings,
  enProfile,
  enTravelers,
  enNotifications,
  enFilters,
  enAuth,
  enPages
);

const es = mergeLocales(
  esNavigation,
  esCommon,
  esHome,
  esExplore,
  esTrips,
  esBooking,
  esSettings,
  esProfile,
  esTravelers,
  esNotifications,
  esFilters,
  esAuth,
  esPages
);

const zh = mergeLocales(
  zhNavigation,
  zhCommon,
  zhHome,
  zhExplore,
  zhTrips,
  zhBooking,
  zhSettings,
  zhProfile,
  zhTravelers
);

export const translations = {
  en,
  es,
  pt,
  fr,
  it,
  zh,
};
