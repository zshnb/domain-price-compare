import React, {useContext} from "react";

type Locale = {
  lang: string
}
export const LocaleContext = React.createContext<Locale | null>(null)

export function useLocaleContext() {
  const localeContext = useContext(LocaleContext)
  if (!localeContext) {
    throw new Error('no locale context')
  }
  return localeContext
}
