"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import { TableCell } from "~/components/ui/table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/newTable";
import { ReserveTableRecord, columns } from "./columns";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { DataTablePagination } from "~/components/tanstack/pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends ReserveTableRecord>({
  columns,
  data,
}: DataTableProps<TData, unknown>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  const handleRowClick = (row: Row<TData>) => {
    const linked = (link: string) => {
      window.location.href = link;
    };
    linked(`/panel/reservas/${row.getValue("nReserve")}`);
  };

  return (
    <div className="w-full p-4 space-y-4">
      {/* Barra de búsqueda */}
      <TableToolbar
        table={table}
        searchColumn={"client"}
        columns={table.getAllColumns()}
      />

      {/* Tabla de reservas */}
      <div className="overflow-x-auto rounded-md border shadow-md">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-gray-50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className=" whitespace-nowrap text-sm font-medium text-gray-900 text-right"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-sm text-gray-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
