import { and, gte, lte, isNotNull, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db, schema } from "~/server/db";
import { env } from "~/env";
import { lockerValidator } from "./lockers";
import { TRPCError } from "@trpc/server";
import { PrivateConfigKeys } from "~/lib/config";

export type DailyOccupation = {
  day: string; // Format "day/month"
  sizes: { [sizeName: string]: number }; // A size per column with its count
  total: number; // Total reservations for the day
};

// Define types to match the validated data structure
type Box = {
  idSizeNavigation?: {
    nombre: string;
  };
  idLocker?: number | null;
  tokens?: {
    id: number | null;
  }[];
  cantidad?: number | null;
  idSize?: number | null;
};

type Locker = {
  id: number;
  nroSerieLocker: string;
  boxes: Box[];
};

type Reserve = {
  FechaInicio: string | null;
  IdSize: number | null;
  IdBox: number | null;
  nReserve: number | null;
};

type Transaction = {
  confirmedAt: string | null;
  amount: number | null;
};

type SizeMap = {
  [id: number]: string;
};

export const reportsRouter = createTRPCRouter({
  getOcupattion: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        filterSerie: z.array(z.string()).nullable(),
        filterEntities: z.array(z.string()).nullable(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      // Get reservations within the date range with assigned lockers
      let reserves = await db.query.reservas.findMany({
        where: (reserva) =>
          and(
            gte(reserva.FechaInicio, startDate),
            lte(reserva.FechaFin, endDate),
            isNotNull(reserva.nReserve),
            // isNotNull(reserva.IdBox),
          ),
      });

      if (Array.isArray(input.filterSerie)) {
        const validSeries = new Set(input.filterSerie);
        reserves = reserves.filter(v => validSeries.has(v.NroSerie ?? ""));
      }

      if (Array.isArray(input.filterEntities)) {
        const validEnts = new Set(input.filterEntities);
        reserves = reserves.filter(v => validEnts.has(v.entidadId ?? ""));
      }

      const sizeMap = await getSizesMap(input.filterEntities);
      const occupationData = groupOccupationDataByDay(reserves, sizeMap);

      return occupationData;
    }),

  getTotalBoxesAmountPerSize: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: "Sin entidad" });
    }

    const tk: PrivateConfigKeys = 'token_empresa';
    const tkValue = await db.query.privateConfig.findFirst({
      where: and(
        eq(schema.privateConfig.key, tk),
        eq(schema.privateConfig.entidadId, ctx.orgId)
      )
    });

    if (!tkValue) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Sin token de empresa" });
    }

    const locerResponse = await fetch(
      `${env.SERVER_URL}/api/locker/byTokenEmpresa/${tkValue.value}`,
    );

    const reservedBoxData = await locerResponse.json();
    const validatedData = z.array(lockerValidator).safeParse(reservedBoxData);

    if (!validatedData.success || !validatedData.data) {
      throw new Error("Invalid locker data");
    }

    // Agrupa todos los lockers por tamaño
    const boxCountsBySize: { [sizeName: string]: number } = {};

    validatedData.data.forEach((locker) => {
      locker.boxes.forEach((box) => {
        const sizeName = box.idSizeNavigation?.nombre || "Unknown";
        boxCountsBySize[sizeName] = (boxCountsBySize[sizeName] || 0) + 1;
      });
    });

    return boxCountsBySize;
  }),

  getSizes: protectedProcedure.query(async ({ ctx }) => {
    const sizesData = await db.query.sizes.findMany({
      where: eq(schema.sizes.entidadId, ctx.orgId ?? "")
    });

    return sizesData;
  }),

  getAverageReservationDuration: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        filterSerie: z.array(z.string()).nullable(),
        filterEntities: z.array(z.string()).nullable(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      // Fetch reservations within the date range with valid start and end dates
      let reserves = await db.query.reservas.findMany({
        where: (reserva) =>
          and(
            gte(reserva.FechaInicio, startDate),
            lte(reserva.FechaFin, endDate),
            isNotNull(reserva.FechaInicio),
            isNotNull(reserva.FechaFin),
            isNotNull(reserva.nReserve),
          ),
      });

      if (Array.isArray(input.filterSerie)) {
        const validSeries = new Set(input.filterSerie);
        reserves = reserves.filter(v => validSeries.has(v.NroSerie ?? ""));
      }

      if (Array.isArray(input.filterEntities)) {
        const validEnts = new Set(input.filterEntities);
        reserves = reserves.filter(v => validEnts.has(v.entidadId ?? ""));
      }

      // Calculate the duration of each reservation in days and accumulate data by duration
      const durationMap: { [duration: number]: number } = {};
      let totalReservations = 0;
      let totalDays = 0;

      reserves.forEach((reserve) => {
        if (reserve.FechaInicio && reserve.FechaFin) {
          const start = new Date(reserve.FechaInicio);
          const end = new Date(reserve.FechaFin);
          const duration = Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Update the duration map and counters
          durationMap[duration] = (durationMap[duration] || 0) + 1;
          totalReservations += 1;
          totalDays += duration;
        }
      });

      const averageDuration =
        totalReservations > 0 ? totalDays / totalReservations : 0;

      // Format result to match the expected output for the chart and table
      const durationData = Object.entries(durationMap).map(([days, count]) => ({
        days: parseInt(days),
        reservations: count,
        averageDays: averageDuration,
      }));

      return {
        data: durationData,
        averageDuration,
      };
    }),
});

