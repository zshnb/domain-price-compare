import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, Check, MousePointer2, X } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLocaleContext } from "@/context/LocaleContext";
import { useTranslation } from "@/app/i18n/client";
import { DomainInfo } from "@/types";
import Image from "next/image";
import { convertCurrency } from "@/lib/money";
import { useCurrencyContext } from "@/context/CurrencyContext";

export default function useDomainTable() {
  const lang = useLocaleContext().lang
  const currentCurrency = useCurrencyContext()
  const {t} = useTranslation(lang)

  function getFinalPrice(row: Row<DomainInfo>) {
    const price = row.getValue<number>("price");
    const from = row.getValue<string>('currency')
    return convertCurrency(price, from, currentCurrency)
  }
  function sortPrice(rowA: Row<DomainInfo>, rowB: Row<DomainInfo>, columnId: string) {
    const priceA = getFinalPrice(rowA)
    const priceB = getFinalPrice(rowB)
    if (priceA < priceB) return -1
    if (priceA === priceB) return 0
    else return 1
  }
  const columns: ColumnDef<DomainInfo>[] = [
    {
      accessorKey: 'icon',
      id: 'icon'
    },
    {
      accessorKey: 'currency',
      id: 'currency'
    },
    {
      accessorKey: "register",
      header: t('index.domainTable.header.register'),
      cell: ({ row }) => {
        const register = row.getValue<string>("register");
        const icon = row.getValue<string>('icon')
        return (
          <div className={'flex gap-x-2 items-center'}>
            <Image src={icon} alt={'icon'} width={32} height={32}/>
            <p>{register}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {
              t('index.domainTable.header.price')
            }
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const finalPrice = getFinalPrice(row)
        const symbol = currentCurrency === 'USD' ? '$' : '¥'
        return row.getValue<boolean>("available") ? (
          <p>{symbol + finalPrice}</p>
        ) : (
          <p>/</p>
        );
      },
      sortingFn: sortPrice
    },
    {
      accessorKey: "realPrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {
              t('index.domainTable.header.realPrice')
            }
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const finalPrice = getFinalPrice(row)
        const symbol = currentCurrency === 'USD' ? '$' : '¥'
        return row.getValue<boolean>("available") ? (
          <p>{symbol + finalPrice}</p>
        ) : (
          <p>/</p>
        );
      },
      sortingFn: sortPrice
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