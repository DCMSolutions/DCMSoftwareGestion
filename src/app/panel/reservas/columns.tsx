// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

// Definir el tipo de datos para la tabla de reservas.
export type ReserveTableRecord = {
  nReserve: number | null;
  token1: number | null;
  token2: number | null;
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
    accessorKey: "token1",
    header: "Token de repartidor",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("token1") || "-"}</div>
    ),
  },
  {
    accessorKey: "token2",
    header: "Token de usuario",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("token2") || "-"}</div>
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
