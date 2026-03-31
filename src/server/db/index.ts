import { drizzle } from "drizzle-orm/node-postgres";
import { config } from 'dotenv';
config();  // Cargar variables de entorno

import * as schema from "./schema";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
export type DBType = typeof db;
export { schema };
