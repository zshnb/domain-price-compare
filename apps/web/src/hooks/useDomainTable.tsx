import {ColumnDef} from "@tanstack/react-table";
import {DomainInfo} from "@/components/domainTable/domainTable.type";
import {Check, MousePointer2, X} from "lucide-react";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {useLocaleContext} from "@/context/LocaleContext";
import {useTranslation} from "@/app/i18n/client";

export default function useDomainTable() {
  const lang = useLocaleContext().lang
  const {t} = useTranslation(lang)
  const columns: ColumnDef<DomainInfo>[] = [
    {
      accessorKey: "register",
      header: t('index.domainTable.header.register'),
      cell: ({ row }) => {
        const register = row.getValue<string>("register");
        return <p>{register}</p>;
      }
    },
    {
      accessorKey: "domain",
      header: t('index.domainTable.header.domain'),
    },
    {
      accessorKey: "price",
      header: t('index.domainTable.header.price'),
      cell: ({ row }) => {
        const price = row.getValue<string>("price");
        return row.getValue<boolean>("available") ? (
          <p>{price}</p>
        ) : (
          <p>/</p>
        );
      }
    },
    {
      accessorKey: "realPrice",
      header: t('index.domainTable.header.realPrice'),
      cell: ({ row }) => {
        const price = row.getValue<string>("realPrice");
        return row.getValue<boolean>("available") ? (
          <p>{price}</p>
        ) : (
          <p>/</p>
        );
      }
    },
    {
      accessorKey: "available",
      header: t('index.domainTable.header.status'),
      cell: ({ row }) => {
        return row.getValue<boolean>("available") ? (
          <Check color="#00bd03" />
        ) : (
          <X color="#bd0000" />
        );
      }
    },
    {
      accessorKey: "buyLink",
      header: t('index.domainTable.header.buyLink'),
      cell: ({ row }) => {
        const available = row.getValue<boolean>("available");
        if (available) {
          const link = row.getValue<string>("buyLink");
          return (
            <Link className={buttonVariants({ variant: "outline" })} href={link} target="_blank">
          <MousePointer2 className="h-4 w-4" />
            </Link>
        );
        } else {
          return <></>;
        }
      }
    }
  ];
  return {
    columns
  }
}