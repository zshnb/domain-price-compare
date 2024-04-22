"use client";
import DomainForm from "@/components/domainForm/domainForm";
import DomainTable from "@/components/domainTable/domainTable";
import {useState} from "react";
import {useTranslation} from "@/app/i18n/client";
import {LocaleContext} from "@/context/LocaleContext";
import {DomainInfo, DomainRegister} from "@/types";
import CurrencySwitcher from "@/components/currencySwitcher/currencySwitcher";
import {CurrencyContext} from "@/context/CurrencyContext";

export default function Home({params}: {
  params: { locale: string }
}) {
  const localeContext = {
    lang: params.locale
  }
  const {t} = useTranslation(params.locale)
  const [domains, setDomains] = useState<DomainInfo[]>([
    {
      price: 13,
      realPrice: 13,
      register: DomainRegister.tencent,
      domain: 'sll',
      currency: 'USD',
      available: true,
      icon: '',
      buyLink: 'https://www.baid.com'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <CurrencyContext.Provider value={'RMB'}>
      <LocaleContext.Provider value={localeContext}>
        <header className='border-b px-80 min-h-20 flex items-center justify-between'>
          <p className='font-extrabold text-2xl'>{t('index.headerLogo')}</p>
          <CurrencySwitcher onCurrencyChange={() => {}}/>
        </header>
        <main className="flex min-h-screen flex-col items-center py-24 px-48">
          <DomainForm
            onStart={() => {
              setLoading(true)
              setDomains([])
            }}
            onFetchDomainInfo={(domainInfo) => {
              setDomains(prevState => {
                return [...prevState, domainInfo];
              });
            }}
            onFinish={() => {
              setLoading(false)
            }}
          />
          <DomainTable data={domains} loading={loading}/>
        </main>
      </LocaleContext.Provider>
    </CurrencyContext.Provider>
  );
}
