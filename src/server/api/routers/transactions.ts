import { z } from "zod";
import { createId } from "~/lib/utils";
import { and, gte, lte, isNotNull, eq, inArray } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { transactions } from "~/server/db/schema";
import { trpcTienePermisoCtx } from "~/lib/roles";

export const transactionRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    const result = ctx.db.query.transactions.findMany({
      orderBy: (client, { desc }) => [desc(client.id)],
    });
    return result;
  }),
  create: publicProcedure
    .input(
      z.object({
        confirm: z.boolean().nullable().optional(),
        client: z.string().nullable().optional(),
        nReserve: z.number().nullable().optional(),
        amount: z.number().nullable().optional(),
        entityId: z.string().min(1),
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
        entidadId: input.entityId,
      });

      return { identifier };
    }),

  getBynroReserve: protectedProcedure
    .input(
      z.object({
        nReserve: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:reservas");

      const channel = await db.query.transactions.findFirst({
        where: and(
          eq(schema.transactions.nReserve, input.nReserve),
          eq(schema.transactions.entidadId, ctx.orgId ?? ""),
        ),
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
        filterEntities: z.array(z.string()).nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { startDate, endDate } = input;

      const conditions = [
        gte(schema.transactions.confirmedAt, startDate),
        lte(schema.transactions.confirmedAt, endDate),
      ];

      if (input.filterEntities && input.filterEntities.length > 0) {
        conditions.push(inArray(schema.transactions.entidadId, input.filterEntities));
      }

      const result = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: (transaction, { asc }) => [asc(transaction.confirmedAt)],
      });

      return result;
    }),
});

export type Transaction = RouterOutputs["transaction"]["get"][number];
