import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { schema } from "~/server/db";
import { type PrivateConfigKeys } from "~/lib/config";

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
      meta: z.custom<{
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
      }>(),
    }))
    .mutation(async ({ input, ctx }) => {
      const claveConfigMpWhUrl: PrivateConfigKeys = 'mercadopago_webhook_url';
      const claveMpWhUrl = await ctx.db.query.privateConfig.findFirst({
        where: eq(schema.privateConfig.key, claveConfigMpWhUrl)
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
        where: inArray(schema.reservas.IdTransaction, r)
      });

      if (reservas.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      const claveConfigMp: PrivateConfigKeys = 'mercadopago_private_key';
      const claveMp = await ctx.db.query.privateConfig.findFirst({
        where: eq(schema.privateConfig.key, claveConfigMp)
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
      } = {
        ...input.meta,
        IdTransactions: r,
      };

      const preference = new Preference(mpClient);
      try {
        const res = await preference.create({
          body: {
            notification_url: `${whUrl}api/mp-pago?source_news=webhooks`,
            items: [
              {
                id: "id",
                title: input.productName,
                description: input.productDescription,
                quantity: input.quantity,
                unit_price: input.price,
              }
            ],
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
    }))
    .mutation(async ({ ctx, input }) => {
      const r = [...(new Set(input.IdTransactions))];
      if (r.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Reservas inválidas" });
      }

      const reservas = await ctx.db.query.reservas.findMany({
        where: inArray(schema.reservas.IdTransaction, r)
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
