"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";

export function AddRole({ canCreateRole }: { canCreateRole: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState<string>("");

  const roleMut = api.user.createRole.useMutation();
  const { data: companies, isLoading: isLoadingComp } =
    api.companies.list.useQuery();
  const isLoading = roleMut.isLoading || isLoadingComp;
  const util = api.useUtils();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName("");
      setCompanyId("");
    }
  }, [open]);

  async function handleCreate() {
    await roleMut.mutateAsync({
      companyId,
      name,
    });

    setOpen(false);
    toast.success("Rol creado exitosamente");
    await util.invalidate();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!canCreateRole}
      >
        Crear rol
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear rol</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex">
              <div className="w-full font-bold">
                <Label htmlFor="name">Nombre del rol</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="truncate"
                />
              </div>
            </div>

            <div className="flex">
              <div className="w-full font-bold">
                <Label htmlFor="concept">Entidad asociada</Label>
                <Select
                  onValueChange={(e) => setCompanyId(e)}
                  value={companyId}
                >
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="Seleccionar entidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {(companies ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              disabled={isLoading || companyId === "" || name === ""}
              onClick={handleCreate}
            >
              {isLoading ? (
                <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
              ) : (
                <PlusCircleIcon className="h-4 mr-1 stroke-1" />
              )}
              Crear rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
