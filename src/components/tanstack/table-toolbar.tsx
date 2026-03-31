"use client";
import React, { useRef } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Column } from "@tanstack/react-table";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  searchColumn?: string;
  columns?: Column<TData, TValue>[];
}

// Definimos el tipo de ref que vamos a usar con Filters
interface FiltersRef {
  clearFilters: () => void;
}

export default function TableToolbar<TData, TValue>({
  table,
  columns,
  searchColumn,
}: DataTableToolbarProps<TData, TValue>) {
  const filtersRef = useRef<FiltersRef>(null); // Ref para el componente Filters

  const handleClearFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.clearFilters(); // Llamamos a la función clearFilters del componente Filters
    }
    table.resetColumnFilters(); // Reseteamos también los filtros de la tabla
  };

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="relative flex w-full max-w-sm place-content-center  items-center">
        {searchColumn !== undefined && table.getColumn(searchColumn ?? "") && (
          <>
            <Input
              placeholder={`Buscar por ... `}
              value={
                (table
                  .getColumn(searchColumn ?? "")
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(searchColumn ?? "")
                  ?.setFilterValue(event.target.value)
              }
              className="h-7 w-full rounded-full border-2 border-black p-5 focus-visible:ring-[#BEF0BB]"
            />
            <div className="absolute right-5 h-6 w-6 place-content-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#3E3E3E"
                className=""
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-1"></div>
    </div>
  );
}
