import DomainForm from "@/components/domainForm/domainForm";
import DomainTable from "@/components/domainTable/domainTable";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-4">
      <DomainForm/>
      <DomainTable/>
    </main>
  );
}
