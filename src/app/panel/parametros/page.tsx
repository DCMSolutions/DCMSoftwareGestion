"use client";

import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";

import { PrivateConfigClaves, type PrivateConfigKeys, PublicConfigClaves, type PublicConfigKeys, PublicConfigMetodoPago, type PublicConfigMetodoPagoKeys } from "~/lib/config";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2Icon, PlusCircleIcon, XIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

/* function InsertClavePublica({ invalidate }: { invalidate: () => void }) {
  const [open, setOpen] = useState(false);
  const [clave, setClave] = useState<PublicConfigKeys | "">("");
  const [value, setValue] = useState("");
  const { mutateAsync, isLoading } = api.config.setPublicKeyAdmin.useMutation();

  useEffect(() => {
    if (clave === 'metodo_pago') {
      setValue("");
    }
  }, [clave]);

  useEffect(() => {
    if (open) {
      setClave("");
      setValue("");
    }
  }, [open]);

  async function handle() {
    if (clave === "") {
      return;
    }

    await mutateAsync({
      key: clave,
      value: value
    });

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
      Configurar clave pública
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar clave pública</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name" className="mb-2">Clave</Label>
            <Select onValueChange={v => setClave(v as PublicConfigKeys)}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="Clave" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PublicConfigClaves).map(v => 
                  <SelectItem key={`clave-id-${v}`} value={v}>{PublicConfigClaves[v as PublicConfigKeys]}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="font-bold">
            {clave === 'metodo_pago' && <>
              <Label htmlFor="valor" className="mb-2">Método de pago</Label>
              <Select onValueChange={v => setValue(v as PublicConfigMetodoPagoKeys)}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PublicConfigMetodoPago).map(v => 
                  <SelectItem key={`mp-id-${v}`} value={v}>{PublicConfigMetodoPago[v as PublicConfigMetodoPagoKeys]}</SelectItem>
                )}
              </SelectContent>
            </Select>
            </>}
            {clave !== 'metodo_pago' && <>
              <Label htmlFor="valor" className="mb-2">Valor</Label>
              <Input
                id="valor"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </>}
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            disabled={isLoading || value === "" || clave === ""}
            onClick={handle}
            className="flex rounded-full w-fit justify-self-center text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
            ) : (
              <PlusCircleIcon className="h-4 mr-1 stroke-1" />
            )}
            Configurar clave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}

function InsertClavePrivada({ invalidate }: { invalidate: () => void }) {
  const [open, setOpen] = useState(false);
  const [clave, setClave] = useState<PrivateConfigKeys | "">("");
  const [value, setValue] = useState("");
  const { mutateAsync, isLoading } = api.config.setPrivateKeyAdmin.useMutation();

  useEffect(() => {
    if (open) {
      setClave("");
      setValue("");
    }
  }, [open]);

  async function handle() {
    if (clave === "") {
      return;
    }

    await mutateAsync({
      key: clave,
      value: value
    });

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
      Configurar clave privada
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar clave privada</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="name" className="mb-2">Clave</Label>
            <Select onValueChange={v => setClave(v as PrivateConfigKeys)}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="Clave" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PrivateConfigClaves).map(v => 
                  <SelectItem key={`clave-id-${v}`} value={v}>{PrivateConfigClaves[v as PrivateConfigKeys]}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="font-bold">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            disabled={isLoading || value === "" || clave === ""}
            onClick={handle}
            className="flex rounded-full w-fit justify-self-center text-[#3E3E3E] bg-[#d0d0d0] hover:bg-[#ffffff]"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
            ) : (
              <PlusCircleIcon className="h-4 mr-1 stroke-1" />
            )}
            Configurar clave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
} */

