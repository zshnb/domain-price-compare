"use client";
import DomainForm from "@/components/domainForm/domainForm";
import DomainTable from "@/components/domainTable/domainTable";
import { DomainInfo } from "@/components/domainTable/domainTable.type";
import { useState } from "react";

export default function Home() {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-4">
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
      <DomainTable data={domains} loading={loading} />
    </main>
  );
}
