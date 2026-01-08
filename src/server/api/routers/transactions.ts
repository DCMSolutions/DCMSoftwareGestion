import { z } from "zod";
import { createId } from "~/lib/utils";
import { and, gte, lte, isNotNull, eq, InferSelectModel, inArray } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { transactions } from "~/server/db/schema";
import { Reserve } from "./reserves";

export const transactionRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        confirm: z.boolean().nullable().optional(),
        client: z.string().nullable().optional(),
        nReserve: z.number().nullable().optional(),
        amount: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: verificar permisos

      const identifier = createId();

      await db.insert(schema.transactions).values({
        confirm: input.confirm,
        client: input.client,
        amount: input.amount,
        nReserve: input.nReserve,
      });

      return { identifier };
    }),
  getBynroReserve: protectedProcedure
    .input(
      z.object({
        nReserve: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const channel = await db.query.transactions.findFirst({
        where: eq(schema.transactions.nReserve, input.nReserve),
        orderBy: (transaction, { desc }) => [desc(transaction.confirmedAt)],
      });

      if (!channel) {
      }

      return channel;
    }),
  getTransactionsByDate: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      const result = await db.query.transactions.findMany({
        where: (transaction) =>
          and(
            gte(transaction.confirmedAt, startDate),
            lte(transaction.confirmedAt, endDate),
          ),
        orderBy: (transaction, { asc }) => [asc(transaction.confirmedAt)],
      });

      const reservesByN = new Map<number, Reserve>();
      const allNReserves = new Set(result.map(n => n.nReserve).filter(n => n != null));
      if (allNReserves.size > 0) {
        const reserves = await db.query.reservas.findMany({
          where: inArray(schema.reservas.nReserve, Array.from(allNReserves))
        });

        for (const res of reserves) {
          if (res.nReserve == null) {
            continue;
          }

          reservesByN.set(res.nReserve, res);
        }
      }

      return result.map(transaction => ({
        ...transaction,
        reserve: transaction.nReserve != null
          ? reservesByN.get(transaction.nReserve)
          : null,
      }));
    }),
});

export type Transaction = InferSelectModel<typeof schema.transactions>;
