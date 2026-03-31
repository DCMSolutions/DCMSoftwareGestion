// import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { Badge } from "~/components/ui/badge";
import { Roles } from "~/lib/globals";
import { PERMISO_ADMIN, tienePermiso } from "~/lib/permisos";
import { api } from "~/trpc/server";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, PERMISO_ADMIN)) {
    redirect("/accessdenied");
    return <></>;
  }

  // const response = await clerkClient.users.getUserList();
  await api.test.migrateToEntities.mutate();
  const users = await api.user.listBasic.query();

  return (
    <>
      <Title>Usuarios</Title>
      <List>
        {users.map((user) => (
          <ListTile
            href={`/panel/usuarios/${user.id}`}
            key={user.id}
            // leading={<UserAvatarCircle user={user} />}
            title={
              <div className="flex">
                {user.emailAddresses.map(v => v.emailAddress).join(", ")}{" "}
                <div className="px-3">
                  <Badge>{user.fullName}</Badge>
                </div>
                {user.usuarioRoles.length > 0 && user.usuarioRoles.map(v => v.rol.name).join(", ")}
                {user.usuarioRoles.length === 0 && "Sin rol"}
              </div>
            }
            //   subtitle={<p>{user.role}</p>}
          />
        ))}
      </List>
    </>
  );
}
