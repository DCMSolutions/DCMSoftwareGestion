"use client";

import { CheckIcon, Loader2 } from "lucide-react";
import { MouseEventHandler, useState } from "react";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "~/utils/uploadthing";
import { Client } from "~/server/api/routers/clients";
import { List, ListTile } from "~/components/list";
import { Reserves } from "~/server/api/routers/reserves";

export default function ClientPage({
  client,
  reservasRecord,
}: {
  client: Client;
  reservasRecord: any;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(client!.name);
  const [surname, setSurname] = useState(client!.surname);
  const [email, setEmail] = useState(client!.email);
  const [prefijo, setPrefijo] = useState(client!.prefijo);
  const [telefono, setTelefono] = useState(client!.telefono);
  const [dni, setDni] = useState(client!.dni);
  const { mutateAsync: renameclient, isLoading } =
    api.clients.change.useMutation();

  const { data: stores } = api.store.get.useQuery();
  const router = useRouter();

  async function handleChange() {
    try {
      await renameclient({
        identifier: client.identifier!,
        name,
        surname,
        email,
        prefijo,
        telefono,
      });
      toast.success("Se ha modificado el cliente.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modificar cliente</Title>
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
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Info. del cliente</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name!}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Apellido</Label>
                    <Input
                      id="name"
                      value={surname!}
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </div>{" "}
                  <div>
                    <Label htmlFor="name">Email</Label>
                    <Input id="name" value={email!} disabled={true} />
                  </div>{" "}
                  <div>
                    <Label htmlFor="name">Prefijo</Label>
                    <Input
                      id="name"
                      value={prefijo!}
                      onChange={(e) => setPrefijo(parseInt(e.target.value))}
                    />
                  </div>{" "}
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="number"
                      value={telefono!}
                      onChange={(e) => setTelefono(parseInt(e.target.value))}
                    />
                  </div>{" "}
                  <div>
                    <Label htmlFor="dni">DNI/PASAPORTE</Label>
                    <Input
                      id="dni"
                      type="dni"
                      value={dni!}
                      onChange={(e) => setDni(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Reservas realizadas</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List className="border-none">
                {reservasRecord &&
                  Object.entries(reservasRecord).map(([key, reservas]) => {
                    const reservasArray = reservas as Reserves[];
                    return reservasArray.map((reserva: Reserves) => (
                      <ListTile
                        key={reserva.nReserve}
                        className="border-none"
                        href={`/panel/reservas/${reserva.nReserve}`}
                        leading={reserva.nReserve}
                        title={`Local: ${
                          stores?.find((x) => x.lockers.some(l => l.serieLocker === reserva.NroSerie))
                            ?.name
                        }. Fecha inicio: ${reserva.FechaInicio?.split("T")[0]}. Fecha fin: ${reserva.FechaFin?.split("T")[0]}`}
                      />
                    ));
                  })}
              </List>
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar cliente</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel clientId={client.identifier!} />
              </div>
            </AccordionContent>
          </AccordionItem> */}
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { clientId: number }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.clients.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ id: props.clientId }).then(() => {
      toast.success("Se ha eliminado el cliente");
      router.push("../");
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar cliente
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar el cliente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar cliente permanentemente.
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
