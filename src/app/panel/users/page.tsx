import { useSession } from "next-auth/react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { UserAvatarCircle } from "~/components/user-avatar-circle";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function Home() {
  const session = await getServerAuthSession();
  const users = await db.query.users.findMany({
    columns: {
      email: true,
      name: true,
      id: true,
      image: true,
      role: true,
    },
  });

  return (
    <>
      <Title>Usuarios</Title>
      <List>
        {users.map((user) => (
          <ListTile
            href={`/panel/users/${user.id}`}
            key={user.id}
            leading={<UserAvatarCircle user={user} />}
            title={<p>{user.name}</p>}
            subtitle={<p>{user.role}</p>}
          />
        ))}
      </List>
    </>
  );
}
