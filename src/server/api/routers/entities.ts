import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { PERMISO_ADMIN } from "~/lib/permisos";
import { serverUserPerms, trpcTienePermisoCtx, trpcTienePermisoCtxAny } from "~/lib/roles";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { TRPCError } from "@trpc/server";

const preparedCompanyById = db.query.companies
  .findFirst({
    where: eq(schema.companies.id, sql.placeholder("companyId")),
    with: {
      usuarioEntidades: true,
    },
  })
  .prepare();

export const companiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { perms, roles } = await serverUserPerms(
      ctx.session.user.id,
      ctx.orgId ?? null,
    );

    if (!perms.has(PERMISO_ADMIN)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    let res = await db.query.companies.findMany();

    if (!perms.has(PERMISO_ADMIN)) {
      res = res.filter(
        (v) =>
          v.id === ctx.orgId ||
          typeof roles.find((rol) => rol.companyId === v.id) !== "undefined",
      );
    }

    return res;
  }),

  getById: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      const company = await preparedCompanyById.execute({
        companyId: input.companyId,
      });

      if (typeof company !== "undefined" && company !== null) {
        return company;
      } else {
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      const [company] = await db
        .insert(schema.companies)
        .values({
          name: input.name,
        })
        .returning();

      return company!.id;
    }),

  change: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        name: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      const companyId = input.companyId;

      await db.transaction(async (db) => {
        await db
          .update(schema.companies)
          .set({
            name: input.name,
          })
          .where(eq(schema.companies.id, companyId!));
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      await db.delete(schema.companies)
        .where(eq(schema.companies.id, input.companyId));
    }),
});
