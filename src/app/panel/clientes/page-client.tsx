"use client"

import { Title } from "~/components/title";
import { type ClientTableRecord, columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "~/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function PageCliente({ uniqueClientes }: { uniqueClientes: ClientTableRecord[] }) {
  async function downloadExcel() {
    const excelRows: (string | number)[][] = [[
      "ID",
      "Nombre",
      "Apellido",
      "Email",
      "Prefijo",
      "Teléfono",
      "DNI"
    ]];

    for (const client of uniqueClientes) {
      excelRows.push([
        client.identifier,
        client.name ?? "",
        client.surname ?? "",
        client.email ?? "",
        client.prefijo ?? "",
        client.telefono ?? "",
        client.dni ?? "",
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BD");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Clientes_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  return (
    <section className="">
      <div className="flex justify-between">
        <Title>Clientes</Title>
        <Button onClick={downloadExcel}>Descargar Excel</Button>
      </div>
      <DataTable columns={columns} data={uniqueClientes} />
    </section>
  );
}