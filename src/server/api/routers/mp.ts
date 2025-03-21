import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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
    }))
    .mutation(async ({ input, ctx }) => {
      const claveConfigMp: PrivateConfigKeys = 'mercadopaco_private_key';
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

      const preference = new Preference(mpClient);
      try {
        const res = await preference.create({
          body: {
            notification_url: `${URL}/api/mp-pago?source_news=webhooks`,
            items: [
              {
                id: "id",
                title: input.productName,
                description: input.productDescription,
                quantity: input.quantity,
                unit_price: input.price,
              }
            ],
          }
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
});

// export type City = RouterOutputs["city"]["get"][number];
