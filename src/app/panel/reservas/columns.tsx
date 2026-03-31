// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

// Definir el tipo de datos para la tabla de reservas.
export type ReserveTableRecord = {
  nReserve: number | null;
  storeName?: string | null;
  client: string | null;
};

export const columns: ColumnDef<ReserveTableRecord>[] = [
  {
    accessorKey: "nReserve",
    header: "N° Reserva",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("nReserve") || "-"}</div>
    ),
  },
  {
    accessorKey: "storeName",
    header: "Local",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("storeName") || "-"}</div>
    ),
  },
  {
    accessorKey: "client",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("client") || "-"}</div>
    ),
  },
];
