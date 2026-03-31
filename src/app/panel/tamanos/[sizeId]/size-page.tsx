"use client";

import { CheckIcon, Loader2 } from "lucide-react";
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

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "~/utils/uploadthing";
import { Size } from "~/server/api/routers/sizes";
import { useState } from "react";

export default function SizePage(props: { size: Size }) {
  const [name, setName] = useState(props.size.nombre);
  const [loading, setLoading] = useState(false);
  const { mutateAsync: renameStore, isLoading } =
    api.size.changeImage.useMutation();
  const [image, setImage] = useState<string>("");
  const router = useRouter();

  async function handleChange() {
    try {
      await renameStore({
        id: props.size!.id,

        image,
      });
      toast.success("Se ha modificado el tamaño.");
      router.refresh();
    } catch {
      toast.error("Error");
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Tamaño</Title>
          <Button disabled={isLoading || loading} onClick={handleChange}>
            {isLoading || loading ? (
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
              <h2 className="text-md">Info. del tamaño</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={props.size.nombre!} />
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
        </Accordion>
      </section>
    </LayoutContainer>
  );
}
