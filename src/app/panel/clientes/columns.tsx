// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";
import dayjs from "dayjs";

// Definir el tipo de datos para la tabla de clientes.
export type ClientTableRecord = {
  identifier: number;
  name: string | null;
  surname: string | null;
  email: string | null;
  prefijo: number | null;
  telefono: number | null;
  dni: string | null;
  entidadId: string | null; // solo para el tipado
};

export const columns: ColumnDef<ClientTableRecord>[] = [
  {
    accessorKey: "identifier",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="text-medium whitespace-nowrap text-center">Nombre</div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("name") || "-"}</div>;
    },
  },
  {
    accessorKey: "surname",
    header: () => (
      <div className="text-medium whitespace-nowrap text-center">Apellido</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("surname") || "-"}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="text-medium whitespace-nowrap text-center">Email</div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("email") || "-"}</div>;
    },
  },
  {
    accessorKey: "prefijo",
    header: () => (
      <div className="text-medium whitespace-nowrap text-center">Prefijo</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("prefijo") || "-"}</div>
      );
    },
  },
  {
    accessorKey: "telefono",
    header: () => (
      <div className="text-medium whitespace-nowrap text-center">Teléfono</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("telefono") || "-"}</div>
      );
    },
  },
];
