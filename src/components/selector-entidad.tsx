"use client";
import { usePerms } from "./perms-provider";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { SidenavSeparator } from "./sidenav";
import { useRouter } from "next/navigation";

export default function SelectEntidad() {
  const { isAdmin } = usePerms();
  const puedeCambiarEntidad = isAdmin;
  const { data: entidades, isLoading } = api.companies.list.useQuery();
  const { mutateAsync: asignarUsuarios } =
    api.user.selectEntidad.useMutation();
  const { data: user, isLoading: isLoadingUser, refetch } = api.user.self.useQuery();
  const [entidad, setEntidad] = useState(user?.userEntity?.entidadId);
  const utils = api.useUtils();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setEntidad(user.userEntity?.entidadId);
    }
  }, [user]);

  useEffect(() => {
    if (
      entidad &&
      entidad.length > 0 &&
      user &&
      entidad !== user.userEntity?.entidadId
    ) {
      asignarUsuarios({
        id: entidad,
      })
        .then(() => {
          toast.message("Entidad cambiada");
          refetch();
          utils.invalidate();
          router.refresh();
        })
        .catch((e) => {
          console.error("error asignar usuarios:", e);
          toast.error("La entidad no pudo ser asignada");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entidad]);

  if (!puedeCambiarEntidad || isLoading || !entidades || isLoadingUser) {
    return <></>;
  }

  return (
    <div>
      <SidenavSeparator>Entidad</SidenavSeparator>
      <Select value={entidad ?? ""} onValueChange={setEntidad}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar entidad" />
        </SelectTrigger>
        <SelectContent>
          {entidades.map((ent) => (
            <SelectItem key={ent.id} value={ent.id}>
              {ent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
