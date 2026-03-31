import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const [pages, setPages] = useState<(number | string)[]>([]);
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  useEffect(() => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxButtons = 5;

      const half = Math.floor(maxButtons / 2);
      const currentIndex = pageIndex + 1;
      let start = Math.max(1, currentIndex - half);
      let end = Math.min(totalPages, currentIndex + half);

      if (currentIndex <= half) {
        end = Math.min(maxButtons, totalPages);
      } else if (currentIndex + half >= totalPages) {
        start = Math.max(1, totalPages - maxButtons + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (start > 1) {
        pages.unshift(1);
        if (start > 2) {
          pages.splice(1, 0, "...");
        }
      }

      if (end < totalPages) {
        pages.push(totalPages);
        if (end < totalPages - 1) {
          pages.splice(pages.length - 1, 0, "...");
        }
      }

      return pages;
    };
    setPages(getPageNumbers());
  }, [pageIndex, totalPages]);
  const firstRowShown = pageIndex * pageSize + 1;
  const lastRowShown = Math.min(
    (pageIndex + 1) * pageSize,
    table.getFilteredRowModel().rows.length,
  );
  const goToPage = (pageNumber: number) => {
    table.setPageIndex(pageNumber);
  };

  return (
    <div className="mt-2 flex w-full items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground ">Mostrar</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger
            className="h-4 w-[70px] rounded-full border-2 "
            // rightIcon={<ChevronDown className="h-4 w-3" strokeWidth={1} />}
          >
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem
                key={pageSize}
                value={`${pageSize}`}
                className="text-xs"
              >
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="ml-2 flex-1 text-sm text-muted-foreground">
        Mostrando <span className="font-bold"> {firstRowShown}</span> a{" "}
        <span className="font-bold"> {lastRowShown}</span> de{" "}
        <span className="font-bold">{totalRows} </span> entradas
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-none "
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previo
        </Button>
        {pages.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              className={`h-5 w-auto rounded-full px-3 text-[0.6rem] text-muted-foreground ${
                pageIndex === page - 1 ? "bg-gray-200":"bg-[#bcbcbc] " 
              }`}
              onClick={() => goToPage(page - 1)}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="h-5 w-auto rounded-md px-3 text-[0.6rem] text-muted-foreground"
            >
              {page}
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="border-none"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
