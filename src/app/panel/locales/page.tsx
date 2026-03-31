import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { api } from "~/trpc/server";
import { AddStoreDialog } from "../add-store-dialog";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:locales")) {
    redirect("/accessdenied");
    return <></>;
  }

  const cities = await api.city.get.query();
  const stores = await api.store.getProt.query();
  const lockers = await api.locker.get.query();
  if ("error" in lockers) {
    return <Title>Error: {lockers.error}</Title>;
  }

  return (
    <section className="space-y-2">
      <div className="flex justify-between">
        <Title>Locales</Title>
        <AddStoreDialog cities={cities} lockers={lockers} />
      </div>
      <List>
        {stores.map((store) => {
          return (
            <ListTile
              href={`/panel/locales/${store.identifier}`}
              title={store.name}
            />
          );
        })}
      </List>
    </section>
  );
}
