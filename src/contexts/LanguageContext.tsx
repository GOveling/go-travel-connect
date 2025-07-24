import { translations } from "@/locales/loader";
import React, { useEffect, useState } from "react";
import { Language, LanguageContext } from "./LanguageTypes";

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Available languages configuration
const SUPPORTED_LANGUAGES = [
  {
    code: "en" as Language,
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "es" as Language,
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  {
    code: "pt" as Language,
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
  },
  {
    code: "fr" as Language,
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  {
    code: "it" as Language,
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
  },
  {
    code: "zh" as Language,
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
  },
];

// RTL languages (none in current supported languages, but prepared for Arabic, Hebrew, etc.)
const RTL_LANGUAGES: Language[] = [];

// Detect browser language
const detectBrowserLanguage = (): Language => {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language.split("-")[0] as Language;
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === browserLang)?.code || "en"
  );
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("appLanguage") as Language;
    return savedLanguage || detectBrowserLanguage();
  });

  const [isRTL, setIsRTL] = useState<boolean>(false);

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(RTL_LANGUAGES.includes(language));

    // Update document direction
    document.documentElement.dir = RTL_LANGUAGES.includes(language)
      ? "rtl"
      : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.find((l) => l.code === lang)) {
      console.warn(
        `Language ${lang} is not supported. Falling back to English.`
      );
      return;
    }

    setLanguageState(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const t = (
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    if (!key) {
      console.warn("Translation key is empty");
      return "";
    }

    const keys = key.split(".");
    let value: Record<string, unknown> | string | undefined =
      translations[language];

    // Navigate through nested keys
    for (const k of keys) {
      value = value?.[k];
    }

    // If translation not found in current language, fallback to English
    if (typeof value !== "string") {
      console.warn(
        `Translation not found for key "${key}" in language "${language}". Falling back to English.`
      );
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }

    // If still not found, return the key
    if (typeof value !== "string") {
      console.error(`Translation not found for key "${key}" in any language.`);
      return key;
    }

    // Replace variables in the translation
    if (variables && Object.keys(variables).length > 0) {
      return value.replace(
        /\{\{(\w+)\}\}/g,
        (match: string, variable: string) => {
          const replacement = variables[variable];
          return replacement !== undefined ? String(replacement) : match;
        }
      );
    }

    return value;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
