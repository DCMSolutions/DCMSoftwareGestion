import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CityPage from "./city-page";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Channel(props: { params: { cityId: string } }) {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }
  
  const city = await api.city.getById.query({ cityId: props.params.cityId });

  if (!city) {
    return <Title>No se encontró el canal</Title>;
  }

  return <CityPage city={city} />;
}
