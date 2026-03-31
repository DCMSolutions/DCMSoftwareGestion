import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddCoinDialog } from "../add-coin-dialog";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const coin = await api.coin.get.query();
  // const sizes = await api.size.get.query({});
  return (
    <div>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Monedas</Title>
          <AddCoinDialog />
        </div>
        <List>
          {coin.map((coin) => {
            return (
              <ListTile
                href={`/panel/monedas/${coin.identifier}`}
                title={coin.description}
              />
            );
          })}
        </List>
      </section>
    </div>
  );
}
