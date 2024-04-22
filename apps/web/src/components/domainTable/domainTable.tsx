"use client";

import {
  flexRender,
  getCoreRowModel, getSortedRowModel, SortingState,
  useReactTable
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell, TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Spinner from "@/components/spinner/spinner";
import {useTranslation} from "@/app/i18n/client";
import {useLocaleContext} from "@/context/LocaleContext";
import useDomainTable from "@/hooks/useDomainTable";
import { DomainInfo } from "@/types";
import { useState } from "react";

export type DomainTableProps = {
  data: DomainInfo[]
  loading: boolean
}
export default function DomainTable({ data, loading }: DomainTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const lang = useLocaleContext().lang
  const {t} = useTranslation(lang)
  const {columns} = useDomainTable()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility: {
        icon: false,
        currency: false,
        price: true,
        realPrice: true,
        register: true,
        available: true,
        buyLink: true
      },
      sorting
    }
  });

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('index.domainTable.emptyMessage')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {
          loading && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length} align='center'>
                  <Spinner/>
                </TableCell>
              </TableRow>
            </TableFooter>
          )
        }
      </Table>
    </div>
  );
}
