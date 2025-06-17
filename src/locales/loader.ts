import { Language } from '@/contexts/LanguageContext';

// English imports
import enNavigation from './en/navigation.json';
import enCommon from './en/common.json';
import enHome from './en/home.json';
import enExplore from './en/explore.json';
import enTrips from './en/trips.json';
import enBooking from './en/booking.json';
import enSettings from './en/settings.json';
import enProfile from './en/profile.json';
import enTravelers from './en/travelers.json';
import enNotifications from './en/notifications.json';
import enFilters from './en/filters.json';

// Chinese imports
import zhNavigation from './zh/navigation.json';
import zhCommon from './zh/common.json';
import zhHome from './zh/home.json';
import zhExplore from './zh/explore.json';
import zhTrips from './zh/trips.json';
import zhBooking from './zh/booking.json';
import zhSettings from './zh/settings.json';
import zhProfile from './zh/profile.json';
import zhTravelers from './zh/travelers.json';

// Other language imports (keeping existing single files for now)
import es from './es.json';
import pt from './pt.json';
import fr from './fr.json';
import it from './it.json';

// Merge function to combine all locale modules
const mergeLocales = (...locales: any[]) => {
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
  enFilters
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
  zh
};
