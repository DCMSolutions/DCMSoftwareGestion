import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";
import { createId } from "~/lib/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db, schema } from "~/server/db";
import { api } from "~/trpc/server";
import { RouterOutputs } from "~/trpc/shared";

async function sizesList(): Promise<z.infer<typeof responseValidator>> {
  const sizeResponse = await fetch(`${env.SERVER_URL}/api/size`);

  // Handle the response from the external API
  if (!sizeResponse.ok) {
    // Extract the error message from the response
    const errorResponse = await sizeResponse.json();
    // Throw an error or return the error message
    return errorResponse.message || "Unknown error";
  }

  const reservedBoxData = await sizeResponse.json();

  const validatedData = responseValidator.parse(reservedBoxData);
  await Promise.all(
    validatedData.map(async (v) => {
      const fee = await db.query.feeData.findFirst({
        where: eq(schema.feeData.size, v.id),
      });
      v.tarifa = fee?.identifier;

      const existingSize = await db.query.sizes.findFirst({
        where: eq(schema.sizes.id, v.id), // Utiliza el nombre correcto del campo
      });

      if (existingSize) {
        // Si el tamaño ya existe, actualiza los datos
        await db
          .update(schema.sizes)
          .set({
            ...v,
          })
          .where(eq(schema.sizes.id, v.id));
      } else {
        // Si el tamaño no existe, insértalo
        await db.insert(schema.sizes).values({
          ...v,
        });
      }
    }),
  );

  // });
  return validatedData;
}

async function disponibilidad(nroSerieLocker: string, inicio: string | null, fin: string | null): Promise<z.infer<typeof responseValidator>> {
  const sizeResponse = await fetch(
    `${env.SERVER_URL}/api/token/disponibilidadlocker/${nroSerieLocker}/${inicio}/${fin}`,
  );

  // Handle the response from the external API
  if (!sizeResponse.ok) {
    const errorResponse = await sizeResponse.json();
    // Throw an error or return the error message
    return errorResponse.message || "Unknown error";
  }

  const reservedBoxData = await sizeResponse.json();
  const validatedData = responseValidator.parse(reservedBoxData);
  return validatedData;
}

type LockerSize = z.infer<typeof responseValidator>[number];
async function sizeExpand(v: LockerSize): Promise<LockerSize> {
  const fee = await db.query.feeData.findFirst({
    where: eq(schema.feeData.size, v.id),
  });
  v.tarifa = fee?.identifier;

  const existingSize = await db.query.sizes.findFirst({
    where: eq(schema.sizes.id, v.id), // Utiliza el nombre correcto del campo
  });

  if (existingSize) {
    // Si el tamaño ya existe, actualiza los datos
    await db
      .update(schema.sizes)
      .set({
        ...v,
      })
      .where(eq(schema.sizes.id, v.id));
    v.image = existingSize.image;
  } else {
    // Si el tamaño no existe, insértalo
    await db.insert(schema.sizes).values({
      ...v,
    });
  }

  return v;
}

export const sizeRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return sizesList();
  }),
  getAvailability: publicProcedure
    .input(
      z.object({
        store: z.string(),
        inicio: z.string().nullable(),
        fin: z.string().nullable(),
      }),
    )
    .query(async ({ input }) => {
      const store = await db.query.stores.findFirst({
        where: eq(schema.stores.identifier, input.store),
        with: {
          lockers: true
        }
      });

      if (!store) {
        throw 'NOT_FOUND';
      }

      const sizesLockersMap: Record<number, {
        lockers: string[],
        size: LockerSize,
      }> = {};

      for (const locker of store.lockers) {
        const disp = await disponibilidad(locker.serieLocker, input.inicio, input.fin);
        for (const lockerSize of disp) {
          if (sizesLockersMap[lockerSize.id]) {
            sizesLockersMap[lockerSize.id]!.lockers.push(locker.serieLocker);
          } else {
            sizesLockersMap[lockerSize.id] = {
              lockers: [locker.serieLocker],
              size: await sizeExpand(lockerSize),
            };
          }
        }
      }

      return sizesLockersMap;
    }),

  getById: publicProcedure
    .input(
      z.object({
        sizeId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const sizeResponse = await fetch(`${env.SERVER_URL}/api/size`);

      // Handle the response from the external API
      if (!sizeResponse.ok) {
        // Extract the error message from the response
        const errorResponse = await sizeResponse.json();
        // Throw an error or return the error message
        return errorResponse.message || "Unknown error";
      }

      const reservedBoxData = await sizeResponse.json();

      const validatedData = responseValidator.parse(reservedBoxData);

      const size = validatedData.find((item) => item.id === input.sizeId);
      // const store = await db.query.stores.findFirst({
      //   where: eq(schema.stores.identifier, input.storeId),
      //   with: {
      //     city: true,
      //   },
      // });

      return size;
    }),

  changeImage: publicProcedure
    .input(
      z.object({
        id: z.number(),
        image: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.sizes)
        .set({ image: input.image })
        .where(eq(schema.sizes.id, input.id));
    }),
});

const sizeValidator = z.object({
  id: z.number(),
  nombre: z.string().nullable(),
  alto: z.number(),
  ancho: z.number().nullable(),
  profundidad: z.number().nullable(),
  cantidad: z.number().nullable().optional(),
  cantidadSeleccionada: z.number().nullable().optional().default(0),
  tarifa: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});
export type Size = z.infer<typeof sizeValidator>;

const responseValidator = z.array(sizeValidator);
