"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import { TableCell } from "~/components/ui/table";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/newTable";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { DataTablePagination } from "~/components/tanstack/pagination";
import { ReserveInList } from "./reserves-component";

interface DataTableProps {
  columns: ColumnDef<ReserveInList, unknown>[];
  data: ReserveInList[];
}

export function DataTable({
  columns,
  data,
}: DataTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filteredData = useMemo(() => {
    if (!globalFilter) {
      return data;
    }
    
    const search = globalFilter.toLowerCase();
    return data.filter((item) => {
      const nReserve = String(item.nReserve ?? "").toLowerCase();
      const email = String(item.email ?? "").toLowerCase();
      const client = String(item.client ?? "").toLowerCase();
      const storeName = String(item.storeName ?? "").toLowerCase();

      return (
        nReserve.includes(search) || 
        email.includes(search) || 
        client.includes(search) ||
        storeName.includes(search)
      );
    });
  }, [data, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter, 
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleRowClick = (row: Row<ReserveInList>) => {
    window.location.href = `/panel/reservas/${row.getValue("nReserve")}`;
  };

  return (
    <div className="w-full p-4 space-y-4">
      <TableToolbar
        table={table}
        enableGlobalFilter={true}
        columns={table.getAllColumns()}
      />

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
                      className="whitespace-nowrap text-sm font-medium text-gray-900 text-right"
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
