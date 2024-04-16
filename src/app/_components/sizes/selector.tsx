"use client";
import { useEffect, useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Size } from "~/server/api/routers/sizes";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import { differenceInDays, format } from "date-fns";
import { Car } from "lucide-react";
import styles from "selector.module.css";
import { Fee } from "~/server/api/routers/fee";

export default function SizeSelector(props: {
  size: Size | null;
  setSize: (size: Size) => void;
  nroSerieLocker: string | null;
  inicio: string | undefined;
  fin: string | undefined;
  setSizeSelected: (sizeSelected: boolean) => void;
  sizeSelected: boolean;
  reserves: Reserve[] | null;
  setReserves: (reserves: Reserve[]) => void;
  startDate: string;
  endDate: string;
}) {
  // const [reservas, setReservas] = useState<Reserve[]>();
  const [values, setValues] = useState<Record<string, number>>({});
  const [price, setPrice] = useState<number>(0);
  const { data: fees } = api.fee.get.useQuery();
  const { data: sizes, isLoading } = api.size.getAvailability.useQuery({
    nroSerieLocker: props.nroSerieLocker!,
    inicio: props.inicio!,
    fin: props.fin!,
  });
  useEffect(() => {
    try {
      if (values) {
        const newReserves: Reserve[] = Object.entries(values).map(
          ([id, cantidad]) => ({
            IdLocker: null,
            NroSerie: props.nroSerieLocker,
            IdSize: parseInt(id),
            IdBox: null,
            Token1: null,
            FechaCreacion: format(Date.now(), "yyyy-MM-dd'T'00:00:00"),
            FechaInicio: props.startDate!,
            FechaFin: props.endDate!,
            Contador: -1,
            Confirmado: false,
            Modo: "Por fecha",
            Cantidad: cantidad,
            client: "ansel",
          }),
        );

        // const updatedReserves = props.reserves
        //   ? [...props.reserves, ...newReserves]
        //   : [...newReserves];
        // props.setReserves(updatedReserves);

        if (fees) {
          let totalPrice = 0; // Variable local para llevar un seguimiento de la suma total

          const prices: Record<number, number> = {};
          newReserves.forEach((reserve) => {
            const days = differenceInDays(
              reserve?.FechaFin!,
              reserve?.FechaCreacion!,
            );

            const price = fees?.find(
              (s: Fee) => s.size === reserve.IdSize,
            )?.value!;
            const discount = fees?.find(
              (s: Fee) => s.size === reserve.IdSize,
            )?.discount!;

            prices[reserve.IdSize!] = price;
            if (days >= 1) {
              totalPrice +=
                price * reserve.Cantidad! +
                (price * reserve.Cantidad! * days * (100 - discount)) / 100; // Sumar al total local
            } else {
              totalPrice += price * reserve.Cantidad!;
            }
          });
          totalPrice = parseFloat(totalPrice.toFixed(2));
          if (totalPrice != 0) {
            setPrice(totalPrice);
          }
        }
      }
      // props.setSizeSelected(true);
    } catch (error) {
      // Manejar errores aquí
    }
  }, [fees, values]);
  function applyReserve() {
    try {
      if (values) {
        const newReserves: Reserve[] = Object.entries(values).map(
          ([id, cantidad]) => ({
            IdLocker: null,
            NroSerie: props.nroSerieLocker,
            IdSize: parseInt(id),
            IdBox: null,
            Token1: null,
            FechaCreacion: format(Date.now(), "yyyy-MM-dd'T'00:00:00"),
            FechaInicio: props.startDate!,
            FechaFin: props.endDate!,
            Contador: -1,
            Confirmado: false,
            Modo: "Por fecha",
            Cantidad: cantidad,
            client: "ansel",
          }),
        );

        const updatedReserves = props.reserves
          ? [...props.reserves, ...newReserves]
          : [...newReserves];
        props.setReserves(updatedReserves);
      }
      props.setSizeSelected(true);
    } catch (error) {
      // Manejar errores aquí
    }
  }

  useEffect(() => {
    const filteredValues: Record<string, number> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value !== 0) {
        filteredValues[key] = value;
      }
    });

    // Verificar si los valores filtrados son diferentes de los actuales antes de actualizar el estado
    if (JSON.stringify(filteredValues) !== JSON.stringify(values)) {
      setValues(filteredValues);
    }
  }, [values]);

  function getPrice() {
    return 0;
  }
  return (
    <main className="flex  justify-center">
      {!props.sizeSelected && (
        <div className=" flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold">
            Selecciona tamaño de tu taquilla.
          </h2>
          <div className="grid grid-cols-3">
            {isLoading && <div>Cargando...</div>}
            {!isLoading && sizes?.length == 0 && <div>No hay tamaños.</div>}
            {!isLoading &&
              sizes.map((size: Size) => {
                return (
                  // <div key={size.id}>
                  //   <Card
                  //     className="grid w-[45vh] overflow-hidden shadow-xl"
                  //     key={size.id}
                  //   >
                  //     <CardHeader>
                  //       <CardTitle> {size.nombre}</CardTitle>
                  //     </CardHeader>
                  //     <img
                  //       className="aspect-auto object-cover"
                  //       src={size.image ? size.image! : "/placeholder.svg"}
                  //     ></img>
                  //     <CardFooter className="bg-green-100 backdrop-blur-sm">
                  //       <div className="flex pt-5">
                  //         <div className="">Número de taquillas</div>
                  //         <div className="float-end inline-flex">
                  //           <button
                  //             disabled={(values[size.id] || 0) == 0}
                  //             onClick={() =>
                  //               setValues({
                  //                 ...values,
                  //                 [size.id]: (values[size.id] || 0) - 1,
                  //               })
                  //             }
                  //             className="w-10 rounded-l bg-orange-500 font-bold text-gray-800 hover:bg-gray-400"
                  //           >
                  //             -
                  //           </button>
                  //           <Input
                  //             className="flex w-10 rounded-l rounded-r bg-gray-300 text-black"
                  //             disabled={true}
                  //             value={`${
                  //               values[size.id || 0] ? values[size.id]! : 0
                  //             }`}
                  //           ></Input>
                  //           <button
                  //             disabled={
                  //               (values[size.id] || 0) == size.cantidad!
                  //             }
                  //             onClick={() =>
                  //               setValues({
                  //                 ...values,
                  //                 [size.id]: (values[size.id] || 0) + 1,
                  //               })
                  //             }
                  //             className="w-10 rounded-r bg-orange-500  font-bold text-gray-800 hover:bg-gray-400"
                  //           >
                  //             +
                  //           </button>
                  //         </div>
                  //         {/* <Button className="bg-orange-500	">+</Button> */}
                  //       </div>
                  //     </CardFooter>
                  //   </Card>
                  // </div>
                  <div key={size.id} className="h-full px-5 pb-5">
                    <Card className="  h-96 w-72  overflow-hidden bg-emerald-100 backdrop-blur-sm">
                      <Card
                        style={{
                          clipPath: "polygon(29% 1%,1% 1%,1% 24%)",
                        }}
                        className="  absolute h-full w-full   bg-transparent"
                      >
                        <p className="absolute left-5 top-4 font-bold text-black">
                          {size.nombre}
                        </p>
                      </Card>
                      <Card
                        style={{
                          clipPath:
                            "polygon(1% 29%, 29% 1%, 99% 1%, 99% 99%, 1% 99%)",
                        }}
                        className="h-80 w-full overflow-hidden bg-white"
                      >
                        <img
                          style={{
                            clipPath:
                              "polygon(1% 29%, 29% 1%, 99% 1%, 99% 99%, 1% 99%)",
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                          }}
                          className="aspect-radio"
                          src={size.image ? size.image! : "/placeholder.svg"}
                          alt="Image"
                        />
                      </Card>
                      <div className="flex gap-32">
                        <p>Primer día</p>
                        <p>
                          {fees?.find((s: Fee) => s.size === size.id)?.value!}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="">Número de taquillas</div>
                        <div className="float-end inline-flex">
                          <button
                            disabled={(values[size.id] || 0) == 0}
                            onClick={() =>
                              setValues({
                                ...values,
                                [size.id]: (values[size.id] || 0) - 1,
                              })
                            }
                            className="w-10 rounded-l bg-orange-500 font-bold text-gray-800 hover:bg-gray-400"
                          >
                            -
                          </button>
                          <Input
                            className="flex w-10 rounded-l rounded-r bg-gray-300 text-black"
                            disabled={true}
                            value={`${
                              values[size.id || 0] ? values[size.id]! : 0
                            }`}
                          ></Input>
                          <button
                            disabled={(values[size.id] || 0) == size.cantidad!}
                            onClick={() =>
                              setValues({
                                ...values,
                                [size.id]: (values[size.id] || 0) + 1,
                              })
                            }
                            className="w-10 rounded-r bg-orange-500  font-bold text-gray-800 hover:bg-gray-400"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
          </div>
          <div>
            {!isLoading && sizes?.length != 0 && (
              <Button
                disabled={Object.keys(values).length === 0}
                onClick={applyReserve}
                className="bottom-0 pt-3"
              >
                APLICAR {price}
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
