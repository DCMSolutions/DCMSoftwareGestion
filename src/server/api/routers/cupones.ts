import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cuponesData } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { trpcTienePermisoCtx } from "~/lib/roles";

export const cuponesRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:cupones");
      const result = ctx.db.query.cuponesData.findMany({
        orderBy: (cuponesData, { desc }) => [desc(cuponesData.identifier)],
        where: eq(schema.cuponesData.entidadId, ctx.orgId ?? "")
      });
      return result;
    }),
  create: protectedProcedure
    .input(
      z.object({
        codigo: z.string().min(0).max(1023),
        tipo_descuento: z.string().min(0).max(1023),
        valor_descuento: z.number(),
        fecha_desde: z.string().min(0).max(1023),
        fecha_hasta: z.string().min(0).max(1023),
        cantidad_usos: z.number(),
        usos: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:cupones");
      const ent = await db.query.companies.findFirst({
        where: eq(schema.companies.id, ctx.orgId ?? "")
      });

      if (!ent) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const cupon = await db.query.cuponesData.findFirst({
        where: and(
          eq(schema.cuponesData.codigo, input.codigo),
          eq(schema.cuponesData.entidadId, ent.id)
        ),
      });

      if (!cupon) {
        const identifier = createId();

        await db.insert(schema.cuponesData).values({
          identifier,
          codigo: input.codigo,
          tipo_descuento: input.tipo_descuento,
          valor_descuento: input.valor_descuento,
          fecha_desde: input.fecha_desde,
          fecha_hasta: input.fecha_hasta,
          cantidad_usos: input.cantidad_usos,
          usos: 0,
          entidadId: ent.id
        });

        return { identifier };
      } else {
        return null;
      }
    }),
  getById: protectedProcedure
    .input(
      z.object({
        cuponId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const channel = await db.query.cuponesData.findFirst({
        where: and(
          eq(schema.cuponesData.identifier, input.cuponId),
          eq(schema.cuponesData.entidadId, ctx.orgId ?? ""),
        ),
      });

      return channel;
    }),
  getByCode: publicProcedure
    .input(
      z.object({
        codigo: z.string().min(0).max(1023),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cupon = await db.query.cuponesData.findFirst({
        where: and(
          eq(schema.cuponesData.codigo, input.codigo),
          eq(schema.cuponesData.entidadId, input.entityId),
        ),
      });

      if (cupon) {
        const currentDate = new Date();
        const fechaDesde = new Date(cupon?.fecha_desde || "");
        const fechaHasta = new Date(cupon?.fecha_hasta!);

        // Ajustar fechaHasta para incluir todo el día en la zona horaria local
        fechaHasta.setDate(fechaHasta.getDate() + 1);

        if (currentDate >= fechaDesde && currentDate <= fechaHasta) {
          if (
            cupon.cantidad_usos! > cupon.usos! ||
            cupon.cantidad_usos! === -1
          ) {
            return cupon;
          }
        }
      }

      return null;
    }),
  change: protectedProcedure
    .input(
      z.object({
        identifier: z.string().min(0).max(1023),
        codigo: z.string().min(0).max(1023),
        tipo_descuento: z.string().min(0).max(1023),
        valor_descuento: z.number(),
        fecha_desde: z.string().min(0).max(1023),
        fecha_hasta: z.string().min(0).max(1023),
        cantidad_usos: z.number(),
        usos: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:cupones");
      const ent = await db.query.companies.findFirst({
        where: eq(schema.companies.id, ctx.orgId ?? "")
      });

      if (!ent) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return await ctx.db
        .update(cuponesData)
        .set({
          codigo: input.codigo,
          tipo_descuento: input.tipo_descuento,
          valor_descuento: input.valor_descuento,
          fecha_desde: input.fecha_desde,
          fecha_hasta: input.fecha_hasta,
          cantidad_usos: input.cantidad_usos,
        })
        .where(eq(cuponesData.identifier, input.identifier));
    }),
  useCupon: publicProcedure
    .input(
      z.object({
        identifier: z.string().min(0).max(1023),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const cupon = await db.query.cuponesData.findFirst({
      //   where: eq(schema.cuponesData.codigo, input.codigo),
      // });
      // const currentDate = new Date();
      // const fechaDesde = new Date(cupon?.fecha_desde || "");
      // const fechaHasta = new Date(cupon?.fecha_hasta || "");

      // if (
      //   !cupon ||
      //   currentDate < fechaDesde ||
      //   currentDate > fechaHasta ||
      //   cupon.cantidad_usos == cupon.usos
      // ) {
      //   return null;
      // }
      // if (cupon?.cantidad_usos == cupon?.usos) return null;
      await ctx.db
        .update(cuponesData)
        .set({
          usos: sql`${cuponesData.usos} + 1`,
        })
        .where(and(
          eq(schema.cuponesData.identifier, input.identifier),
          eq(schema.cuponesData.entidadId, input.entityId),
        ));

      const response = await db.query.cuponesData.findFirst({
        where: and(
          eq(schema.cuponesData.identifier, input.identifier),
          eq(schema.cuponesData.entidadId, input.entityId),
        ),
      });
      return response;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        cuponId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:cupones");
      const ent = await db.query.companies.findFirst({
        where: eq(schema.companies.id, ctx.orgId ?? "")
      });

      if (!ent) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await db
        .delete(schema.cuponesData)
        .where(and(
          eq(schema.cuponesData.identifier, input.cuponId),
          eq(schema.cuponesData.entidadId, ent.id),
        ));
    }),
});

export type Cupon = RouterOutputs["cupones"]["get"][number];
