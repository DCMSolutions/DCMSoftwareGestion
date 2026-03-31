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
import { RouterOutputs } from "~/trpc/shared";
import { FormPublicGeneric } from "../../parametros/util";

export default function EntPage({ ent }: { ent: RouterOutputs['companies']['getById'] }) {
  const [name, setName] = useState(ent!.name);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync: renameEntity, isLoading } = api.companies.change.useMutation();

  async function handleChange() {
    try {
      await renameEntity({
        companyId: ent!.id,
        name,
      });
      toast.success("Se ha modificado la entidad.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modificar entidad</Title>
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
              <h2 className="text-md">Info. de la entidad</h2>
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
                </div>
              </Card>
              <Card className="p-5 mt-4">
                <Label htmlFor="name">Parámetros</Label>
                <FormPublicGeneric invalidate={() => {}} keyName="tyc_link" label="URL" title="Configurar URL de términos y condiciones" />
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar entidad</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <Delete entId={ent!.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function Delete(props: { entId: string }) {
  const { mutateAsync: deleteMut, isLoading } =
    api.companies.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteMut({ companyId: props.entId }).then(() => {
      toast.success("Se ha eliminado la entidad");
      router.push("../");
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar entidad
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la entidad?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar entidad permanentemente.
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
