import { api } from "~/trpc/server";
import LockerOcupationPage from "./page-client";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Reportes() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  return <LockerOcupationPage />;
}
