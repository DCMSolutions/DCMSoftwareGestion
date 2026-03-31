import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

const tokenValidator = z.object({
  idLocker: z.number().nullable(),
  idSize: z.number().nullable(),
  idBox: z.number().nullable(),
  token1: z.string().nullable(),
  fechaCreacion: z.string().nullable(),
  fechaInicio: z.string().nullable(),
  fechaFin: z.string().nullable(),
  contador: z.number().nullable(),
  cantidad: z.number().nullable(),
  confirmado: z.boolean().nullable(),
  modo: z.string().nullable(),
  idBoxNavigation: z.any().nullable(),
  idLockerNavigation: z.any().nullable(),
  idSizeNavigation: z.any().nullable(),
});

export type Token = z.infer<typeof tokenValidator>;

export const tokenRouter = createTRPCRouter({
  post: publicProcedure
    .input(
      z.object({
        token: tokenValidator,
      }),
    )
    .mutation(async ({ input }) => {
      const reservationResponse = await fetch(`${env.SERVER_URL}/api/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input.token),
      });
      return "OK";
    }),
});
