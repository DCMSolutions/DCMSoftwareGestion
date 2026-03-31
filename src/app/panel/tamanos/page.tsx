import Link from "next/link";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Size } from "~/server/api/routers/sizes";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { tienePermiso } from "~/lib/permisos";
import { redirect } from "next/navigation";

export default async function Home() {
  const { perms } = await api.user.self.query();
  if (!tienePermiso(perms, "panel:sizes")) {
    redirect("/accessdenied");
    return <></>;
  }

  // const sizes = await api.size.get.query();
  const sizes = await api.size.getProt.query({
    store: null,
  });

  return (
    <section className="space-y-2">
      <div className="flex justify-between">
        <Title>Tamaños</Title>
      </div>
      <List>
        {sizes.map((size: Size) => {
          return (
            <ListTile href={`/panel/tamanos/${size.id}`} title={size.nombre} />
          );
        })}
      </List>
    </section>
  );
}
