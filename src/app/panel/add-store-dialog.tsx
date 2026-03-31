"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { asTRPCError } from "~/lib/errors";
import { City } from "~/server/api/routers/city";
import { Locker } from "~/server/api/routers/lockers";
import { Store } from "~/server/api/routers/store";
import { api } from "~/trpc/react";
import { UploadButton } from "~/utils/uploadthing";

export function AddStoreDialog(props: { cities: City[]; lockers: Locker[] }) {
  const { mutateAsync: createStore, isLoading } =
    api.store.create.useMutation();

  const [name, setName] = useState("");
  const [cityId, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [serieLocker, setSerieLocker] = useState("");
  const [address, setAddress] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  async function handleCreate() {
    try {
      await createStore({
        name,
        image,
        cityId,
        address,
        organizationName,
        serieLocker,
        description,
      });

      toast.success("Local creado correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear local
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo local</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre del local</Label>
            <Input
              id="name"
              placeholder="ej: BuenosAires-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex">
            {/* <div className="col-6 pr-4">
              <Label className="text-right">Local</Label>
              <Select
                onValueChange={(value: string) => {
                  setCity(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Locales</SelectLabel>
                    {props.cities.map((e) => {
                      return (
                        <SelectItem key={e.identifier} value={e.identifier}>
                          {e.name}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div> */}
            <div className="col-6">
              <Label className="text-right">Locker</Label>
              <Select
                onValueChange={(value: string) => {
                  setSerieLocker(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lockers</SelectLabel>
                    {props.lockers.map((e) => {
                      return (
                        <SelectItem key={e.id} value={e.nroSerieLocker}>
                          {e.nroSerieLocker}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="col-8 py-4">
            <Label htmlFor="address">Descripción</Label>
            <Input
              id="Descripción"
              placeholder="ej: Horario: 9 a 23 hs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-8 py-4">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="ej: Rivadavia 123"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="name">Nombre de organización</Label>
            <Input
              id="orgname"
              value={organizationName!}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          <div>
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
                toast.success("Se ha subido la imagen.");
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>
          <DialogFooter>
            <Button disabled={loading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
