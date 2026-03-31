"use client";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Organization, auth, clerkClient } from "@clerk/nextjs/server";
import { CheckIcon, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

export default function UserPage(props: { params: { userId: string } }) {
  const { data: roles = [] } = api.user.listRoles.useQuery({
    asignables: false
  });

  const { data: user, isLoading: loadUser } = api.user.getById.useQuery({
    userId: props.params.userId,
  });

  useEffect(() => {
    if (user) {
      setRole(user?.usuarioRoles.at(0)?.roleId ?? "-");
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      // setOrganization(orgId ?? "");
    }
  }, [user]);

  const { mutateAsync: editUser, isLoading: isLoadingUser } = api.user.edit.useMutation();
  const { mutateAsync: editRole, isLoading: isLoadingRole } = api.user.assignRoles.useMutation();

  const isLoading = useMemo(() => isLoadingRole || isLoadingUser, [isLoadingRole, isLoadingUser]);

  const [role, setRole] = useState<string>(user?.usuarioRoles.at(0)?.roleId ?? "-");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function handleChange() {
    const rol = user?.usuarioRoles.at(0)?.roleId ?? "-";
    if (rol !== role) {
      if (role === "-") {
        await editRole({
          rolesId: [],
          userId: props.params.userId,
        })
      } else {
        await editRole({
          rolesId: [role],
          userId: props.params.userId,
        });
      }
    }

    editUser({
      id: props.params.userId,
      firstName,
      lastName,
    });
  }

  if (!user) {
    if (loadUser) {
      return <Loader2 className="mr-2 animate-spin" />;
    }
    return <Title>No se encontró el usuario.</Title>;
  }

  return (
    <>
      {!loadUser && (
        <LayoutContainer>
          <section className="space-y-2">
            <div className="flex justify-between">
              <Title>Modificar usuario</Title>
              <Button disabled={isLoading} onClick={handleChange}>
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
                  <h2 className="text-md">Info. del usuario</h2>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={firstName!}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name">Apellido</Label>
                          <Input
                            id="lastname"
                            value={lastName ?? ""}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-right">Rol</Label>
                          <Select
                            onValueChange={(value: string) => {
                              setRole(value);
                            }}
                            value={role}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={role} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem key={"rol--"} value={"-"}>
                                  Sin rol
                                </SelectItem>
                                {roles.map((e) => {
                                  return (
                                    <SelectItem key={"rol-" + e.id} value={e.id}>
                                      {`${e.company?.name ? `(${e.company.name}) ` : ""}${e.name}`}
                                    </SelectItem>
                                  );
                                })}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar local</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteStore storeId={props.store.identifier} />
              </div>
            </AccordionContent>
          </AccordionItem> */}
            </Accordion>
            {/* <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <h2 className="text-md">Organización</h2>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
                        <Label className="text-right">Organizaciones</Label>
                        <Select
                          onValueChange={(value: string) => {
                            setOrganizationId(value);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={
                                organizations?.data.find(
                                  (x) => x.id == organizationId,
                                )?.name ?? ""
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Organizaciones</SelectLabel>
                              {organizations?.data.map((e: Organization) => {
                                return (
                                  <SelectItem key={e.id} value={e.id}>
                                    {e.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>{" "}
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                          className="bg-red-500 hover:bg-red-600 active:bg-red-700"
                          onClick={() => {
                            removeUserFromOrganization({
                              userId: props.params.userId,
                              organizationId: organizationId,
                            });
                          }}
                        >
                          Eliminar de organización.
                        </Button>
                      </div>
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion> */}
          </section>
        </LayoutContainer>
      )}
    </>
  );
}
