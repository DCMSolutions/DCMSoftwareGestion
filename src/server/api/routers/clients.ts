import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import type { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { clients } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { trpcTienePermisoCtx } from "~/lib/roles";

export const clientsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({
      entityId: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      const result = ctx.db.query.clients.findMany({
        orderBy: (client, { asc }) => [asc(client.email)],
        where: eq(schema.clients.entidadId, input.entityId),
      });
      return result;
    }),
  getGroupedByEmail: protectedProcedure
    .query(async ({ ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:clientes");
      const clients = await ctx.db.query.clients.findMany({
        orderBy: (client, { asc }) => [asc(client.email)],
        where: eq(schema.clients.entidadId, ctx.orgId ?? ""),
      });

      // Group by email using JavaScript
      const groupedByEmail = clients.reduce(
        (acc, client) => {
          if (!acc[client.email!]) {
            acc[client.email!] = [];
          }
          acc[client.email!]!.push(client);
          return acc;
        },
        {} as Record<string, typeof clients>,
      );
      return groupedByEmail;
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(0).max(1023).nullable().optional(),
        surname: z.string().min(0).max(1023).nullable().optional(),
        email: z.string().min(0).max(1023).nullable().optional(),
        prefijo: z.number().nullable().optional(),
        telefono: z.number().nullable().optional(),
        dni: z.string().min(0).max(1023).optional().nullable(),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: verificar permisos
      const client = await ctx.db.query.clients.findFirst({
        where: and(
          eq(schema.clients.email, input.email!),
          eq(schema.clients.entidadId, input.entityId),
        ),
      });

      if (!client) {
        const result = await db.insert(schema.clients).values({
          name: input.name,
          surname: input.surname,
          email: input.email,
          prefijo: input.prefijo,
          telefono: input.telefono,
          dni: input.dni,
          entidadId: input.entityId,
        });
        const id = parseInt(result.lastInsertRowid?.toString()!);
        return { id };
      } else {
        const id = parseInt(client.identifier?.toString()!);
        return { id };
      }
    }),
  getById: protectedProcedure
    .input(
      z.object({
        identifier: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:clientes");
      if (input.identifier) {
        const client = await db.query.clients.findFirst({
          where: eq(schema.clients.identifier, input.identifier),
        });

        return client;
      }
    }),
  getByEmailAndToken: publicProcedure
    .input(
      z.object({
        email: z.string(),
        token: z.number()
      }),
    )
    .query(async ({ input }) => {
      const client = await db.query.clients.findFirst({
        where: (table, { exists, eq }) => and(
          eq(table.email, input.email),
          exists(
            db.select()
              .from(schema.reservas)
              .where(and(
                eq(schema.reservas.client, table.email),
                eq(schema.reservas.entidadId, table.entidadId),
                eq(schema.reservas.Token1, input.token),
              ))
          )
        ),
      });

      return client;
    }),
  change: protectedProcedure
    .input(
      z.object({
        identifier: z.number(),
        name: z.string().min(0).max(1023).optional().nullable(),
        surname: z.string().min(0).max(1023).optional().nullable(),
        email: z.string().min(0).max(1023).optional().nullable(),
        prefijo: z.number().optional().nullable(),
        telefono: z.number().optional().nullable(),
        dni: z.string().min(0).max(1023).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:clientes");
      if (!ctx.orgId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Sin entidad" });
      }

      return ctx.db
        .update(clients)
        .set(input)
        .where(and(
          eq(clients.identifier, input.identifier),
          eq(clients.entidadId, ctx.orgId),
        ));
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:clientes");
      if (!ctx.orgId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Sin entidad" });
      }

      await db
        .delete(schema.clients)
        .where(and(
          eq(clients.identifier, input.id),
          eq(clients.entidadId, ctx.orgId),
        ));
    }),
});

export type Client = RouterOutputs["clients"]["get"][number];
