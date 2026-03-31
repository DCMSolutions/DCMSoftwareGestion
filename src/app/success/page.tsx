import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "~/server/db";
import { MpMeta } from "~/lib/types";
import { api } from "~/trpc/server";
import { PageClient } from "./page-client";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Inter } from "next/font/google";
import { PublicConfigKeys } from "~/lib/config";
import { PageRefresh } from "./page-refresh";
import { sizesList } from "~/server/api/routers/sizes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function Page({
  searchParams
}: {
  searchParams: {
    entityId?: string,
    nReserve?: string,
    pagoId?: string,
    verifId?: string,
    startDate?: string,
    endDate?: string,
  }
}) {
  if (!searchParams.entityId || !searchParams.pagoId || !searchParams.nReserve || !searchParams.verifId || !searchParams.startDate || !searchParams.endDate) {
    return <div></div>;
  }

  const startDate = decodeURIComponent(searchParams.startDate);
  const endDate = decodeURIComponent(searchParams.endDate);

  const nReserve = parseInt(searchParams.nReserve);
  const pago = await db.query.pagos.findFirst({
    where: and(
      eq(schema.pagos.identifier, parseInt(searchParams.pagoId)),
      eq(schema.pagos.entidadId, searchParams.entityId),
    )
  });

  if (!pago) {
    return <div></div>;
  }

  const data: MpMeta = JSON.parse(pago.mpMetaJson ?? "{}");
  if (data.n_reserve !== nReserve || data.verif_id !== searchParams.verifId || !data.id_transactions || data.id_transactions.length < 1) {
    return <div></div>;
  }

  const reserves = await db.query.reservas.findMany({
    where: and(
      eq(schema.reservas.entidadId, searchParams.entityId),
      inArray(schema.reservas.IdTransaction, data.id_transactions),
    )
  });

  const store = await db.query.stores.findFirst({
    where: and(
      eq(schema.stores.entidadId, searchParams.entityId),
      eq(schema.stores.identifier, data.store_id),
    )
  });

  const key: PublicConfigKeys = 'metodo_pago';
  const medio_pago = await db.query.publicConfig.findFirst({
    where: and(
      eq(schema.publicConfig.key, key),
      eq(schema.publicConfig.entidadId, data.entidad_id),
    )
  });

  const allConfirmed = reserves.reduce((acc, r) => ((medio_pago?.value === "mercadopago" && typeof r.mpPagadoOk === 'boolean' && r.mpPagadoOk) || medio_pago?.value !== "mercadopago") && acc, true);
  if (!allConfirmed) {
    return <PageRefresh />;
  }
  
  if (!store || reserves.length < 1) {
    return <div></div>;
  }

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
  }[] | string;
  
  // sizes = await api.size.get.query({
  //   store: null,
  // }) ?? [];

  sizes = await sizesList(null, store.entidadId);

  const locale = await getLocale();
  return <html lang={locale}>
    <head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
      <meta name="theme-color" content="#5b9a8b" />
      <title>Bagdrop | Pago</title>
      <meta name="robots" content="max-image-preview:large" />
      <link rel="canonical" href="https://bagdrop.com.ar/" />

      <meta property="og:site_name" content="Bagdrop | Pago" />
      <meta property="og:title" content="Pago" />
      <meta property="og:url" content="https://bagdrop.com.ar/" />
      <meta property="og:type" content="website" />
      <link rel="profile" href="https://gmpg.org/xfn/11" />
    </head>
    <body className={`font-sans ${inter.variable} bg-lockersUrbanos`}>
      <main>
        <NextIntlClientProvider locale={locale}>
          <div>
            <PageClient
              endDate={endDate}
              nReserve={nReserve}
              startDate={startDate}
              sizes={sizes}
              reserves={reserves.map(v => ({ ...v, Cantidad: v.Cantidad ?? undefined, IdTransaction: v.IdTransaction ?? undefined }))}
              store={store}
              total={data.total}
              coin={{ description: data.coin_description ?? "" }}
              checkoutNumber={nReserve.toString()}
            />
          </div>
        </NextIntlClientProvider>
      </main>
    </body>
  </html>;
}