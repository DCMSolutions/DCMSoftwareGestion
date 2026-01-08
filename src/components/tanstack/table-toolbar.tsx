"use client";
import React, { useRef } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Column } from "@tanstack/react-table";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  searchColumn?: string;
  enableGlobalFilter?: boolean;
  columns?: Column<TData, TValue>[];
}

interface FiltersRef {
  clearFilters: () => void;
}

export default function TableToolbar<TData, TValue>({
  table,
  searchColumn,
  enableGlobalFilter,
}: DataTableToolbarProps<TData, TValue>) {
  const filtersRef = useRef<FiltersRef>(null);

  const handleClearFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.clearFilters();
    }
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  const getSearchValue = () => {
    if (enableGlobalFilter) {
      return (table.getState().globalFilter as string) ?? "";
    }
    return (table.getColumn(searchColumn ?? "")?.getFilterValue() as string) ?? "";
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (enableGlobalFilter) {
      table.setGlobalFilter(value);
    } else {
      table.getColumn(searchColumn ?? "")?.setFilterValue(value);
    }
  };

  const showInput = enableGlobalFilter || (searchColumn && table.getColumn(searchColumn));

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="relative flex w-full max-w-sm place-content-center items-center">
        {showInput && (
          <>
            <Input
              placeholder={`Buscar por ... `}
              value={getSearchValue()}
              onChange={handleSearchChange}
              className="h-7 w-full rounded-full border-2 border-black p-5 focus-visible:ring-[#BEF0BB]"
            />
            <div className="absolute right-5 h-6 w-6 place-content-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#3E3E3E"
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
    </div>
  );
}
