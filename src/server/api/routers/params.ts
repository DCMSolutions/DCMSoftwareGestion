import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
import { z } from "zod";

export const paramsRouter = createTRPCRouter({
  getTimeOut: protectedProcedure.query(async () => {
    const timeOutResult = await fetch(
      `${env.SERVER_URL}/api/token/GetTimeDeleter`,
    );

    if (!timeOutResult.ok) {
      const errorResponse = await timeOutResult.json();
      throw new Error(errorResponse.message || "Unknown error");
    }

    const timeOutJsonData = await timeOutResult.json(); // Obtener el JSON con el valor
    const timeOutValidatedResult = z.number().safeParse(timeOutJsonData);

    if (!timeOutValidatedResult.success) {
      throw new Error("The result is not a valid number");
    }
    return timeOutValidatedResult.data; // Devuelve el número validado
  }),
});
