import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq, isNull } from "drizzle-orm";
import { serverUserPerms } from "~/lib/roles";
import { PERMISO_ADMIN } from "~/lib/permisos";
import { PrivateConfigKeys } from "~/lib/config";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

// esfuerzo dudoso de no repetir ejecuciones de migraciones
let lastMigration = 0;

export const testRouter = createTRPCRouter({
  migrateToEntities: protectedProcedure
    .mutation(async ({ ctx }) => {
      const perms = await serverUserPerms(ctx.userId, null);
      if (!perms.perms.has(PERMISO_ADMIN)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: "Sin permiso" });
      }
      
      if (Date.now() - lastMigration > 60000 * 60) {
        lastMigration = Date.now();
      } else {
        return;
      }

      await db.transaction(async (db) => {
        let defaultEntidad = await db.query.companies.findFirst({
          where: eq(schema.companies.id, "default")
        });

        if (!defaultEntidad) {
          const [res] = await db.insert(schema.companies)
            .values({
              id: "default",
              name: "Default",
            })
            .returning();

          defaultEntidad = res!;
        }

        const tk: PrivateConfigKeys = 'token_empresa';
        const tkEmp = await db.query.privateConfig.findFirst({
          where: and(
            eq(schema.privateConfig.entidadId, defaultEntidad.id),
            eq(schema.privateConfig.key, tk)
          )
        });

        if (!tkEmp && env.TOKEN_EMPRESA) {
          await db.insert(schema.privateConfig)
            .values({
              key: tk,
              value: env.TOKEN_EMPRESA,
              entidadId: defaultEntidad.id
            });
        }

        await db.update(schema.clients)
          .set({ entidadId: "default" })
          .where(isNull(schema.clients.entidadId));
        await db.update(schema.stores)
          .set({ entidadId: "default" })
          .where(isNull(schema.stores.entidadId));
        await db.update(schema.transactions)
          .set({ entidadId: "default" })
          .where(isNull(schema.transactions.entidadId));
        await db.update(schema.sizes)
          .set({ entidadId: "default" })
          .where(isNull(schema.sizes.entidadId));
        await db.update(schema.reservas)
          .set({ entidadId: "default" })
          .where(isNull(schema.reservas.entidadId));
        await db.update(schema.publicConfig)
          .set({ entidadId: "default" })
          .where(isNull(schema.publicConfig.entidadId));
        await db.update(schema.privateConfig)
          .set({ entidadId: "default" })
          .where(isNull(schema.privateConfig.entidadId));
        await db.update(schema.feeData)
          .set({ entidadId: "default" })
          .where(isNull(schema.feeData.entidadId));
        await db.update(schema.cuponesData)
          .set({ entidadId: "default" })
          .where(isNull(schema.cuponesData.entidadId));
        await db.update(schema.pagos)
          .set({ entidadId: "default" })
          .where(isNull(schema.pagos.entidadId));

        lastMigration = Date.now();
      });
    })
});