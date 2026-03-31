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
import { api } from "~/trpc/react";
import { UploadButton } from "~/utils/uploadthing";

export function AddCoinDialog() {
  const { mutateAsync: createCoin, isLoading } = api.coin.create.useMutation();

  const [description, setDescription] = useState<string>("");
  const [value, setValue] = useState<number>(0);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await createCoin({
        description,
        value,
      });

      toast.success("Moneda creada correctamente");
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
        Crear moneda
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva moneda</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>

          <div>
            <Input
              id="name"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Input
              id="name"
              placeholder="Valor"
              value={value}
              type="number"
              onChange={(e) => {
                const intValue = parseInt(e.target.value);
                setValue(intValue);
              }}
            />
          </div>

          <DialogFooter>
            <Button disabled={loading} onClick={handleCreate}>
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
