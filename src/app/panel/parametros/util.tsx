import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PrivateConfigKeys, PublicConfigKeys } from "~/lib/config";
import { api } from "~/trpc/react";

export function FormPrivateGeneric({
  invalidate,
  keyName,
  title,
  label
}: {
  invalidate: () => void,
  keyName: PrivateConfigKeys,
  title: string,
  label: string
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { mutateAsync: setPrivateKey, isLoading: isLoadingPublic } = api.config.setPrivateKeyAdmin.useMutation();
  const { data: claveOriginal, refetch: refetch1 } = api.config.getPrivateKey.useQuery({ key: keyName });
  const isLoading = isLoadingPublic;

  useEffect(() => {
    if (open) {
      setValue(claveOriginal?.value ?? "");
    }
  }, [open]);

  useEffect(() => {
    setValue(claveOriginal?.value ?? "");
  }, [claveOriginal]);

  async function handle() {
    await setPrivateKey({ key: keyName, value: value.trim() });
    await refetch1();
    invalidate();
    setOpen(false);
  }

  return <div className="m-2">
    <Button onClick={() => setOpen(true)} className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]">
      {isLoading ? (
        <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
      ) : (
        <PlusCircleIcon className="h-5 mr-1 stroke-1" />
      )}
      {title}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="valor" className="mb-2">{label}</Label>
            <Input
              value={value}
              onChange={(v) => setValue(v.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            disabled={isLoading}
            onClick={handle}
            className="flex rounded-full w-fit justify-self-center text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
            ) : (
              <PlusCircleIcon className="h-4 mr-1 stroke-1" />
            )}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}

export function FormPublicGeneric({
  invalidate,
  keyName,
  title,
  label
}: {
  invalidate: () => void,
  keyName: PublicConfigKeys,
  title: string,
  label: string
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { mutateAsync: setPublicKey, isLoading: isLoadingPublic } = api.config.setPublicKeyAdmin.useMutation();
  const { data: claveOriginal, refetch: refetch1 } = api.config.getKeyProt.useQuery({ key: keyName });
  const isLoading = isLoadingPublic;

  useEffect(() => {
    if (open) {
      setValue(claveOriginal?.value ?? "");
    }
  }, [open]);

  useEffect(() => {
    setValue(claveOriginal?.value ?? "");
  }, [claveOriginal]);

  async function handle() {
    await setPublicKey({ key: keyName, value: value.trim() });
    await refetch1();
    invalidate();
    setOpen(false);
  }

  return <div className="m-2">
    <Button onClick={() => setOpen(true)} className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]">
      {isLoading ? (
        <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
      ) : (
        <PlusCircleIcon className="h-5 mr-1 stroke-1" />
      )}
      {title}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="valor" className="mb-2">{label}</Label>
            <Input
              value={value}
              onChange={(v) => setValue(v.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            disabled={isLoading}
            onClick={handle}
            className="flex rounded-full w-fit justify-self-center text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
            ) : (
              <PlusCircleIcon className="h-4 mr-1 stroke-1" />
            )}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}