function FormMetodoPago({ invalidate }: { invalidate: () => void }) {
  const [open, setOpen] = useState(false);
  const [metodo, setMetodo] = useState<PublicConfigMetodoPagoKeys>("mercadopago");
  const [clave1, setClave1] = useState("");
  const [clave2, setClave2] = useState("");
  const [clave3, setClave3] = useState("");
  const [clave4, setClave4] = useState("");
  const { mutateAsync: setPrivateKey, isLoading: isLoadingPrivate } = api.config.setPrivateKeyAdmin.useMutation();
  const { mutateAsync: setPublicKey, isLoading: isLoadingPublic } = api.config.setPublicKeyAdmin.useMutation();
  const { data: claveOriginalMetodo, refetch: refetch1 } = api.config.getKey.useQuery({ key: 'metodo_pago' });
  const { data: claveOriginalPublicaMp, refetch: refetch2 } = api.config.getKey.useQuery({ key: 'mercadopago_public_key' });
  const { data: claveOriginalPrivadaMp, refetch: refetch3 } = api.config.getPrivateKey.useQuery({ key: 'mercadopago_private_key' });
  const { data: claveOriginalWhMp, refetch: refetch4 } = api.config.getPrivateKey.useQuery({ key: 'mercadopago_webhook_key' });
  const { data: claveOriginalWhUrl, refetch: refetch5 } = api.config.getPrivateKey.useQuery({ key: 'mercadopago_webhook_url' });
  const { data: claveMobbexApi, refetch: refetch6 } = api.config.getPrivateKey.useQuery({ key: 'mobbex_api_key' });
  const { data: claveMobbexToken, refetch: refetch7 } = api.config.getPrivateKey.useQuery({ key: 'mobbex_access_token' });

  const isLoading = isLoadingPrivate || isLoadingPublic;

  useEffect(() => {
    if (open) {
      setMetodo((claveOriginalMetodo?.value ?? "mercadopago") as PublicConfigMetodoPagoKeys);
    }
  }, [open]);

  useEffect(() => {
    if (metodo === 'mercadopago' && claveOriginalPublicaMp) {
      setClave1(claveOriginalPublicaMp.value);
    } else if (metodo === 'mercadopago') {
      setClave1("");
    }

    if (metodo === 'mercadopago' && claveOriginalPrivadaMp) {
      setClave2(claveOriginalPrivadaMp.value);
    } else if (metodo === 'mercadopago') {
      setClave2("");
    }

    if (metodo === 'mercadopago' && claveOriginalWhMp) {
      setClave3(claveOriginalWhMp.value);
    }

    if (metodo === 'mercadopago' && claveOriginalWhUrl) {
      setClave4(claveOriginalWhUrl.value);
    }

    if (metodo === 'mobbex' && claveMobbexApi) {
      setClave1(claveMobbexApi.value);
    } else if (metodo === 'mobbex') {
      setClave1("");
    }

    if (metodo === 'mobbex' && claveMobbexToken) {
      setClave2(claveMobbexToken.value);
    } else if (metodo === 'mobbex') {
      setClave2("");
    }
  }, [metodo, claveOriginalPublicaMp, claveOriginalPrivadaMp, claveMobbexApi, claveMobbexToken, claveOriginalMetodo, claveOriginalWhUrl, claveOriginalWhMp]);

  async function handle() {
    await setPublicKey({ key: 'metodo_pago', value: metodo });

    if (metodo === 'mobbex') {
      await setPrivateKey({ key: 'mobbex_api_key', value: clave1 });
      await setPrivateKey({ key: 'mobbex_access_token', value: clave2 });
    } else if (metodo === 'mercadopago') {
      await setPublicKey({ key: 'mercadopago_public_key', value: clave1 });
      await setPrivateKey({ key: 'mercadopago_private_key', value: clave2 });
      await setPrivateKey({ key: 'mercadopago_webhook_key', value: clave3 });
      await setPrivateKey({ key: 'mercadopago_webhook_url', value: clave4 });
    }

    // no furula api.useUtils()
    await refetch1();
    await refetch2();
    await refetch3();
    await refetch4();
    await refetch5();
    await refetch6();
    await refetch7();

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
      Configurar método de pago
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar método de pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="valor" className="mb-2">Método de pago</Label>
            <Select onValueChange={v => setMetodo(v as PublicConfigMetodoPagoKeys)} value={metodo}>
              <SelectTrigger className="font-bold">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PublicConfigMetodoPago).map(v => 
                  <SelectItem key={`mp-id-${v}`} value={v}>{PublicConfigMetodoPago[v as PublicConfigMetodoPagoKeys]}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="font-bold">
            <Label htmlFor="clave1">{metodo === 'mercadopago' ? "Clave pública de Mercado Pago" : 'Clave API de Mobbex'}</Label>
            <Input
              id="clave1"
              value={clave1}
              onChange={(e) => setClave1(e.target.value)}
              required
            />
          </div>

          <div className="font-bold">
            <Label htmlFor="clave2">{metodo === 'mercadopago' ? "Clave privada de Mercado Pago" : 'Token de acceso de Mobbex'}</Label>
            <Input
              id="clave2"
              value={clave2}
              onChange={(e) => setClave2(e.target.value)}
              required
            />
          </div>

          {metodo === 'mercadopago' && <div className="font-bold">
            <Label htmlFor="clave3">Clave secreta de Webhook de Mercado Pago</Label>
            <Input
              id="clave3"
              value={clave3}
              onChange={(e) => setClave3(e.target.value)}
              required
            />
          </div>}

          {metodo === 'mercadopago' && <div className="font-bold">
            <Label htmlFor="clave4">URL de Webhook de Mercado Pago</Label>
            <Input
              id="clave4"
              value={clave4}
              onChange={(e) => setClave4(e.target.value)}
              required
            />
          </div>}
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

export default function LockerOcupationPage() {
  // Consulta de datos con fechas seleccionadas
  const { data: timeOut } = api.params.getTimeOut.useQuery();
  const { data: privateConfigs, refetch: refetchPrivate } = api.config.listPrivateAdmin.useQuery();
  const { data: publicConfigs, refetch: refetchPublic } = api.config.listPublicAdmin.useQuery();
  const { mutateAsync: deletePrivateKey } = api.config.deletePrivateKeyAdmin.useMutation();
  const { mutateAsync: deletePublicKey } = api.config.deletePublicKeyAdmin.useMutation();

  async function invalidate() {
    await refetchPrivate();
    await refetchPublic();
  }

  return (
    <LayoutContainer>
      <div className="w-full flex justify-between">
        <h2 className="text-2xl font-semibold mb-3"></h2>
        <div className="flex flex-row">
          {/* <InsertClavePublica invalidate={invalidate} />
          <InsertClavePrivada invalidate={invalidate} /> */}
          <FormMetodoPago invalidate={invalidate} />
        </div>
      </div>
      <section className="space-y-2">
        <div>(Servidor) TimeOut Mobbex: {timeOut}</div>
        {/* {(privateConfigs ?? []).map(v => <div key={`pc-${v.key}`}>
          <Button onClick={async () => {
            await deletePrivateKey({ key: v.key as PrivateConfigKeys });
            await invalidate();
          }}><XIcon /></Button> (Configuración privada) {PrivateConfigClaves[v.key as PrivateConfigKeys]}: {v.value}
        </div>)}
        {(publicConfigs ?? []).map(v => <div key={`pc-${v.key}`}>
          <Button onClick={async () => {
            await deletePublicKey({ key: v.key as PublicConfigKeys });
            await invalidate();
          }}><XIcon /></Button> (Configuración pública) {PublicConfigClaves[v.key as PublicConfigKeys]}: {v.value}
        </div>)} */ }
      </section>
    </LayoutContainer>
  );
}
