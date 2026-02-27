import React, { createContext, useContext, useState } from 'react';
import { t } from '../utils/translations';

const LanguageContext = createContext({ language: 'en', setLanguage: () => {}, t: (k) => k });

/**
 * LanguageProvider
 * Pass `language` + `setLanguage` as props for external (App-level) control.
 * Or omit them to use internal state (defaults to `initialLanguage`).
 */
export function LanguageProvider({ children, language: extLang, setLanguage: extSet, initialLanguage = 'en' }) {
  const [internalLang, setInternalLang] = useState(initialLanguage);

  const language = extLang !== undefined ? extLang : internalLang;
  const setLanguage = extSet !== undefined ? extSet : setInternalLang;

  const translate = (key) => t(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook: const { language, setLanguage, t } = useLanguage(); */
export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
