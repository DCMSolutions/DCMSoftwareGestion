import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { mobbex } from "mobbex";
import { env } from "process";
import { z } from "zod";
import { PrivateConfigKeys } from "~/lib/config";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db, schema } from "~/server/db";

export const mobbexRouter = createTRPCRouter({
  test: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        reference: z.string(),
        mail: z.string(),
        uid: z.number(),
        phone: z.string(),
        name: z.string(),
        identification: z.string(),
        cantidad: z.number(),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ent = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.entityId)
      });

      if (!ent) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const timeOutResult = await fetch(
        `${env.SERVER_URL}/api/token/GetTimeDeleter`,
      );

      if (!timeOutResult.ok) {
        const errorResponse = await timeOutResult.json();
        throw new Error(errorResponse.message || "Unknown error");
      }

      const configMobbexApiKey: PrivateConfigKeys = "mobbex_api_key";
      const configMobbexAccessToken: PrivateConfigKeys = "mobbex_access_token";

      const mobbexApiKey = await ctx.db.query.privateConfig.findFirst({
        where: and(
          eq(schema.privateConfig.key, configMobbexApiKey),
          eq(schema.privateConfig.entidadId, input.entityId),
        ),
      });

      const mobbexAccessToken = await ctx.db.query.privateConfig.findFirst({
        where: and(
          eq(schema.privateConfig.key, configMobbexAccessToken),
          eq(schema.privateConfig.entidadId, input.entityId),
        ),
      });

      if (!mobbexApiKey) {
        throw new Error("!mobbexApiKey");
      } else if (!mobbexAccessToken) {
        throw new Error("!mobbexAccessToken");
      }

      const timeOutJsonData = await timeOutResult.json(); // Obtener el JSON con el valor
      const timeOutValidatedResult = z.number().safeParse(timeOutJsonData);

      if (!timeOutValidatedResult.success) {
        throw new Error("The result is not a valid number");
      }

      const randomNum = Math.floor(Math.random() * 10000);
      const fourDigitString = randomNum.toString().padStart(4, "0");
      mobbex.configurations.configure({
        apiKey: mobbexApiKey.value,
        accessToken: mobbexAccessToken.value,
      });

      const test = env.APP_ENV == "test" || env.APP_ENV == "development";
      const checkout = {
        total: input.amount!,
        currency: "ARS",
        reference: `REF${input.reference}${fourDigitString}`,
        description: "Descripción de la Venta",
        test,
        customer: {
          email: `${input.mail}`,
          name: `${input.name}`,
          uid: `${input.uid}`,
          identification: input.identification,
          phone: `${input.phone}`,
        },
        items: [
          {
            image:
              "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
            quantity: input.cantidad,
            description: "Lockers",
            total: input.amount,
          },
        ],
        options: { domain: "https://dcm.com.ar/" },
        return_url: "https://mobbex.com/sale/return?session=56789",
        webhook: "https://mobbex.com/sale/webhook?user=1234",
        timeout: timeOutValidatedResult.data,
      };

      let checkoutNumber;
      const a = await mobbex.checkout
        .create(checkout)
        .then((result: any) => {
          checkoutNumber = result.data.id;
        })
        .catch((error) => console.log(error));
      return checkoutNumber;
    }),
});

// export type City = RouterOutputs["city"]["get"][number];
