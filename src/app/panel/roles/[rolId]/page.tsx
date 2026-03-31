import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import UserPage from "./page-client";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home(props: { params: { rolId: string } }) {
  const { roles, perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const rol = await api.user.getRol.query({ id: (await props.params).rolId });
  if (!rol) {
    return <Title>Rol no encontrado</Title>;
  }

  const tengoElRol = roles.find((v) => v.id === rol.id);
  return (
    <UserPage
      rol={rol}
      tengoElRolAsignado={typeof tengoElRol !== "undefined"}
    />
  );
}
