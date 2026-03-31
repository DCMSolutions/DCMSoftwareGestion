import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { feeData, sizes } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { trpcTienePermisoCtx } from "~/lib/roles";

async function getFeesByStore(id: string, entityId: string) {
  const ent = await db.query.companies.findFirst({
    where: eq(schema.companies.id, entityId)
  });

  if (!ent) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }

  const result = db.query.feeData.findMany({
    where: and(
      eq(schema.feeData.localId, id),
      eq(schema.feeData.entidadId, ent.id),
    ),
    with: {
      store: true,
    },
    orderBy: (feeData, { desc }) => [desc(feeData.identifier)],
  });

  return result;
}

async function getFeeById(id: string, entityId: string) {
  const ent = await db.query.companies.findFirst({
    where: eq(schema.companies.id, entityId)
  });

  if (!ent) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }

  const channel = await db.query.feeData.findFirst({
    where: and(
      eq(schema.feeData.identifier, id),
      eq(schema.feeData.entidadId, ent.id),
    ),
    with: {
      store: true,
    },
  });

  return channel;
}

export const feeRouter = createTRPCRouter({
  getByStore: publicProcedure
    .input(z.object({
      id: z.string(),
      entityId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      return await getFeesByStore(input.id, input.entityId);
    }),
  getByStoreProt: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:locales");
      return await getFeesByStore(input.id, ctx.orgId ?? "");
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        entityId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      return await getFeeById(input.id, input.entityId)
    }),

  getByIdProt: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await getFeeById(input.id, ctx.orgId ?? "")
    }),

  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(0).max(1023).nullable().optional(),
        value: z.number().nullable().optional(),
        coin: z.string().nullable().optional(),
        size: z.number().nullable().optional(),
        discount: z.number().nullable().optional(),
        localId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:locales");

      if (!ctx.orgId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Sin entidad" });
      }

      const identifier = createId();

      await db.insert(schema.feeData).values({
        identifier,
        description: input.description,
        coin: input.coin,
        value: input.value,
        size: input.size,
        discount: input.discount,
        localId: input.localId,
        entidadId: ctx.orgId,
      });

      return { identifier };
    }),
  change: protectedProcedure
    .input(
      z.object({
        identifier: z.string(),
        description: z.string().min(0).max(1023).nullable(),
        value: z.number().nullable(),
        coin: z.string().nullable(),
        size: z.number().nullable(),
        discount: z.number().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(feeData)
        .set({
          description: input.description,
          value: input.value,
          coin: input.coin,
          size: input.size,
          discount: input.discount,
        })
        .where(and(
          eq(feeData.identifier, input.identifier),
          eq(feeData.entidadId, ctx.orgId ?? ""),
        ));
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(schema.feeData)
        .where(and(
          eq(schema.feeData.identifier, input.id),
          eq(schema.feeData.entidadId, ctx.orgId ?? ""),
        ));

      await ctx.db
        .update(sizes)
        .set({ tarifa: null })
        .where(and(
          eq(sizes.tarifa, input.id),
          eq(sizes.entidadId, ctx.orgId ?? ""),
        ));
    }),
});

export type Fee = RouterOutputs["fee"]["getByStore"][number];
