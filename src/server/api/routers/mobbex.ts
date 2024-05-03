import { mobbex } from "mobbex";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const mobbexRouter = createTRPCRouter({
  test: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        reference: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("hello from mobbex router");
      mobbex.configurations.configure({
        apiKey: "zJ8LFTBX6Ba8D611e9io13fDZAwj0QmKO1Hn1yIj",
        accessToken: "d31f0721-2f85-44e7-bcc6-15e19d1a53cc",
      });
      console.log(input.reference);
      const checkout = {
        total: input.amount,
        currency: "ARS",
        reference: `123ASKFJR5${input.reference}`,
        description: "Descripción de la Venta",
        test: true,
        items: [
          {
            image:
              "https://www.mobbex.com/wp-content/uploads/2019/03/web_logo.png",
            quantity: 2,
            description: "Mi Producto",
            total: input.amount,
          },
        ],
        options: {
          domain: "test.com",
        },
        return_url: "https://mobbex.com/sale/return?session=56789",
        webhook: "https://mobbex.com/sale/webhook?user=1234",
      };
      let checkoutNumber;
      const a = await mobbex.checkout
        .create(checkout)
        .then((result: any) => {
          console.log(result.data);
          checkoutNumber = result.data.id;
        })
        .catch((error) => console.log(error));
      return checkoutNumber;
    }),
});

// export type City = RouterOutputs["city"]["get"][number];
