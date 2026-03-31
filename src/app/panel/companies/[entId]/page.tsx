import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import EntPage from "./page-client";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home(props: { params: { entId: string } }) {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const ent = await api.companies.getById.query({ companyId: (await props.params).entId });
  if (!ent) {
    return <Title>Entidad no encontrada</Title>;
  }

  return (
    <EntPage
      ent={ent}
    />
  );
}
