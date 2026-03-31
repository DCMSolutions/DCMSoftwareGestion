"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Reserves } from "~/server/api/routers/reserves";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Store } from "~/server/api/routers/store";

export default function ReservesTable(props: {
  reserves: Record<number, Reserves[]>;
  stores: Store[];
}) {
  const router = useRouter();
  const { reserves } = props;

  // Convierte el objeto reserves a una matriz de objetos Reserves
  const reservesArray = Object.values(reserves).flat();

  // Filtrar duplicados por nReserve
  const uniqueReservesArray = reservesArray.reduce(
    (acc: Reserves[], current) => {
      const x = acc.find((item) => item.nReserve === current.nReserve);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    },
    [],
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Reserves>[] = [
    {
      accessorKey: "nReserve",
      header: "N° Reserva",
      cell: ({ row }) => (
        <div className="lowercase">{row.original.nReserve}</div>
      ),
    },
    {
      accessorKey: "Local",
      header: "Local",
      cell: ({ row }) => (
        <div className="lowercase">
          {props.stores?.find((x) => x.lockers.some(l => l.serieLocker === row.original.NroSerie))?.name}
        </div>
      ),
    },
    {
      accessorKey: "clients",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.original.clients?.email}</div>
      ),
    },
    // Agrega más columnas según sea necesario
  ];

  const table = useReactTable({
    data: uniqueReservesArray,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    // manualPagination: true, // Añadir esta línea para paginación manual
    autoResetPageIndex: false,
    pageCount: Math.ceil(uniqueReservesArray.length / pagination.pageSize), // Calcular el número de páginas
  });

  return (
    <div className="w-full px-4 py-2">
      <div className="w-full rounded-md border">
        <Table className="">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(`/panel/reservas/${row.original.nReserve}`)
                  }
                  className="hover:cursor-pointer hover:bg-gray-200"
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
              ))
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
