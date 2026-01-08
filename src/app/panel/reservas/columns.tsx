// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ReserveInList } from "./reserves-component";

export const columns: ColumnDef<ReserveInList>[] = [
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
