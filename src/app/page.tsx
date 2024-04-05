import Image from "next/image";
import DomainForm from "@/components/domainForm/domainForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <DomainForm/>
    </main>
  );
}
