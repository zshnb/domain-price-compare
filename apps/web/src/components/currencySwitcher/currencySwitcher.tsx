import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { Currency } from "@/types";
import { useTranslation } from "@/app/i18n/client";
import { useLocaleContext } from "@/context/LocaleContext";

export type CurrencySwitcherProps = {
  onCurrencyChange: (currency: Currency) => void,
}
export default function CurrencySwitcher({onCurrencyChange}: CurrencySwitcherProps) {
  const {lang} = useLocaleContext()
  const [currency, setCurrency] = useState<Currency>('RMB')
  const {t} = useTranslation(lang)
  return (
    <Select value={currency} onValueChange={(value) => {
      setCurrency(value as Currency)
      onCurrencyChange(value as Currency)
    }}>
      <SelectTrigger className="w-fit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('index.currencySwitcherLabel')}</SelectLabel>
          <SelectItem value="RMB">RMB</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}