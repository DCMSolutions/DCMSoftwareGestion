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
import { City } from "~/server/api/routers/city";
import { toast } from "sonner";
import { UploadButton } from "~/utils/uploadthing";

export default function CityPage({ city }: { city: City }) {
  const [name, setName] = useState(city!.name);
  const [descripcion, setDescripcion] = useState(city!.name);
  const [loading, setLoading] = useState(false);
  const { mutateAsync: renameCity, isLoading } = api.city.change.useMutation();
  const [image, setImage] = useState<string>("");
  const router = useRouter();

  async function handleChange() {
    try {
      await renameCity({
        identifier: city!.identifier,
        name,
        image,
      });
      toast.success("Se ha modificado la ciudad.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modificar ciudad</Title>
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
              <h2 className="text-md">Info. de la ciudad</h2>
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
                    <Label htmlFor="name">Descripción</Label>
                    <Input
                      id="name"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Imagen</Label>
                    <UploadButton
                      appearance={{
                        button: "btn btn-success w-full",
                        container:
                          "w-max flex-row rounded-md border-cyan-200 px-3 bg-slate-800 text-xs",
                        allowedContent: "text-white text-xs",
                      }}
                      endpoint="imageUploader"
                      onUploadProgress={() => {
                        setLoading(true);
                      }}
                      onClientUploadComplete={(res) => {
                        setLoading(false);
                        setImage(res[0]?.url!);
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

          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar ciudad</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel cityId={city.identifier} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { cityId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.city.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ id: props.cityId }).then(() => {
      toast.success("Se ha eliminado la ciudad");
      router.push("../");
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar ciudad
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la ciudad?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar ciudad permanentemente.
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
