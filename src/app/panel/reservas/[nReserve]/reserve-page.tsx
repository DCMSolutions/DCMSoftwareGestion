"use client";

import LayoutContainer from "~/components/layout-container";
import { useRouter } from "next/navigation";
import { Reserves } from "~/server/api/routers/reserves";
import { Title } from "~/components/title";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Size } from "~/server/api/routers/sizes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit,
  Loader2,
  LoaderIcon,
  Save,
  X,
} from "lucide-react";
import { MouseEventHandler, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { asTRPCError } from "~/lib/errors";
import { Button, buttonVariants } from "~/components/ui/button";
import QRCode from "react-qr-code";
import { DayPicker } from "react-day-picker";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Store } from "~/server/api/routers/store";

export default function ReservePage(props: {
  reserve: Reserves[];
  sizes: Size[];
  transaction: any;
  isAdmin: boolean;
  store: Store | undefined;
}) {
  const { data: plazoReserva } = api.config.getKeyProt.useQuery({ key: "reserve_from_now" });
  const isReserveModeNow = useMemo(() => (plazoReserva?.value.trim().toLowerCase() ?? "false") === "true", [plazoReserva]);

  const { store } = props;
  const [edit, setEdit] = useState(false);
  const { reserve } = props;
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(reserve[0]?.FechaFin!),
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(reserve[0]?.FechaInicio!),
  );
  if (reserve.length <= 0) return <Title>No se encontró la reserva</Title>;

  const { mutateAsync: updateReserve } =
    api.reserve.updateReserve.useMutation();

  function formatDateToTextDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = format(date, "eee dd MMMM", { locale: es });
    return formattedDate;
  }

  function formatDateToTextDateComplete(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = format(date, "eee dd MMMM HH:mm", { locale: es });
    return formattedDate;
  }

  function getSize(idSize: number) {
    const size = props.sizes!.find((s: Size) => s.id === idSize);
    return size!.nombre;
  }

  if (reserve.length <= 0) return <Title>No se encontró la reserva</Title>;
  if (!props.transaction)
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );
  function handleSave() {
    if (startDate && endDate) {
      updateReserve({
        identifier: reserve[0]!.identifier!,
        FechaInicio: startDate.toISOString(),
        FechaFin: endDate.toISOString(),
      }).then(() => {
        setEdit(false);
      });
    }
  }
  function handleCancel() {
    setStartDate(new Date(reserve[0]?.FechaInicio!));
    setEndDate(new Date(reserve[0]?.FechaFin!));
  }
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="w-auto overflow-hidden rounded-3xl bg-white shadow-md ">
          <div className="flex gap-5 bg-[#848484] px-6 pb-2 pt-3">
            <p className="text-lg font-bold text-white">
              Reserva n° {reserve[0]!.nReserve}
            </p>
            <p className="text-lg font-bold text-white">{store?.name}</p>
            {props.isAdmin &&
              (!edit ? (
                <div className="ml-auto">
                  <Button
                    onClick={() => setEdit(true)}
                    variant="ghost"
                    className="hover:bg-slate-300"
                  >
                    <Edit />
                  </Button>
                </div>
              ) : (
                <div className="ml-auto">
                  <Button
                    onClick={() => setEdit(false)}
                    variant="ghost"
                    className="hover:bg-green-200"
                  >
                    <Save onClick={handleSave} />
                  </Button>
                  <Button
                    onClick={() => setEdit(false)}
                    variant="ghost"
                    className="hover:bg-red-200"
                  >
                    <X onClick={handleCancel} />
                  </Button>
                </div>
              ))}
          </div>
          <div className="flex justify-between bg-gray-100 px-8 pb-2 pt-1">
            <div className="  ">
              <p className=" mb-0 text-xxs">Nombre y Apellido</p>

              <p className=" mt-0 text-base font-bold text-orange-500">
                {reserve[0]!.clients?.name} {reserve[0]!.clients?.surname}
              </p>
              <p className=" mb-0 mt-3 text-xxs">Email</p>

              <p className=" mt-0 text-base font-bold text-orange-500">
                {reserve[0]!.clients?.email}
              </p>
              <p className=" mt-3   text-xxs">Telefono</p>
              <p className=" mt-0 text-base font-bold text-orange-500">
                {reserve[0]!.clients?.telefono}
              </p>
            </div>

            <div className="">
              {" "}
              <p className=" mb-0 text-xxs">Locker </p>
              <p className=" mt-0 text-base font-bold text-orange-500">
                {reserve[0]!.NroSerie}
              </p>
              <p className=" mb-0 mt-3 text-xxs">Local </p>
              <p className=" mt-0 text-base font-bold text-orange-500">
                {store?.name}
              </p>{" "}
            </div>

            <div className="  ">
              <p className=" mb-0 text-xxs ">Organización </p>
              <p className=" mt-0 text-base font-bold text-orange-500">
                {store?.organizationName}
              </p>
              {!edit ? (
                <>
                  <p className="mb-0 mt-3 text-xxs">Fecha inicio</p>
                  <p className="mt-0 text-base font-bold text-orange-500">
                    {isReserveModeNow ? formatDateToTextDateComplete(startDate?.toISOString() ?? "") : formatDateToTextDate(startDate?.toISOString() ?? "")}
                  </p>
                  <p className="mb-0 mt-3 text-xxs">Fecha fin</p>
                  <p className="mt-0 text-base font-bold text-orange-500">
                    {isReserveModeNow ? formatDateToTextDateComplete(endDate?.toISOString() ?? "") : formatDateToTextDate(endDate?.toISOString() ?? "")}
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-0 mt-3 text-xxs">Fecha inicio</p>
                  <DayPicker
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    showOutsideDays={true}
                    className={cn("p-3")}
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-buttonPick rounded-full p-0 opacity-50 hover:opacity-100",
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                        "[&:has([aria-selected])]:rounded-md",
                      ),
                      day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                      ),
                      day_selected:
                        "bg-buttonHover text-primary-foreground hover:bg-buttonHover hover:text-primary-foreground focus:bg-buttonPick focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                    }}
                    components={{
                      IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
                      IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
                    }}
                  />
                  <p className="mb-0 mt-3 text-xxs">Fecha fin</p>
                  <DayPicker
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    showOutsideDays={true}
                    className={cn("p-3")}
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-buttonPick rounded-full p-0 opacity-50 hover:opacity-100",
                      ),
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell:
                        "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                        "[&:has([aria-selected])]:rounded-md",
                      ),
                      day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                      ),
                      day_selected:
                        "bg-buttonHover text-primary-foreground hover:bg-buttonHover hover:text-primary-foreground focus:bg-buttonPick focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                    }}
                    components={{
                      IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
                      IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center bg-[#e2f0e9] py-1">
            <div className=" pb-3 pt-3 text-sm">
              <div className="grid grid-cols-2 gap-x-28">
                {reserve.map((r) => {
                  return (
                    <div
                      key={r.IdSize}
                      className="flex flex-col items-start text-sm"
                    >
                      <div className="py-3 font-semibold">
                        <p>
                          <QRCode
                            className="w-full"
                            size={256}
                            style={{ height: "auto", width: "50%" }}
                            value={r.Token1?.toString() ?? "0"}
                            viewBox={`0 0 256 256`}
                          />
                        </p>
                        <div className="flex items-center text-sm">
                          <p>Token ({getSize(r.IdSize!)})</p>
                          <p className="px-4 text-[#848484]">{r.Token1}</p>
                        </div>{" "}
                        <div className="flex items-center text-sm">
                          <p>Box</p>
                          <p className="px-4 text-[#848484]">
                            {r.IdFisico ?? (
                              <a className="text-xs">Sin asignar</a>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between  bg-gray-100 px-6 py-3">
            <p className="font-bold text-black">Total</p>
            <div className="flex items-baseline">
              <p className="text-xs font-bold text-black"> ARS </p>
              <p className=" font-bold text-black">
                {props.transaction?.amount}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* <DeleteReserve nReserve={reserve[0]!.nReserve!}></DeleteReserve> */}
    </LayoutContainer>
  );
}

function DeleteReserve(props: { nReserve: number }) {
  const { mutateAsync: deleteReserve, isLoading } =
    api.reserve.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteReserve({ nReserve: props.nReserve })
      .then(() => {
        router.push("../");
        toast.success("Se ha eliminado la reserva");
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar reserva
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la reserva?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar reserva permanentemente.
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
