import { useLanguage } from "./useLanguage";

/**
 * Enhanced i18n hook with additional utilities for developers
 *
 * This hook provides all language functionality plus development helpers
 * to ensure consistent i18n usage across the application.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { t, language, setLanguage } = useI18n();
 *
 * // With validation in development
 * const { t, tWithFallback, validateKey } = useI18n();
 *
 * // Check if translation exists
 * if (validateKey('common.save')) {
 *   return t('common.save');
 * }
 *
 * // Use with fallback
 * return tWithFallback('new.untranslated.key', 'Default Text');
 * ```
 */
export const useI18n = () => {
  const context = useLanguage();

  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }

  const { t, language, setLanguage, isRTL, supportedLanguages } = context;

  /**
   * Translation function with fallback for development
   * Shows warnings in development when translations are missing
   */
  const tWithFallback = (
    key: string,
    fallback?: string,
    variables?: Record<string, string | number>
  ): string => {
    const translation = t(key, variables);

    // In development, warn if translation falls back to key
    if (
      process.env.NODE_ENV === "development" &&
      translation === key &&
      fallback
    ) {
      console.warn(
        `Missing translation for key: "${key}". Using fallback: "${fallback}"`
      );
      return fallback;
    }

    return translation;
  };

  /**
   * Validates if a translation key exists
   * Useful for conditional rendering based on available translations
   */
  const validateKey = (key: string): boolean => {
    const translation = t(key);
    return translation !== key;
  };

  /**
   * Gets the native name of the current language
   */
  const getCurrentLanguageName = (): string => {
    const currentLang = supportedLanguages.find(
      (lang) => lang.code === language
    );
    return currentLang?.nativeName || language;
  };

  /**
   * Formats a number according to the current locale
   */
  const formatNumber = (
    num: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    try {
      return new Intl.NumberFormat(language, options).format(num);
    } catch (error) {
      console.warn("Number formatting failed:", error);
      return num.toString();
    }
  };

  /**
   * Formats a date according to the current locale
   */
  const formatDate = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return new Intl.DateTimeFormat(language, options).format(dateObj);
    } catch (error) {
      console.warn("Date formatting failed:", error);
      return date.toString();
    }
  };

  /**
   * Gets text direction for CSS
   */
  const getTextDirection = (): "ltr" | "rtl" => {
    return isRTL ? "rtl" : "ltr";
  };

  /**
   * Helper for conditional classes based on RTL
   */
  const rtlClass = (ltrClass: string, rtlClass: string): string => {
    return isRTL ? rtlClass : ltrClass;
  };

  return {
    // Core i18n functionality
    t,
    language,
    setLanguage,
    isRTL,
    supportedLanguages,

    // Enhanced functionality
    tWithFallback,
    validateKey,
    getCurrentLanguageName,
    formatNumber,
    formatDate,
    getTextDirection,
    rtlClass,
  };
};

export default useI18n;
