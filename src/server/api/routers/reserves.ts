import { eq, lt, gt, isNotNull, and, isNull, SQL, inArray } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { format, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { reservas, reservasToClients, transactions } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";
import { db, schema } from "~/server/db";
import { env } from "~/env";
import { lockerValidator } from "./lockers";
import { Input } from "~/components/ui/input";
import { getClientByEmail } from "./lockerReserveRouter";
import { TRPCError } from "@trpc/server";
import { trpcTienePermisoCtx } from "~/lib/roles";
import { PrivateConfigKeys } from "~/lib/config";

export type Reserve = {
  identifier: string | null;
  NroSerie: string | null;
  IdSize: number | null;
  IdBox: number | null;
  IdFisico: number | null;
  Token1: number | null;
  FechaCreacion: string | null;
  FechaInicio: string | null;
  FechaFin: string | null;
  Contador: number | null;
  client: string | null;
};

// Definir el tipo del resultado agrupado
export type GroupedReserves = {
  [nReserve: number]: Reserve[];
};

export const reserveRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    await trpcTienePermisoCtx(ctx, "panel:reservas");

    checkBoxAssigned(ctx.orgId ?? "");
    const result = await ctx.db.query.reservas.findMany({
      with: { clients: true },
      where: (reservas) =>
        and(
          isNotNull(reservas.nReserve),
          isNotNull(reservas.Token1),
          eq(schema.reservas.entidadId, ctx.orgId ?? "")
        ),
    });

    const groupedByNReserve = result.reduce((acc: any, reserva) => {
      const nReserve = reserva.nReserve!;
      if (!acc[nReserve]) {
        acc[nReserve] = [];
      }
      acc[nReserve].push(reserva);
      return acc;
    }, {});
    return groupedByNReserve;
  }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    await trpcTienePermisoCtx(ctx, "panel:reservas");
    checkBoxAssigned(ctx.orgId ?? "");

    const result = await db.query.reservas.findMany({
      where: (reservas) =>
        and(
          isNotNull(reservas.nReserve),
          isNotNull(reservas.Token1),
          eq(schema.reservas.entidadId, ctx.orgId ?? "")
        ),
      with: { clients: true },
    });

    const now = new Date().getTime() - 3 * 60 * 60 * 1000;

    // Obtener el inicio y fin del día utilizando la configuración de idioma español
    const startOfDayLocale = startOfDay(now);
    const endOfDayLocale = endOfDay(now);

    const actives = result.filter((x) => {
      const fechaFin = new Date(x.FechaFin!);
      return isAfter(fechaFin, startOfDayLocale);
    });

    const groupedByNReserve = actives.reduce((acc: any, reserva) => {
      const nReserve = reserva.nReserve!;
      if (!acc[nReserve]) {
        acc[nReserve] = [];
      }
      acc[nReserve].push(reserva);
      return acc;
    }, {});

    return groupedByNReserve;
  }),

  getBynReserve: protectedProcedure
    .input(
      z.object({
        nReserve: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:reservas");

      // Evita llamadas innecesarias si `nReserve` es inválido
      if (!input.nReserve) throw new Error("Invalid nReserve");
      checkBoxAssigned(ctx.orgId ?? "");

      // Consulta optimizada
      const reserve = await db.query.reservas.findMany({
        where: (reservas) =>
          and(
            eq(schema.reservas.nReserve, input.nReserve),
            eq(schema.reservas.entidadId, ctx.orgId ?? ""),
            isNotNull(reservas.Token1),
          ),
        with: { clients: true },
      });

      if (!reserve.length) throw new Error("Reserve not found");

      return reserve;
    }),

  getByidTransactionsMut: publicProcedure
    .input(
      z.object({
        idTransactions: z.array(z.number()),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      checkBoxAssigned(input.entityId);

      // Consulta optimizada
      const reserve = await db.query.reservas.findMany({
        where: (reservas) =>
          and(
            inArray(schema.reservas.IdTransaction, input.idTransactions),
            eq(schema.reservas.entidadId, input.entityId),
            isNotNull(reservas.Token1),
          ),
        with: { clients: true },
      });

      if (!reserve.length) throw new Error("Reserve not found");

      return reserve;
    }),

  getByToken: publicProcedure
    .input(
      z.object({
        token: z.number(),
        email: z.string(),
        entityId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      checkBoxAssigned(input.entityId);

      const reserve = await db.query.reservas.findFirst({
        where: (reservas) =>
          and(
            isNotNull(reservas.nReserve),
            eq(schema.reservas.Token1, input.token),
            eq(schema.reservas.client, input.email),
            eq(schema.reservas.entidadId, input.entityId),
          ),
        orderBy: (reservas, { desc }) => [desc(reservas.FechaCreacion)],

        with: { clients: true },
      });
      return reserve as Reserve;
    }),
  getByClient: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, "panel:clientes");
      
      checkBoxAssigned(ctx.orgId ?? "");
      const result = await ctx.db.query.reservas.findMany({
        with: { clients: true },
        where: (reservas) =>
          and(isNotNull(reservas.nReserve), isNotNull(reservas.Token1)),
      });
      const client = await db.query.clients.findFirst({
        where: and(
          eq(schema.clients.identifier, input.clientId),
          eq(schema.clients.entidadId, ctx.orgId ?? ""),
        ),
      });
      const groupedByNReserve = result.reduce((acc: any, reserva) => {
        const nReserve = reserva.nReserve!;
        if (!acc[nReserve]) {
          acc[nReserve] = [];
        }

        if (reserva.client == client?.email) {
          acc[nReserve].push(reserva);
        }
        return acc;
      }, {});
      return groupedByNReserve;
    }),
  reservesToClients: publicProcedure
    .input(
      z.object({
        clientId: z.number(),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cl = await db.query.clients.findFirst({
        where: and(
          eq(schema.clients.identifier, input.clientId),
          eq(schema.clients.entidadId, input.entityId)
        )
      });

      if (!cl) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const result = await db
        .insert(schema.reservasToClients)
        .values({
          clientId: input.clientId,
        })
        .returning();

      return result[0]?.identifier;
    }),

  create: publicProcedure
    .input(
      z.object({
        IdLocker: z.number().nullable().optional(),
        NroSerie: z.string(),
        IdSize: z.number().nullable(),
        IdBox: z.number().nullable(),
        IdFisico: z.number().nullable(),
        Token1: z.number().nullable(),
        FechaCreacion: z.string().nullable(),
        FechaInicio: z.string().nullable(),
        FechaFin: z.string().nullable(),
        Contador: z.number().nullable(),
        Confirmado: z.boolean().nullable().optional(),
        Modo: z.string().nullable().optional(),
        Cantidad: z.number().optional(),
        IdTransaction: z.number().optional(),
        client: z.string().nullable().optional(),
        identifier: z.string().nullable().optional(),
        nReserve: z.number().optional(),
        entityId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await getClientByEmail(input.client!, input.entityId);
      const identifier = createId();

      await db.insert(schema.reservas).values({
        identifier,
        NroSerie: input.NroSerie,
        IdSize: input.IdSize,
        IdBox: input.IdBox,
        IdFisico: input.IdFisico,
        Token1: input.Token1,
        FechaCreacion: new Date().toISOString(),
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        Contador: input.Contador,
        Confirmado: input.Confirmado,
        Modo: input.Modo,
        Cantidad: input.Cantidad,
        IdTransaction: input.IdTransaction,
        client: client?.email,
        nReserve: input.nReserve,
        entidadId: input.entityId,
      });
    }),
  updateReserve: protectedProcedure
    .input(
      z.object({
        identifier: z.string(),
        FechaFin: z.string(),
        FechaInicio: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:reservas");

      const response = await db
        .update(reservas)
        .set({ FechaFin: input.FechaFin, FechaInicio: input.FechaInicio })
        .where(and(
          eq(reservas.identifier, input.identifier),
          eq(reservas.entidadId, ctx.orgId ?? ""),
        ))
        .returning();
      return response[0] as Reserve;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        nReserve: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, "panel:reservas");
      await db
        .delete(schema.reservas)
        .where(and(
          eq(schema.reservas.nReserve, input.nReserve),
          eq(reservas.entidadId, ctx.orgId ?? ""),
        ));
    }),
  getLastReserveByBox: protectedProcedure.query(async ({ ctx }) => {
    // Obtener las reservas ordenadas por FechaFin descendente
    const reservas = await ctx.db.query.reservas.findMany({
      with: { clients: true },
      where: (reservas) => and(
        isNotNull(reservas.IdBox),
        eq(reservas.entidadId, ctx.orgId ?? ""),
      ),
      orderBy: (reservas, { desc }) => [desc(reservas.FechaFin)],
      // limit: 1, // Si solo necesitas la última reserva por IdBox, usa limit aquí.
    });

    // Agrupar por IdBox y mantener solo la última reserva para cada caja
    const lastReservesByBox = reservas.reduce((acc, reserva) => {
      if (!acc.has(reserva.IdBox!)) {
        acc.set(reserva.IdBox!, reserva); // Mantener la primera reserva encontrada para el box
      }
      return acc;
    }, new Map<number, (typeof reservas)[number]>());

    // Convertir Map a un arreglo de valores
    return Array.from(lastReservesByBox.values());
  }),
});

