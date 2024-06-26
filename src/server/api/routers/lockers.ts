import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { RouterOutputs } from "~/trpc/shared";

export const lockerRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const sizeResponse = await fetch(
      `${env.SERVER_URL}/api/locker/byTokenEmpresa/${env.TOKEN_EMPRESA}`,
    );

    // Handle the response from the external API
    if (!sizeResponse.ok) {
      // Extract the error message from the response
      const errorResponse = await sizeResponse.json();
      // Throw an error or return the error message
      return errorResponse.message || "Unknown error";
    }

    const reservedBoxData = await sizeResponse.json();

    return reservedBoxData;
  }),
});
const lockerValidator = z.object({
  id: z.number(),
  nroSerieLocker: z.string(),
  status: z.string().nullable(),
  lastUpdateTime: z.string().nullable(),
});
export type Locker = z.infer<typeof lockerValidator>;

const responseValidator = z.array(lockerValidator);

// export type Locker = RouterOutputs["locker"]["get"][number];
