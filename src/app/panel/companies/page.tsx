// import { auth, clerkClient } from "@clerk/nextjs/server";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { AddCompany } from "./add";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const entities = await api.companies.list.query();

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <Title>Entidades</Title>
        <AddCompany canCreate={true} />
      </div>
      <List>
        {entities.map((ent) => (
          <ListTile
            href={`/panel/companies/${ent.id}`}
            key={ent.id}
            title={
              <div className="flex">
                {ent.name}
              </div>
            }
          />
        ))}
      </List>
    </>
  );
}
