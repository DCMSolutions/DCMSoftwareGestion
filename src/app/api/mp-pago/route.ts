import { eq, inArray } from "drizzle-orm";
import { Payment } from "mercadopago";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import type { PrivateConfigKeys } from "~/lib/config";
import { getMpClient } from "~/server/api/routers/mp";
import { db, schema } from "~/server/db";
import { api } from "~/trpc/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createId } from "~/lib/utils";
import { getClientByEmail } from "~/server/api/routers/lockerReserveRouter";

function formatDateToTextDate(dateString: string): string {
  const date = new Date(dateString);
  const formattedDate = format(date, "eee dd MMMM HH:mm", { locale: es });
  return formattedDate;
}

function validateHmac(xSignature: string, xRequestId: string, secretKey: string): boolean {
  // Obtain Query params related to the request URL
  const urlParams = new URLSearchParams(window.location.search);
  const dataID = urlParams.get('data.id');

  // Separating the x-signature into parts
  const parts = xSignature.split(',');

  // Initializing variables to store ts and hash
  let ts;
  let hash;

  // Iterate over the values to obtain ts and v1
  parts.forEach(part => {
      // Split each part into key and value
      const [key, value] = part.split('=');
      if (key && value) {
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();
          if (trimmedKey === 'ts') {
              ts = trimmedValue;
          } else if (trimmedKey === 'v1') {
              hash = trimmedValue;
          }
      }
  });

  // Obtain the secret key for the user/application from Mercadopago developers site
  const secret = secretKey;

  // Generate the manifest string
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  // Create an HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);

  // Obtain the hash result as a hexadecimal string
  const sha = hmac.digest('hex');
  return sha === hash;
}

export async function POST(request: Request) {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  const claveConfigMp: PrivateConfigKeys = 'mercadopago_private_key';
  const claveMp = await db.query.privateConfig.findFirst({
    where: eq(schema.privateConfig.key, claveConfigMp)
  });

  if (!claveMp) {
    console.error('No está configurada la clave privada de mercado pago');
    return NextResponse.json(null, { status: 502 });
  }

  if (!validateHmac(xSignature ?? "", xRequestId ?? "", claveMp.value)) {
    console.error("api mp firma invalida");
    return NextResponse.json(null, { status: 400 });
  }

  const res = await request.json() as object;
  if (typeof res !== 'object') {
    console.error("api mp res no es object");
    return NextResponse.json(null, { status: 400 });
  }

  const body: {
    data?: {
      id?: string
    },
    type?: "payment"
  } = res;

  if (!body.data?.id) {
    console.error("api mp !body.data.id", body);
    return NextResponse.json(null, { status: 400 });
  } else if (body.type !== 'payment') {
    console.error("api mp type is not payment", body);
    return NextResponse.json(null, { status: 400 });
  }

  const mp = getMpClient(claveMp.value);
  const payment = await new Payment(mp).get({id: body.data.id});
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const meta: {
    IdTransactions?: number[],
    store_name: string,
    store_address: string,
    nReserve: number,
    coin_description: null | string,
    client_email: string,
    client_name: string,
    total: number,
    isExt: boolean,
    startDate: string,
    endDate: string,
    cupon_id?: string,
  } = payment.metadata;
  const trans = (meta.IdTransactions ?? []).filter(v => typeof v === 'number');

  if (meta.IdTransactions && Array.isArray(meta.IdTransactions) && payment.status === "approved") {
    console.log("recibido WH pago procesado", payment);
    if (trans.length > 0) {
      const reserves = await db.query.reservas.findMany({
        where: inArray(schema.reservas.IdTransaction, trans)
      });

      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let sizes: {
        id: number;
        alto: number;
        ancho: number | null;
        profundidad: number | null;
        nombre: string | null;
        cantidadSeleccionada: number | null;
        image?: string | null;
        cantidad?: number | null;
        tarifa?: string | null;
      }[] | string = await api.size.get.query();

      const nReserve = meta.nReserve;
      const isExt = meta.isExt;
      const startDate = meta.startDate;
      const endDate = meta.endDate;
      const total = meta.total;
      const cupon_id = meta.cupon_id;
      const client_name = meta.client_name;
      const client_email = meta.client_email;
      const coin_description = meta.coin_description;
      const store_name = meta.store_name;
      const store_address = meta.store_address;

      if (!Array.isArray(sizes)) {
        console.error("NO HAY SIZES mp-pago");
        sizes = [];
      }

      const token: [number, string][] = [];
      const updatedReserves = await Promise.all(
        reserves.map(async (reserve) => {
          if (typeof reserve.IdTransaction !== 'number') {
            console.error('mp-pago reserve.IdTransaction no es number', reserve);
            return reserve;
          }

          //si no es extension, el idtransaction es con el que se confirma el box. si es extension, el idtransaction es el de mobbex
          let response = await api.lockerReserve.confirmBox.mutate({
            idToken: reserve.IdTransaction,
            nReserve: nReserve,
          });

          if (response) {
            if (isExt) {
              token.push([
                reserve.Token1!,
                sizes.find((x) => x.id === reserve.IdSize)?.nombre ?? "",
              ]);

              const client = await getClientByEmail(reserve.client!);
              const identifier = createId();
        
              await db.insert(schema.reservas).values({
                identifier,
                NroSerie: reserve.NroSerie,
                IdSize: reserve.IdSize,
                IdBox: reserve.IdBox,
                IdFisico: reserve.IdFisico,
                Token1: reserve.Token1,
                FechaCreacion: new Date().toISOString(),
                FechaInicio: startDate,
                FechaFin: format(endDate, "yyyy-MM-dd'T'23:59:59"),
                Contador: reserve.Contador,
                Confirmado: reserve.Confirmado,
                Modo: reserve.Modo,
                Cantidad: reserve.Cantidad,
                IdTransaction: reserve.IdTransaction,
                client: client?.email,
                nReserve: nReserve,
              });

              /* if (setReserves) {
                setReserves([updatedReserve!]);
              } */
            } else {
              token.push([
                response,
                sizes.find((x) => x.id === reserve.IdSize)?.nombre ?? "",
              ]);
            }

            await db.insert(schema.transactions).values({
              client: reserve.client,
              amount: total,
              nReserve: nReserve,
            });

            if (cupon_id) {
              await api.cupones.useCupon.mutate({ identifier: cupon_id });
            }
          }

          return {
            ...reserve,
            Token1: isExt ? reserve.Token1 : response,
            idToken: reserve.IdTransaction,
            nReserve: nReserve,
          };
        }),
      );

      // if (setReserves) setReserves(updatedReserves);
      await api.email.sendEmail.mutate({
        to: client_email,
        token,
        client: client_name ?? "",
        price: total,
        coin: coin_description,
        local: store_name,
        address: store_address ?? "",
        nReserve: nReserve,
        from: formatDateToTextDate(startDate),
        until: formatDateToTextDate(endDate),
      });

      await db.update(schema.reservas)
        .set({ mpPagadoOk: true })
        .where(inArray(schema.reservas.IdTransaction, trans));
    } else {
      console.error("recibido WH pago sin reservas");
    }
  } else {
    console.log("recibido WH pago no procesado", payment);
  }

  return new Response(null, {status: 200});
}

