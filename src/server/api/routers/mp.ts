import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "~/server/db";
import { type PrivateConfigKeys } from "~/lib/config";
import { MpMeta } from "~/lib/types";
import { nanoid } from "nanoid";

// eslint-disable-next-line no-var
export var mpClient: MercadoPagoConfig | null = null;

export function getMpClient(pk: string) {
  if (!mpClient) {
    mpClient = new MercadoPagoConfig({ accessToken: pk });
  }

  return mpClient;
}

export const mpRouter = createTRPCRouter({
  getPreference: publicProcedure
    .input(z.object({
      productName: z.string().min(2).max(256),
      productDescription: z.string().min(2).max(256).optional(),
      quantity: z.number().int().min(1),
      price: z.number().min(1),
      IdTransactions: z.array(z.number()),
      meta: z.custom<MpMeta>(),
      href: z.string(),
      entityId: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const ent = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.entityId)
      });

      if (!ent) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const claveConfigMpWhUrl: PrivateConfigKeys = 'mercadopago_webhook_url';
      const claveMpWhUrl = await ctx.db.query.privateConfig.findFirst({
        where: and(
          eq(schema.privateConfig.key, claveConfigMpWhUrl),
          eq(schema.privateConfig.entidadId, ent.id),
        )
      });

      if (!claveMpWhUrl) {
        console.error('No está configurada la clave privada de mercado pago');
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      let whUrl = claveMpWhUrl.value;
      if (!whUrl.startsWith("http")) {
        whUrl = "https://" + whUrl;
      }

      if (!whUrl.endsWith("/")) {
        whUrl += "/";
      }

      const r = [...(new Set(input.IdTransactions))];
      if (r.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      const reservas = await ctx.db.query.reservas.findMany({
        where: and(
          inArray(schema.reservas.IdTransaction, r),
          eq(schema.reservas.entidadId, ent.id),
        )
      });

      if (reservas.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      const claveConfigMp: PrivateConfigKeys = 'mercadopago_private_key';
      const claveMp = await ctx.db.query.privateConfig.findFirst({
        where: and(
          eq(schema.privateConfig.key, claveConfigMp),
          eq(schema.privateConfig.entidadId, ent.id),
        )
      });

      if (!claveMp) {
        console.error('No está configurada la clave privada de mercado pago');
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      
      if (!mpClient) {
        mpClient = new MercadoPagoConfig({ accessToken: claveMp.value });
      }

      if (!process.env.VERCEL_URL) {
        console.error('No está seteado VERCEL_URL');
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const verifId = nanoid();
      const meta: MpMeta = {
        ...input.meta,
        id_transactions: r,
        entidad_id: ent.id,
        verif_id: verifId,
      };

      const preference = new Preference(mpClient);
      const url = new URL(input.href);
      let back_url = "";

      if (url.protocol.startsWith("https")) {
        back_url += "https://";
      } else {
        back_url += "http://";
      }

      back_url += url.host;
      if (!back_url.endsWith("/")) {
        back_url += "/";
      }

      const [p] = await db.insert(schema.pagos)
        .values({
          mpMetaJson: JSON.stringify(meta),
          idTransactionsJson: JSON.stringify(r),
          entidadId: ent.id,
        })
        .returning();
      
      const back_url_success = back_url + `success?entityId=${ent.id}&nReserve=${input.meta.n_reserve}&pagoId=${p!.identifier}&verifId=${verifId}&startDate=${encodeURIComponent(input.meta.start_date)}&endDate=${encodeURIComponent(input.meta.end_date)}`;
      
      try {
        const res = await preference.create({
          body: {
            notification_url: `${whUrl}api/mp-pago?source_news=webhooks`,
            back_urls: {
              success: back_url_success,
              pending: back_url_success,
              failure: back_url,
            },
            items: [
              {
                id: "id",
                title: input.productName,
                description: input.productDescription ?? "Reserva de locker",
                quantity: input.quantity,
                unit_price: input.price,
                category_id: "services",
              }
            ],
            payer: {
              name: meta?.client_name,
              surname: meta?.client_surname,
              email: meta?.client_email,
            },
            external_reference: p?.identifier.toString() ?? "",
            metadata: meta
          },
        });

        if (!res.id) {
          console.error("Error mp preference invalida:", res);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        return {
          preferenceId: res.id
        };
      } catch (e) {
        console.error("Error mp preference:", e);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  areReservesPaid: publicProcedure
    .input(z.object({
      IdTransactions: z.array(z.number()),
      entityId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const r = [...(new Set(input.IdTransactions))];
      if (r.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      const reservas = await ctx.db.query.reservas.findMany({
        where: and(
          inArray(schema.reservas.IdTransaction, r),
          eq(schema.reservas.entidadId, input.entityId),
        )
      });

      if (reservas.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      let listo = reservas.length > 0;
      for (const reserva of reservas) {
        if (typeof reserva.mpPagadoOk !== 'boolean' || !reserva.mpPagadoOk) {
          listo = false;
          break;
        }
      }

      return listo;
    }),
});

// export type City = RouterOutputs["city"]["get"][number];
