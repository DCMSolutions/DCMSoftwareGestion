import { api } from "~/trpc/server";

import ReservesComponent from "./reserves-component";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms, orgId } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:reservas")) {
    redirect("/accessdenied");
    return <></>;
  }

  const activesReserves = await api.reserve.getActive.query();
  const allReserves = await api.reserve.get.query();
  const stores = (await api.store.get.query())
    .filter(v => v.entidadId === orgId);

  return <ReservesComponent
      activesReserves={activesReserves}
      allReserves={allReserves}
      stores={stores}
    />;
}
