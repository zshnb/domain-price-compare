"use client";
import DomainForm from "@/components/domainForm/domainForm";
import DomainTable from "@/components/domainTable/domainTable";
import {DomainInfo} from "@/components/domainTable/domainTable.type";
import {useState} from "react";
import {useTranslation} from "@/app/i18n/client";
import {LocaleContext} from "@/context/LocaleContext";

export default function Home({params}: {
  params: { locale: string }
}) {
  const localeContext = {
    lang: params.locale
  }
  const {t} = useTranslation(params.locale)
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <LocaleContext.Provider value={localeContext}>
      <header className='border-b px-80 min-h-20 flex items-center'>
        <p className='font-extrabold text-2xl'>{t('index.headerLogo')}</p>
      </header>
      <main className="flex min-h-screen flex-col items-center pt-24 px-48 gap-y-4">
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
  );
}
