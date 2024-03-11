import { SizeIcon } from "@radix-ui/react-icons";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  decimal,
  float,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `test_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

export const cities = mysqlTable(
  "cities",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);
export const stores = mysqlTable(
  "stores",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    cityId: varchar("cityId", { length: 255 }).notNull(),
    serieLocker: varchar("serieLocker", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);
export const storesRelations = relations(stores, ({ one }) => ({
  city: one(cities, {
    fields: [stores.cityId],
    references: [cities.identifier],
  }),
}));

export const config = mysqlTable(
  "config",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    token: varchar("token", { length: 20 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const lockers = mysqlTable(
  "lockers",
  {
    id: varchar("identifier", { length: 255 }).notNull(),
    nroSerieLocker: varchar("name", { length: 255 }).notNull(),
    status: varchar("description", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.id),
  }),
);

export const globalconfig = mysqlTable(
  "globalconfig",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    token: varchar("token", { length: 255 }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const userData = mysqlTable(
  "userdata",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    last_name: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    tel: int("tel").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const feeData = mysqlTable(
  "feedata",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    coin: varchar("coin", { length: 255 }),
    size: int("size"),
    value: float("value"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const feeRelations = relations(feeData, ({ one }) => ({
  coin: one(coinData, {
    fields: [feeData.coin],
    references: [coinData.identifier],
  }),
}));

export const coinData = mysqlTable(
  "coindate",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    value: float("value"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const sizes = mysqlTable(
  "sizes",
  {
    id: int("id"),
    ancho: int("ancho"),
    alto: int("alto"),
    cantidad: int("cantidad"),
    cantidadSeleccionada: int("cantidadSeleccionada"),
    profundidad: int("profundidad"),
    nombre: varchar("nombre", { length: 255 }),
    tarifa: varchar("tarifa", { length: 255 }),
    image: varchar("imagen", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.id),
  }),
);
