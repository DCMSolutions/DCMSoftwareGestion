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
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { ClientTableRecord } from "./columns";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { DataTablePagination } from "~/components/tanstack/pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends ClientTableRecord>({
  columns,
  data,
}: DataTableProps<TData, unknown>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    // initialState: {
    //   columnVisibility: {
    //     id: false,
    //     Marca: false,
    //     Plan: false,
    //     UN: false,
    //     Modalidad: false,
    //   },
    // },
  });

  const allColumns = table.getAllColumns();

  const handleRowClick = (row: Row<TData>) => {
    const linked = (link: string) => {
      window.location.href = link;
    };
    linked(`/panel/clientes/${row.getValue("identifier")}`);
  };

  return (
    <>
      <TableToolbar table={table} searchColumn={"name"} columns={allColumns} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="rounded-lg  " key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="border-x-0 border-b-2 border-gray-200 hover:cursor-pointer "
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </>
  );
}
