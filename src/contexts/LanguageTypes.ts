import { createContext } from "react";

export type Language = "en" | "es" | "pt" | "fr" | "it" | "zh";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isRTL: boolean;
  supportedLanguages: {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
  }[];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
