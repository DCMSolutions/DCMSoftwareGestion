"use client";

import { CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useEffect, useState } from "react";
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
import type { City } from "~/server/api/routers/city";
import { toast } from "sonner";
import { UploadButton } from "~/utils/uploadthing";
import type { Store } from "~/server/api/routers/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Locker } from "~/server/api/routers/lockers";
import type { TRPCError } from "@trpc/server";
import { MultiSelect } from "~/components/multi-select";
import type { Coin } from "~/server/api/routers/coin";
import type { Size } from "~/server/api/routers/sizes";
import { AddFeeDialog } from "../../add-fee-dialog";
import { List, ListTile } from "~/components/list";
import type { Fee } from "~/server/api/routers/fee";

export default function StorePage(props: {
  store: Store;
  cities: City[];
  lockers: Locker[];
  coins: Coin[];
  sizes: Size[];
  fees: Fee[];
}) {
  const [name, setName] = useState(props.store.name);
  const [cityId, setCity] = useState(props.store.cityId);
  const [serieLockers, setSerieLockers] = useState(props.store.lockers.map(v => v.serieLocker));
  const [address, setAddress] = useState(props.store.address);
  const [description, setDescription] = useState(props.store.description ?? "");
  const [organizationName, setOrganizationName] = useState(
    props.store.organizationName!,
  );
  const [loading, setLoading] = useState(false);
  const { mutateAsync: renameStore, isLoading } =
    api.store.change.useMutation();
  const [image, setImage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const r = props.store.lockers.map(v => v.serieLocker);
    setSerieLockers(r);
  }, [props.store]);

  async function handleChange() {
    try {
      await renameStore({
        identifier: props.store.identifier,
        name,
        image,
        cityId,
        address,
        organizationName,
        description,
        serieLockers: serieLockers
      });
      toast.success("Se ha modificado el local.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modificar local</Title>
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
              <h2 className="text-md">Info. del local</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-right">Ciudad</Label>
                    <Select
                      onValueChange={(value: string) => {
                        setCity(value);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={props.store.city?.name} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Ciudades</SelectLabel>
                          {props.cities.map((e) => {
                            return (
                              <SelectItem
                                key={e.identifier}
                                value={e.identifier}
                              >
                                {e.name}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Dirección</Label>
                    <Input
                      id="address"
                      value={address!}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Descripción</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre de organización</Label>
                    <Input
                      id="orgname"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Imagen</Label>
                    <UploadButton
                      appearance={{
                        button: "btn btn-success ",
                        container:
                          "w-max flex-row rounded-md border-cyan-300 px-3 bg-slate-800 text-xs",
                        allowedContent: "text-white text-xs",
                      }}
                      endpoint="imageUploader"
                      onUploadProgress={() => {
                        setLoading(true);
                      }}
                      onClientUploadComplete={(res) => {
                        // Do something with the response
                        // setImage(res.keys.arguments);
                        setLoading(false);
                        setImage(res[0]!.url);
                        toast.success("Imagen cargada con éxito.");
                      }}
                      onUploadError={(error: Error) => {
                        // Do something with the error.
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Tarifas</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div>
                  <AddFeeDialog coins={props.coins} sizes={props.sizes} localId={props.store.identifier} />
                  <List className="mt-3">
                    {props.fees.map((fee) => {
                      return (
                        <ListTile
                          href={`/panel/tarifas/${fee.identifier}`}
                          title={fee.description}
                        />
                      );
                    })}
                  </List>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              <h2 className="text-md">Lockers</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <MultiSelect
                      onValueChange={setSerieLockers}
                      value={serieLockers}
                      defaultValue={props.store.lockers.map(v => v.serieLocker)}
                      options={props.lockers.map(v => ({
                        label: v.nroSerieLocker,
                        value: v.nroSerieLocker
                      }))}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar local</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteStore storeId={props.store.identifier} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteStore(props: { storeId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.store.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ id: props.storeId })
      .then(() => {
        toast.success("Se ha eliminado la ciudad");
        router.push("../");
      })
      .catch((e: TRPCError) => {
        toast.error(e.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar local
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar el local?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar local permanentemente.
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
