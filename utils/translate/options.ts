export const LANGUAGE_OPTIONS = {
  definitions: {
    ko: "한국어",
    en: "English",
  },
  default: "en",
  localStorageKey: "meenj04-language",
};

export type Language = keyof (typeof LANGUAGE_OPTIONS)["definitions"];
