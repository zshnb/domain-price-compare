"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {DomainInfo, DomainRegister} from "@/components/domainTable/domainTable.type";
import {Button, buttonVariants} from "@/components/ui/button";
import {Check, ChevronRight, MousePointer2, X} from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<DomainInfo>[] = [
  {
    accessorKey: "register",
    header: "注册商",
    cell: ({row}) => {
      const register = row.getValue<string>('register')
      return <p>{register}</p>
    }
  },
  {
    accessorKey: "domain",
    header: "域名",
  },
  {
    accessorKey: 'price',
    header: '价格'
  },
  {
    accessorKey: 'realPrice',
    header: '现价'
  },
  {
    accessorKey: 'available',
    header: '状态',
    cell: ({row}) => {
      return row.getValue<boolean>('available') ? (
        <Check color='#00bd03'/>
      ) : (
        <X color='#bd0000'/>
      )
    }
  },
  {
    accessorKey: "buyLink",
    header: '购买链接',
    cell: ({row}) => {
      const link = row.getValue<string | undefined>('buyLink')
      if (link !== '' && link !== undefined) {
        return (
          <Link className={buttonVariants({ variant: "outline" })} href={link} target='_blank'>
            <MousePointer2 className="h-4 w-4" />
          </Link>
        )
      } else {
        return <></>
      }
    }
  }
]

export type DomainTableProps = {
  data: DomainInfo[]
}
export default function DomainTable({data}: DomainTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
                )
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
