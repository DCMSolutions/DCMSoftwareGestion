import { Title } from "~/components/title";
import { AddCityDialog } from "../add-city-dialog";
import { List, ListTile } from "~/components/list";
import { api } from "~/trpc/server";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const cities = await api.city.get.query();

  return (
    <section className="space-y-2">
      <div className="flex justify-between">
        <Title>Ciudades</Title>
        <AddCityDialog />
      </div>
      <List>
        {cities.map((city) => {
          return (
            <ListTile
              href={`/panel/ciudades/${city.identifier}`}
              title={city.name}
            />
          );
        })}
      </List>
    </section>
  );
}
