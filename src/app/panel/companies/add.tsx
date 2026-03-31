"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export function AddCompany({ canCreate }: { canCreate: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const mut = api.companies.create.useMutation();
  const isLoading = mut.isLoading;
  const util = api.useUtils();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  async function handleCreate() {
    await mut.mutateAsync({
      name,
    });

    setOpen(false);
    toast.success("Entidad creado exitosamente");
    await util.invalidate();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!canCreate}
      >
        Crear entidad
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear entidad</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex">
              <div className="w-full font-bold">
                <Label htmlFor="name">Nombre de la entidad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="truncate"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              disabled={isLoading || name === ""}
              onClick={handleCreate}
            >
              {isLoading ? (
                <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
              ) : (
                <PlusCircleIcon className="h-4 mr-1 stroke-1" />
              )}
              Crear entidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
