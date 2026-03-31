import { api } from "~/trpc/server";
import { type ClientTableRecord } from "./columns";
import { PageCliente } from "./page-client";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:clientes")) {
    redirect("/accessdenied");
    return <></>;
  }

  const clientes = await api.clients.getGroupedByEmail.query();

  const uniqueClientes = Object.values(clientes)
    .map((clientList) => clientList[0])
    .filter((client): client is ClientTableRecord => client !== undefined);

  return <PageCliente uniqueClientes={uniqueClientes} />;
}
