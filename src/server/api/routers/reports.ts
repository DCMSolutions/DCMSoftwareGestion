import { and, gte, lte, isNotNull, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db, schema } from "~/server/db";
import { env } from "~/env";
import { lockerValidator } from "./lockers";

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
  getOcupattion: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;

      // Get reservations within the date range with assigned lockers
      const reserves = await db.query.reservas.findMany({
        where: (reserva) =>
          and(
            gte(reserva.FechaInicio, startDate),
            lte(reserva.FechaFin, endDate),
            isNotNull(reserva.nReserve),
            isNotNull(reserva.IdBox),
          ),
      });

      const sizeMap = await getSizesMap();
      const occupationData = groupOccupationDataByDay(reserves, sizeMap);

      return occupationData;
    }),

  getTotalBoxesAmountPerSize: publicProcedure.query(async () => {
    const locerResponse = await fetch(
      `${env.SERVER_URL}/api/locker/byTokenEmpresa/${env.TOKEN_EMPRESA}`,
    );

    const reservedBoxData = await locerResponse.json();
    const validatedData = z.array(lockerValidator).safeParse(reservedBoxData);

    if (!validatedData.success || !validatedData.data) {
      throw new Error("Invalid locker data");
    }

    const boxCountsBySize = calculateBoxCountsBySize(
      validatedData.data as Locker[],
    );
    return boxCountsBySize;
  }),

  getSizes: publicProcedure.query(async () => {
    const sizesData = await db.query.sizes.findMany();
    return sizesData;
  }),

  getTransactions: publicProcedure.query(async () => {
    const transactions = await db.query.transactions.findMany();
    const formattedTransactions = formatBillingData(transactions);

    return {
      data: formattedTransactions,
      total: formattedTransactions.reduce(
        (acc, entry) => acc + entry.amount,
        0,
      ),
    };
  }),
});

// Helper functions

async function getSizesMap(): Promise<SizeMap> {
  const sizesData = await db.query.sizes.findMany();
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
