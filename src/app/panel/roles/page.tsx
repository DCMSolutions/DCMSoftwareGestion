// import { auth, clerkClient } from "@clerk/nextjs/server";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { Badge } from "~/components/ui/badge";
import { PERMISO_ADMIN, ROL_ADMIN_ID, tienePermiso } from "~/lib/permisos";
import { api } from "~/trpc/server";
import { AddRole } from "./add-role";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  const roles = (await api.user.listRoles.query({ asignables: false }))
    .filter(v => v.id !== ROL_ADMIN_ID);

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <Title>Roles</Title>
        <AddRole canCreateRole={true} />
      </div>
      <List>
        {roles.map((rol) => (
          <ListTile
            href={`/panel/roles/${rol.id}`}
            key={rol.id}
            // leading={<UserAvatarCircle user={user} />}
            title={
              <div className="flex">
                {rol.company && <div className="px-3">
                  <Badge>{rol.company.name}</Badge>
                </div>}
                {rol.name}
              </div>
            }
            //   subtitle={<p>{user.role}</p>}
          />
        ))}
      </List>
    </>
  );
}
