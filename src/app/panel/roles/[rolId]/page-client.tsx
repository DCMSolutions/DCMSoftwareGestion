"use client";
import { CheckIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { usePerms } from "~/components/perms-provider";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Permisos, PermisosValue, PermisosVisibles } from "~/lib/permisos";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

export default function UserPage({
  rol,
  tengoElRolAsignado,
}: {
  rol: NonNullable<RouterOutputs["user"]["getRol"]>;
  tengoElRolAsignado: boolean;
}) {
  const deleteMut = api.user.deleteRol.useMutation();
  const setRolPermsMut = api.user.setRolPerms.useMutation();
  const { hasPerm } = usePerms();
  const router = useRouter();
  const util = api.useUtils();

  const [rolPermisos, setRolPermisos] = useState<Set<string>>(
    new Set(rol.permisos.map((v) => v.value)),
  );

  const rolPermisosInicial = useMemo(
    () => new Set(rol.permisos.map((v) => v.value)),
    [rol],
  );
  
  const rolPermisosActualizados = useMemo(() => {
    for (const permiso of rolPermisos.entries()) {
      if (!rolPermisosInicial.has(permiso[0]!)) {
        return true;
      }
    }

    for (const permiso of rolPermisosInicial.entries()) {
      if (!rolPermisos.has(permiso[0]!)) {
        return true;
      }
    }

    return false;
  }, [rolPermisos, rolPermisosInicial]);

  async function handleDelete() {
    try {
      await deleteMut.mutateAsync({
        id: rol.id,
      });

      await util.invalidate();
      window.location.href = "/panel/roles";
      router.refresh();
      toast.message("Rol eliminado");
    } catch (e) {
      console.error("e", e);
      toast.error("Error eliminando rol");
    }
  }

  async function handleSave() {
    try {
      await setRolPermsMut.mutateAsync({
        id: rol.id,
        permisos: [...rolPermisos.values()],
      });

      await util.invalidate();
      router.refresh();
      toast.message("Permisos actualizados");
    } catch (e) {
      console.error("e", e);
      toast.error("Error actualizando permisos");
    }
  }

  const permisosMostrables: Map<PermisosValue, string> = useMemo(
    () =>
      new Map(
        Object.keys(Permisos)
          .map((permiso) => [permiso, Permisos[permiso as PermisosValue]!])
          .filter(
            (permiso) => PermisosVisibles[permiso[0]! as PermisosValue],
          ) as [PermisosValue, string][],
      ),
    [],
  );

  const permisosMostrablesFiltrados = useMemo(() => {
    return new Map(
      [...permisosMostrables.entries()].filter((v) =>
        hasPerm(v[0]),
      ),
    );
  }, [permisosMostrables]);

  // const canDelete = hasPerm("admin:roles:delete");
  const canDelete = true;
  // const canEdit = hasPerm("admin:roles:edit");
  const canEdit = true;

  if (!rol) {
    return <Title>No se encontró el rol.</Title>;
  }

  return (
    <>
      <LayoutContainer>
        <section className="space-y-2">
          <div className="flex justify-between">
            <Title>Permisos de rol "{rol.name}"</Title>
            <Button
              onClick={() => handleDelete()}
              disabled={
                !canDelete || tengoElRolAsignado
              }
            >Eliminar rol</Button>
          </div>
          <List>
            {[...permisosMostrablesFiltrados.entries()].map(
              ([permiso, nombre]) => (
                <ListTile
                  key={`perm-${permiso}`}
                  title={nombre}
                  trailing={
                    <Switch
                      /* no se puede otorgar el permiso si no tengo el permiso o si no puedo otorgar permisos */
                      disabled={
                        !canEdit ||
                        !hasPerm(permiso) ||
                        tengoElRolAsignado
                      }
                      defaultChecked={rolPermisos.has(permiso)}
                      checked={rolPermisos.has(permiso)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(rolPermisos);
                        if (checked) {
                          newSet.add(permiso);
                        } else {
                          newSet.delete(permiso);
                        }

                        setRolPermisos(newSet);
                      }}
                    />
                  }
                />
              ),
            )}
          </List>
          <Button
            onClick={() => handleSave()}
            disabled={
              !canEdit ||
              !rolPermisosActualizados ||
              tengoElRolAsignado ||
              setRolPermsMut.isLoading
            }
          >
            Guardar permisos
          </Button>
        </section>
      </LayoutContainer>
    </>
  );
}