export type Reserves = RouterOutputs["reserve"]["getBynReserve"][number];


/**
 * Función para verificar y asignar lockers a partir de un API y procesar las actualizaciones correspondientes en la base de datos.
 */
export async function checkBoxAssigned(entityId: string) {
  const tk: PrivateConfigKeys = 'token_empresa';
  const tkValue = await db.query.privateConfig.findFirst({
    where: and(
      eq(schema.privateConfig.key, tk),
      eq(schema.privateConfig.entidadId, entityId)
    )
  });

  if (!tkValue) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Sin token de empresa" });
  }
  
  // Realiza una solicitud a la API para obtener los datos de lockers asignados por empresa.
  const locerResponse = await fetch(
    `${env.SERVER_URL}/api/locker/byTokenEmpresa/${env.TOKEN_EMPRESA}`,
  );

  const reservedBoxData = await locerResponse.json();

  // Verifica si la respuesta de la API fue exitosa
  if (!locerResponse.ok) {
    const errorResponse = reservedBoxData;
    return { error: errorResponse.message || "Unknown error" }; // Devuelve un error si la respuesta no fue exitosa
  }

  // Valida los datos obtenidos usando un esquema predefinido con Zod
  const validatedData = z.array(lockerValidator).safeParse(reservedBoxData);
  if (!validatedData.success) {
    throw null; // Lanza un error si los datos no cumplen con el esquema definido
  }

  // Inicializa un array para acumular las consultas de actualización en lote
  const batchUpdates: any = [];

  // Procesa cada locker obtenido en los datos validados
  validatedData.data.forEach((locker) => {
    // Itera sobre los tokens asociados al locker
    locker.tokens?.forEach((token) => {
      if (token.idBox != null) {
        // Busca el identificador físico (idFisico) asociado al idBox del token
        const idFisico = locker.boxes.find(
          (box) => box.id == token.idBox,
        )?.idFisico;

        // Valida el token1 asegurándose de que sea un número válido
        const token1Value = parseInt(token.token1 ?? "0");
        if (!Number.isFinite(token1Value)) {
          console.error(`Valor de token1 no válido: ${token.token1}`);
          return; // Si el token no es válido, se detiene el procesamiento de este token
        }

        // Crea la consulta de actualización para este token y la agrega al array de batchUpdates
        batchUpdates.push(
          db
            .update(schema.reservas) // Define la tabla donde se realizará la actualización
            .set({ IdFisico: idFisico, IdBox: token.idBox }) // Especifica los valores a actualizar
            .where(
              and(
                eq(schema.reservas.Token1!, token1Value), // Coincide con el token1
              ),
            ),
        );
      }
    });
  });

  // Ejecuta todas las actualizaciones en la base de datos como un lote
  try {
    await db.batch(batchUpdates); // Realiza la actualización en lote
    console.log("Actualizaciones en lote completadas con éxito.");
  } catch (error) {
    // Maneja errores que puedan ocurrir durante las actualizaciones
    console.error("Error durante las actualizaciones en lote:", error);
  }
}
