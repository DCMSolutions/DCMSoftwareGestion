import { cityRouter } from "~/server/api/routers/city";
import { storeRouter } from "~/server/api/routers/store";
import { createTRPCRouter } from "~/server/api/trpc";
import { sizeRouter } from "./routers/sizes";
import { lockerRouter } from "./routers/lockers";
import { feeRouter } from "./routers/fee";
import { coinRouter } from "./routers/coin";
import { transactionRouter } from "./routers/transactions";
import { clientsRouter } from "./routers/clients";
import { lockerReserveRouter } from "./routers/lockerReserveRouter";
import { emailRouter } from "./routers/email";
import { mobbexRouter } from "./routers/mobbex";
import { clerkRouter } from "./routers/clerk";
import { reserveRouter } from "./routers/reserves";
import { cuponesRouter } from "./routers/cupones";
import { tokenRouter } from "./routers/token";
import { reportsRouter } from "./routers/reports";
import { paramsRouter } from "./routers/params";
import { mpRouter } from "./routers/mp";
import { configRouter } from "./routers/config";
import { userRouter } from "./routers/users";
import { companiesRouter } from "./routers/entities";
import { testRouter } from "./routers/test";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  city: cityRouter,
  store: storeRouter,
  size: sizeRouter,
  locker: lockerRouter,
  config: configRouter,
  fee: feeRouter,
  coin: coinRouter,
  transaction: transactionRouter,
  clients: clientsRouter,
  lockerReserve: lockerReserveRouter,
  email: emailRouter,
  mobbex: mobbexRouter,
  clerk: clerkRouter,
  reserve: reserveRouter,
  cupones: cuponesRouter,
  token: tokenRouter,
  reports: reportsRouter,
  params: paramsRouter,
  mp: mpRouter,
  user: userRouter,
  companies: companiesRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
