"use client";

import { AxeIcon, CheckIcon, Loader2, X } from "lucide-react";
import { MouseEventHandler, useState } from "react";
import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { NavUserData } from "~/components/nav-user-section";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card } from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "~/utils/uploadthing";
import { Role } from "~/server/api/routers/roles";
import { Badge } from "~/components/ui/badge";
import { routeModule } from "next/dist/build/templates/app-page";
import { Permission } from "~/server/api/routers/permissions";

export default function RolePage(props: {
  role: Role;
  permissions: Permission[];
}) {
  const [permissions, setPermissions] = useState(props.permissions);
  const [description, setDescription] = useState(props.role!.description);
  const [permission, setPermission] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { mutateAsync: renameRole, isLoading } = api.roles.change.useMutation();
  const { mutateAsync: addPermissionToRole } =
    api.permissions.permissionToRole.useMutation();
  const [rolesPermissions, setRolesPermissions] = useState<string[]>([]);
  const router = useRouter();

  async function handleChange() {
    try {
      await renameRole({
        identifier: props.role!.id,
        description,
      });
      if (rolesPermissions) {
      }
      addPermissionToRole({
        roleId: props.role.id,
        permissions: rolesPermissions,
      });
      toast.success("Se ha modificado el rol.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }
  function handleAdd() {}

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modificar rol</Title>
          <Button disabled={loading} onClick={handleChange}>
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckIcon className="mr-2" />
            )}
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. del rol</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Descripción</Label>
                    <Input
                      id="name"
                      value={description!}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="">
                    <Label htmlFor="name">Permisos</Label>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                      <Select
                        onValueChange={(value: string) => {
                          // setRole(value);
                          setPermission(value);
                          console.log(value);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue
                          // placeholder={permissions}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Seleccione un permiso</SelectLabel>

                            {permissions?.map((e) => {
                              return (
                                <SelectItem
                                  key={e.id}
                                  value={e.id!}
                                  disabled={rolesPermissions.includes(e.id)}
                                >
                                  {e.description}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          if (permission) {
                            setRolesPermissions([
                              ...rolesPermissions,
                              permission,
                            ]);
                          }
                        }}
                      >
                        Agregar permiso
                      </Button>
                    </div>

                    <div className="flex w-full flex-wrap pt-3">
                      {permissions?.map((path, index) => (
                        <div
                          key={path}
                          className="mb-2 flex items-center gap-3"
                        >
                          <Badge className="mr-2">
                            {path}
                            <X
                              color="red"
                              className="pl-2"
                              onClick={() => {
                                console.log(access.includes(path));
                                // if (access.(path)) {
                                //   toast.success("Ya contiene esta ruta");
                                // } else {
                                //   console.log(access.filter((x) => x != path));
                                setAccess(access.filter((x) => x != path));
                                // }
                              }}
                            ></X>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar rol</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel roleId={props.role.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { roleId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.roles.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ id: props.roleId }).then(() => {
      toast.success("Se ha eliminado el rol");
      router.push("../");
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar rol
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la rol?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar rol permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