// Helper functions

async function getSizesMap(entitiesFilter: string[] | null): Promise<SizeMap> {
  let sizesData = await db.query.sizes.findMany();
  if (entitiesFilter) {
    sizesData = sizesData.filter(v => entitiesFilter.some(k => k === v.entidadId));
  }
  
  const sizeMap: { [id: number]: string } = {};

  sizesData.forEach((size) => {
    sizeMap[size.id] = size.nombre || "Unknown"; // Fallback to "Unknown" if nombre is null
  });

  return sizeMap;
}

function groupOccupationDataByDay(reserves: Reserve[], sizeMap: SizeMap) {
  const occupationData: DailyOccupation[] = [];

  reserves.forEach((reserve) => {
    if (!reserve.FechaInicio) return; // Skip if FechaInicio is null

    const date = new Date(reserve.FechaInicio);
    const dayKey = `${date.getDate()}/${date.getMonth() + 1}`;
    const sizeName = sizeMap[reserve.IdSize!] || "Unknown";

    let dayEntry = occupationData.find((entry) => entry.day === dayKey);
    if (!dayEntry) {
      dayEntry = { day: dayKey, sizes: {}, total: 0 };
      occupationData.push(dayEntry);
    }

    dayEntry.sizes[sizeName] = (dayEntry.sizes[sizeName] || 0) + 1;
    dayEntry.total += 1;
  });

  return occupationData;
}

function calculateBoxCountsBySize(data: Locker[]) {
  const boxCountsBySize: { [sizeName: string]: number } = {};

  data.forEach((locker) => {
    locker.boxes.forEach((box) => {
      const sizeName = box.idSizeNavigation?.nombre || "Unknown";
      boxCountsBySize[sizeName] = (boxCountsBySize[sizeName] || 0) + 1;
    });
  });

  return boxCountsBySize;
}

function formatBillingData(transactions: Transaction[]) {
  const billingMap: { [date: string]: number } = {};

  transactions.forEach((transaction) => {
    if (transaction.confirmedAt) {
      const date = new Date(transaction.confirmedAt);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`; // Format "day/month"
      const amount = transaction.amount || 0;
      billingMap[formattedDate] = (billingMap[formattedDate] || 0) + amount;
    }
  });

  const result = Object.entries(billingMap).map(([day, amount]) => ({
    day,
    amount,
  }));

  return result;
}
