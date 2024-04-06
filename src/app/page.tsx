'use client'
import DomainForm from "@/components/domainForm/domainForm";
import DomainTable from "@/components/domainTable/domainTable";
import {DomainInfo} from "@/components/domainTable/domainTable.type";
import {useState} from "react";

export default function Home() {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-4">
      <DomainForm onFetchDomainInfo={(domainInfo) => {
        setDomains([...domains, domainInfo]);
      }}/>
      <DomainTable data={domains}/>
    </main>
  );
}
