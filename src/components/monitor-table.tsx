"use client";
import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Boxes, Locker } from "~/server/api/routers/lockers";
import { AlertCircle, BriefcaseIcon, LockIcon, UnlockIcon } from "lucide-react";
import { Reserves } from "~/server/api/routers/reserves";
import { Size } from "~/server/api/routers/sizes";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import GetQR from "./get-qr";

export function MonitorDatatable(props: {
  data: Locker;
  reservas: Reserves[] | null;
  sizes: Size[];
}) {
  const [generatedTokens, setGeneratedTokens] = useState<Map<number, string>>(
    new Map(),
  );

  useEffect(() => {
    // Inicializar el estado de los tokens generados desde los datos recibidos
    const tokenMap = new Map<number, string>();
    props.data.tokens?.forEach((token) => {
      if (token.idBox) {
        tokenMap.set(token.idBox, token.token1!);
      }
    });
    setGeneratedTokens(tokenMap);
  }, [props.data.tokens]);

  const router = useRouter();
  const { sizes, reservas } = props;

  const columns: ColumnDef<Boxes>[] = [
    {
      accessorKey: "idFisico",
      header: "ID BOX",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("idFisico")}</div>
      ),
    },
    {
      accessorKey: "idSize",
      header: "Size",
      cell: ({ row }) => (
        <div className="capitalize">
          {sizes.find((x) => x.id == row.getValue("idSize"))?.nombre}
        </div>
      ),
    },
    {
      accessorKey: "ocupacion",
      header: "Ocupación",
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("ocupacion") ? <BriefcaseIcon /> : ""}
        </div>
      ),
    },
    {
      accessorKey: "puerta",
      header: "Puerta",
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("puerta") ? <LockIcon /> : <UnlockIcon />}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-0">
          {row.getValue("ocupacion") &&
          (new Date(
            reservas?.find((r) => r.IdBox == row.getValue("id"))?.FechaFin ??
              "",
          ).getTime() < new Date().getTime() ||
            !reservas?.find((r) => r.IdBox == row.getValue("id"))?.FechaFin) ? (
            <div className="flex items-center space-x-5">
              <div className="animate-pulse lowercase">
                <AlertCircle color="red" />
              </div>
              <GetQR
                row={row}
                generatedTokens={generatedTokens}
                setGeneratedTokens={setGeneratedTokens}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      ),
    },
    {
      id: "acciones",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={
                  reservas?.find((r) => r.IdBox == row.getValue("id"))
                    ?.identifier
                    ? false
                    : true
                }
                onClick={() => {
                  router.push(
                    `/panel/reservas/${
                      reservas?.find((r) => r.IdBox == row.getValue("id"))
                        ?.nReserve
                    }`,
                  );
                }}
              >
                Ver última reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const data = props.data.boxes;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
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
                <TableRow key={row.id}>
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19);
}
