"use client";

import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowLeftRightIcon, PlusCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { Cupon } from "~/server/api/routers/cupones";
import { MouseEventHandler } from "react";
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

export default function CuponPage(props: { cupon: Cupon }) {
  const { mutateAsync: editarCupon } = api.cupones.change.useMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigo: props.cupon.codigo || "",
      cantidad_usos: props.cupon.cantidad_usos || 0,
      fecha_desde: props.cupon.fecha_desde || "",
      fecha_hasta: props.cupon.fecha_hasta || "",
      porcentaje:
        props.cupon.tipo_descuento === "porcentaje"
          ? props.cupon.valor_descuento
          : "",
      monto:
        props.cupon.tipo_descuento === "fijo"
          ? props.cupon.valor_descuento
          : "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await editarCupon({
        identifier: props.cupon.identifier,
        codigo: data.codigo,
        cantidad_usos: parseFloat(data.cantidad_usos),
        fecha_desde: data.fecha_desde,
        fecha_hasta: data.fecha_hasta,
        tipo_descuento: data.monto ? "fijo" : "porcentaje",
        usos: props.cupon.usos ?? 0,
        valor_descuento: data.monto
          ? parseFloat(data.monto)
          : parseFloat(data.porcentaje),
      });
      toast.success("Cupón actualizado correctamente");
      router.refresh();
    } catch (error) {
      toast.error("Error al actualizar el cupón");
    }
  };

  return (
    <section className="flex min-h-screen w-full flex-col items-center space-y-2">
      <div className="flex w-full justify-start">
        <Button className="rounded-full bg-transparent text-black shadow-none hover:bg-transparent">
          <div className="flex gap-3" onClick={() => router.back()}>
            <ArrowLeft /> Volver
          </div>
        </Button>
      </div>
      <div className="flex w-3/4 flex-grow items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-3xl space-y-4 px-4"
        >
          <div className="flex justify-between">
            <div className="w-full space-y-1">
              <label htmlFor="codigo">Código</label> <br />
              <Input
                className="w-full rounded border-2 border-buttonPick focus:border-buttonPick"
                id="codigo"
                {...register("codigo")}
              />
            </div>
          </div>{" "}
          <Title>Cantidad de usos</Title>
          <div className="w-full pb-4">
            <Tabs
              defaultValue={
                props.cupon.cantidad_usos !== -1 ? "limitado" : "ilimitado"
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ilimitado">Ilimitado</TabsTrigger>
                <TabsTrigger value="limitado">Limitado</TabsTrigger>
              </TabsList>
              <TabsContent value="limitado">
                <div className="w-full gap-4 space-y-1">
                  <label htmlFor="usos">
                    ¿Cuántas veces se podrá usar el cupón?
                  </label>{" "}
                  <br />
                  <Input
                    className="w-full rounded border-2 border-buttonPick focus:border-buttonPick"
                    type="number"
                    step="1"
                    {...register("cantidad_usos")}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <Title>Tipo de descuento</Title>
          <div className="w-full pb-4">
            <Tabs
              defaultValue={
                props.cupon.tipo_descuento === "fijo" ? "fijo" : "porcentaje"
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="porcentaje">Porcentaje</TabsTrigger>
                <TabsTrigger value="fijo">Monto Fijo</TabsTrigger>
              </TabsList>
              <TabsContent value="porcentaje">
                <div className="w-full gap-4 space-y-1">
                  <label htmlFor="porcentaje">
                    ¿Cuál es el porcentaje de descuento?
                  </label>{" "}
                  <br />
                  <Input
                    className="w-full rounded border-2 border-buttonPick focus:border-buttonPick"
                    type="number"
                    step="1"
                    {...register("porcentaje")}
                  />
                </div>
              </TabsContent>
              <TabsContent value="fijo">
                <div className="w-full space-y-1">
                  <label htmlFor="monto">¿Qué monto?</label> <br />
                  <Input
                    className="w-full rounded border-2 border-buttonPick focus:border-buttonPick"
                    type="number"
                    step="1"
                    {...register("monto")}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <Title>Período de uso</Title>
          <div className="flex justify-between gap-4">
            <div className="flex-col-6 w-full">
              <label htmlFor="fecha_desde">Fecha Desde</label>
              <br />
              <input
                id="fecha_desde"
                type="date"
                {...register("fecha_desde")}
                className="w-full border p-2"
              />
            </div>
            <div className="flex-col-6 w-full">
              <label htmlFor="fecha_hasta">Fecha Hasta</label>
              <br />
              <input
                id="fecha_hasta"
                type="date"
                {...register("fecha_hasta")}
                className="w-full border p-2"
              />
            </div>
          </div>
          <Button type="submit" className="mt-4">
            Guardar
          </Button>
          <div className="flex justify-end">
            <DeleteCupon cuponId={props.cupon.identifier} />
          </div>
        </form>
      </div>
    </section>
  );
}

function DeleteCupon(props: { cuponId: string }) {
  const { mutateAsync: deleteCupon, isLoading } =
    api.cupones.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteCupon({ cuponId: props.cuponId }).then(() => {
      toast.success("Se ha eliminado el cupón");
      router.push("/panel/cupones");
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar cupón
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar el cupón?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar cupón permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
