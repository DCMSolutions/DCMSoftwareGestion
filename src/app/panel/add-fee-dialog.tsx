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
import { Coin } from "~/server/api/routers/coin";
import { Size } from "~/server/api/routers/sizes";
import { Store } from "~/server/api/routers/store";
import { api } from "~/trpc/react";
import { UploadButton } from "~/utils/uploadthing";

export function AddFeeDialog(props: { coins: Coin[]; sizes: Size[], localId?: string }) {
  const { mutateAsync: createFee, isLoading } = api.fee.create.useMutation();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [coin, setCoin] = useState("");
  const [size, setSize] = useState<number>();
  const [value, setValue] = useState<number>();
  const [discount, setDiscount] = useState<number>();

  const router = useRouter();

  async function handleCreate() {
    try {
      await createFee({
        description,
        coin,
        value,
        size,
        discount,
        localId: props.localId,
      });

      toast.success("Tarifa creada correctamente");
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
        Crear tarifa
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva tarifa</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Input
              id="name"
              placeholder="Descripción"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Input
              id="name"
              placeholder="Valor"
              onChange={(e) => setValue(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Input
              id="discount"
              placeholder="Descuento"
              type="number"
              onChange={(e) => {
                const intValue = parseInt(e.target.value);
                setDiscount(intValue);
              }}
            />
          </div>
          <div>
            <Label className="text-right">Moneda</Label>
            <Select
              onValueChange={(value: string) => {
                setCoin(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Seleccione una moneda</SelectLabel>
                  {props.coins.map((e) => {
                    return (
                      <SelectItem key={e.identifier} value={e.identifier}>
                        {e.description}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-right">Tamaño</Label>
            <Select
              onValueChange={(value: string) => {
                const intValue = parseInt(value);
                setSize(intValue);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Seleccione un tamaño</SelectLabel>
                  {props.sizes.map((e) => {
                    return (
                      <SelectItem
                        disabled={e.tarifa != null}
                        key={e.id}
                        value={`${e.id}`}
                      >
                        {e.nombre}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear tarifa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
