"use client"
import { type Transaction } from "@libsql/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
/* import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"; */
import { type Client } from "~/server/api/routers/clients";
import { type Coin } from "~/server/api/routers/coin";
import { type Cupon } from "~/server/api/routers/cupones";
import { type Reserve } from "~/server/api/routers/lockerReserveRouter";
import { type Size } from "~/server/api/routers/sizes";
import { type Store } from "~/server/api/routers/store";
import { api } from "~/trpc/react";
import { initMercadoPago, Payment as PaymentMp, StatusScreen } from '@mercadopago/sdk-react';
import { PublicConfigMetodoPago } from "~/lib/config";

declare global {
  interface Window {
    MobbexEmbed: {
      close: () => void;
      render: (a: unknown, b: string) => void;
      init: (a: unknown) => {
        open: () => void;
      };
    };
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
  const { mutateAsync: procesarPagoMp } = api.mp.procesarPago.useMutation();
  const { data: medioPagoRes } = api.config.getKey.useQuery({ key: 'metodo_pago' });
  const { data: mpPublicKey } = api.config.getKey.useQuery({ key: 'mercadopago_public_key' });
  const [medioConfigurado, setMedioConfigurado] = useState<PublicConfigMetodoPago | null>(null);
  const [mpClavePrimeraCarga, setMpClavePrimeraCarga] = useState<string | null>(null);

  // solo define mpClavePrimeraCarga si
  // mpPublicKey existe y no se había definido antes
  useEffect(() => {
    if (mpPublicKey && !mpClavePrimeraCarga) {
      setMpClavePrimeraCarga(mpPublicKey.value);
    }
  }, [mpPublicKey, mpClavePrimeraCarga]);

  useEffect(() => {
    if (medioConfigurado === null && medioPagoRes) {
      if (Object.values(PublicConfigMetodoPago).includes(medioPagoRes.value as PublicConfigMetodoPago)) {
        setMedioConfigurado(medioPagoRes.value as PublicConfigMetodoPago);
      } else {
        console.error('medioPagoRes es inválido:', medioPagoRes);
      }
    }
  }, [medioPagoRes]);

  useEffect(() => {
    if (medioConfigurado === PublicConfigMetodoPago.mercadopago && mpClavePrimeraCarga) {
      initMercadoPago(mpClavePrimeraCarga);
    }
  }, [medioConfigurado, mpClavePrimeraCarga]);

  function formatDateToTextDate(dateString: string): string {
    const date = new Date(dateString);
    const formattedDate = format(date, "eee dd MMMM HH:mm", { locale: es });
    return formattedDate;
  }

  const [mpPaymentId, setMpPaymentId] = useState("");

  async function success() {
    try {
      props.setLoadingPay(true);
      const token: [number, string][] = [];
      const updatedReserves = await Promise.all(
        props.reserves.map(async (reserve) => {
          if (!reserve.IdTransaction) {
            return reserve;
          }

          //si no es extension, el idtransaction es con el que se confirma el box. si es extension, el idtransaction es el de mobbex
          let response = await confirmarBox({
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
                FechaInicio: props.startDate,
                FechaFin: format(props.endDate, "yyyy-MM-dd'T'23:59:59"),
                IdFisico: reserve.IdFisico,
                IdBox: reserve.IdBox,
                IdSize: reserve.IdSize,
                NroSerie: reserve.NroSerie,
                Token1: reserve.Token1,
                Cantidad: reserve.Cantidad,
                client: reserve.client,
                Confirmado: reserve.Confirmado,
                IdLocker: reserve.IdLocker,
                IdTransaction: reserve.IdTransaction,
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
              await useCupon({ identifier: props.cupon.identifier });
            }
          }

          return {
            ...reserve,
            Token1: props.isExt ? reserve.Token1 : response,
            idToken: reserve.IdTransaction,
            nReserve: props.nReserve,
          };
        }),
      );

      if (props.setReserves) props.setReserves(updatedReserves);
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
    if (medioConfigurado === PublicConfigMetodoPago.mobbex) {
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

  /* function AlertSuccess() {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso</AlertDialogTitle>
            <AlertDialogDescription>
              Se encuentra en un entorno de pruebas, la reserva será aceptada
              automáticamente sin pasar por un medio de pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={async () => {
                await success();
              }}
            >
              Aceptar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } */

  const mpDone = useMemo(() => typeof mpPaymentId === 'string' && mpPaymentId !== '', [mpPaymentId]);

  return (
    <>
      <>
        {medioConfigurado === PublicConfigMetodoPago.mercadopago && mpClavePrimeraCarga && <>
          { !mpDone && <PaymentMp
            initialization={{
              amount: props.total,
              payer: {
                email: props.client.email ?? undefined,
                firstName: props.client.name ?? undefined,
                lastName: props.client.surname ?? undefined,
                identification: props.client.dni ? {
                  number: props.client.dni,
                  type: 'id',
                } : undefined,
              }
            }}
            customization={{
              paymentMethods: {
                ticket: "all",
                creditCard: "all",
                prepaidCard: "all",
                debitCard: "all",
                mercadoPago: "all",
                bankTransfer: "all",
                atm: "all",
              },
            }}
            onSubmit={async ({ formData }) => {
              const res = await procesarPagoMp({
                ...formData,
                additional_info: {
                  ...formData.additional_info,
                  items: undefined,
                },
                issuer_id: Number(formData.issuer_id),
              });

              setMpPaymentId(String(res.paymentId) ?? "");
              if (res.status === "approved") {
                await success();
              }

              console.log('status', res);
            }}
          /> }
          { mpDone && <StatusScreen initialization={{ paymentId: mpPaymentId }} /> }
        </> }
        {medioConfigurado === PublicConfigMetodoPago.mobbex && <>
          <Script
            src="https://res.mobbex.com/js/sdk/mobbex@1.1.0.js"
            integrity="sha384-7CIQ1hldcQc/91ZpdRclg9KVlvtXBldQmZJRD1plEIrieHNcYvlQa2s2Bj+dlLzQ"
            crossOrigin="anonymous"
          />
          <div id="mbbx-container"></div>{" "}
        </>}
      </>
    </>
  );
}
