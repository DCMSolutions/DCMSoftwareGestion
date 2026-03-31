import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import ClientPage from "./client-page";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Channel(props: { params: { clientId: string } }) {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:clientes")) {
    redirect("/accessdenied");
    return <></>;
  }
  
  const client = await api.clients.getById.query({
    identifier: parseInt(props.params.clientId),
  });
  const reservasRecord = await api.reserve.getByClient.query({
    clientId: client?.identifier!,
  });
  if (!client) {
    return <Title>No se encontró el cliente.</Title>;
  }

  return <ClientPage client={client} reservasRecord={reservasRecord} />;
}
