import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { RouterOutputs } from "~/trpc/shared";

export const sizeRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const sizeResponse = await fetch("http://168.205.92.83:8000/api/size");

    // Handle the response from the external API
    if (!sizeResponse.ok) {
      // Extract the error message from the response
      const errorResponse = await sizeResponse.json();
      // Throw an error or return the error message
      return errorResponse.message || "Unknown error";
    }

    const reservedBoxData = await sizeResponse.json();

    const validatedData = responseValidator.parse(reservedBoxData);

    return validatedData;
  }),

  getById: publicProcedure
    .input(
      z.object({
        sizeId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const sizeResponse = await fetch("http://168.205.92.83:8000/api/size");

      // Handle the response from the external API
      if (!sizeResponse.ok) {
        // Extract the error message from the response
        const errorResponse = await sizeResponse.json();
        // Throw an error or return the error message
        return errorResponse.message || "Unknown error";
      }

      const reservedBoxData = await sizeResponse.json();

      const validatedData = responseValidator.parse(reservedBoxData);

      const size = validatedData.find((item) => item.id === input.sizeId);
      // const store = await db.query.stores.findFirst({
      //   where: eq(schema.stores.identifier, input.storeId),
      //   with: {
      //     city: true,
      //   },
      // });

      return size;
    }),
});

const sizeValidator = z.object({
  id: z.number(),
  alto: z.number(),
  ancho: z.number().nullable(),
  profundidad: z.number().nullable(),
  nombre: z.string().nullable(),
});
export type Size = z.infer<typeof sizeValidator>;

const responseValidator = z.array(sizeValidator);
