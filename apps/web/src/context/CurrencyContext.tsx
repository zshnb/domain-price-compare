import React, {useContext} from "react";

export const CurrencyContext = React.createContext<string | null>(null)

export function useCurrencyContext() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('no locale context')
  }
  return context
}
