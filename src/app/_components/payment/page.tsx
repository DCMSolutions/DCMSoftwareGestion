import { Transaction } from "@libsql/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Script from "next/script";
import { env } from "process";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Client } from "~/server/api/routers/clients";
import { Coin } from "~/server/api/routers/coin";
import { Cupon } from "~/server/api/routers/cupones";
import { Reserve } from "~/server/api/routers/lockerReserveRouter";
import { Size } from "~/server/api/routers/sizes";
import { Store } from "~/server/api/routers/store";
import { api } from "~/trpc/react";

declare global {
  interface Window {
    MobbexEmbed: any;
  }
}

export default function Payment(props: {
  checkoutNumber: string;
  setLoadingPay: (loadingPay: boolean) => void;
  reserves: Reserve[];
  sizes: Size[];
  client: Client;
  coin: Coin;
  total: number;
  nReserve: number;
  store: Store;
  startDate: string;
  endDate: string;
  setReserves: ((reserves: Reserve[]) => void) | null;
  setPagoOk: (pagoOk: boolean) => void;
  cupon: Cupon | null | undefined;
  isExt: boolean;
}) {
  const { mutateAsync: confirmarBox } =
    api.lockerReserve.confirmBox.useMutation();
  const { mutateAsync: createReserve } = api.reserve.create.useMutation();
  const { mutateAsync: useCupon } = api.cupones.useCupon.useMutation();
  const { mutateAsync: createTransaction } =
    api.transaction.create.useMutation();
  const [transaction, setTransaction] = useState<Transaction>();
  const { mutateAsync: sendEmail } = api.email.sendEmail.useMutation();
  function formatDateToTextDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = format(date, "eee dd MMMM HH:mm", { locale: es });
    return formattedDate;
  }
  const envVariable = process.env.NEXT_PUBLIC_NODE_ENV || "Cargando...";
  async function success() {
    try {
      props.setLoadingPay(true);
      let token: [number, string][] = [];
      const updatedReserves = await Promise.all(
        props.reserves.map(async (reserve) => {
          if (!reserve.IdTransaction) {
            return reserve;
          }

          let response;
          //si no es extension, el idtransaction es con el que se confirma el box. si es extension, el idtransaction es el de mobbex
          response = await confirmarBox({
            idToken: reserve.IdTransaction!,
            nReserve: props.nReserve,
          });

          if (response) {
            if (props.isExt) {
              token.push([
                reserve.Token1!,
                props.sizes.find((x) => x.id === reserve.IdSize)?.nombre! ?? "",
              ]);
              const updatedReserve = await createReserve({
                Contador: reserve.Contador,
                FechaCreacion: reserve.FechaCreacion,
                FechaInicio: reserve?.FechaInicio!,
                FechaFin: format(props.endDate, "yyyy-MM-dd'T'23:59:59"),
                IdBox: reserve.IdBox,
                IdSize: reserve.IdSize,
                NroSerie: reserve.NroSerie,
                Token1: reserve.Token1,
                Cantidad: reserve.Cantidad,
                client: reserve.client,
                Confirmado: reserve.Confirmado,
                IdLocker: reserve.IdLocker,
                IdTransaction: reserve.IdTransaction!,
                Modo: reserve.Modo,
                nReserve: props.nReserve,
              });

              if (props.setReserves) {
                props.setReserves([updatedReserve!]);
              }
            } else {
              token.push([
                response,
                props.sizes.find((x) => x.id === reserve.IdSize)?.nombre! ?? "",
              ]);
            }

            await createTransaction({
              ...transaction,
              client: reserve.client,
              amount: props.total,
              nReserve: props.nReserve,
            });

            if (props.cupon) {
              useCupon({ identifier: props.cupon.identifier! });
            }
          }
          console.log("HELLO");

          return {
            ...reserve,
            Token1: response,
            idToken: reserve.IdTransaction!,
            nReserve: props.nReserve,
          };
        }),
      );

      if (props.setReserves) props.setReserves(updatedReserves);
      console.log("TOKENS", token);
      await sendEmail({
        to: props.client.email!,
        token,
        client: props.client.name ?? "",
        price: props.total,
        coin: props.coin.description,
        local: props.store!.name!,
        address: props.store!.address ?? "",
        nReserve: props.nReserve,
        from: formatDateToTextDate(props.startDate!),
        until: formatDateToTextDate(props.endDate!),
      });

      props.setLoadingPay(false);
      props.setPagoOk(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (envVariable !== "testing" && envVariable !== "development") {
      let statusCode = 0;
      if (props.checkoutNumber) {
        const options = {
          id: props.checkoutNumber,
          type: "checkout",
          onResult: (data: any) => {
            // OnResult es llamado cuando se toca el Botón Cerrar

            window.MobbexEmbed.close();
          },
          onPayment: async (data: any) => {
            statusCode = parseInt(data.data.status.code);
            if (statusCode == 200) {
              await success();
            } else {
              // location.reload();
            }
          },
          onOpen: () => {
            console.info("Pago iniciado.");
          },
          onError: (error: any) => {
            console.error("ERROR: ", error);
          },
          onClose: (error: any) => {
            if (statusCode != 200) {
              location.reload();
            }
          },
        };

        function renderMobbexButton() {
          window.MobbexEmbed.render(options, "#mbbx-button");
        }

        function initMobbexPayment() {
          const mbbxButton = window.MobbexEmbed.init(options);
          mbbxButton.open();
        }

        const script = document.createElement("script");
        script.src = `https://res.mobbex.com/js/embed/mobbex.embed@1.0.23.js?t=${Date.now()}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.addEventListener("load", () => {
          initMobbexPayment(); // Abre inmediatamente el modal de pago
        });
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      }
    }
  }, [props.checkoutNumber]);

  function AlertSuccess() {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso</AlertDialogTitle>
            <AlertDialogDescription>
              Se encuentra en un entorno de pruebas, la reserva será aceptada
              automáticamente sin pasar por un medio de pago. el total es{" "}
              {props.total}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                success();
              }}
            >
              Aceptar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  function AlertTotalCero() {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso</AlertDialogTitle>
            <AlertDialogDescription>
              Su selección no posee precio, la reserva será aceptada
              automáticamente sin pasar por un medio de pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                success();
              }}
            >
              Aceptar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      {props.total === 0 && <AlertTotalCero />}

      {props.total != 0 &&
        (envVariable === "testing" || envVariable === "development") && (
          <AlertSuccess />
        )}
      {props.total != 0 &&
        envVariable !== "testing" &&
        envVariable !== "development" && (
          <>
            {" "}
            <Script
              src="https://res.mobbex.com/js/sdk/mobbex@1.1.0.js"
              integrity="sha384-7CIQ1hldcQc/91ZpdRclg9KVlvtXBldQmZJRD1plEIrieHNcYvlQa2s2Bj+dlLzQ"
              crossOrigin="anonymous"
            />
            <div id="mbbx-container"></div>{" "}
          </>
        )}
    </>
  );
}
