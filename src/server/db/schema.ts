import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  primaryKey,
  real,
  pgTableCreator,
  uniqueIndex,
  index,
  unique,
  varchar,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
export const pgTable = pgTableCreator((name) => `test_${name}`);

const columnId = varchar("id", { length: 21 })
  .notNull()
  .primaryKey()
  .$defaultFn(() => nanoid(21));

const createdAt = text("confirmedAt").notNull().default(sql`CURRENT_DATE`);

export const cities = pgTable(
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

export const clients = pgTable(
  "clients",
  {
    identifier: serial("identifier").primaryKey(),
    name: varchar("name", { length: 255 }),
    surname: varchar("surname", { length: 255 }),
    email: varchar("email", { length: 255 }),
    prefijo: integer("prefijo"),
    telefono: integer("telefono"),
    dni: varchar("dni", { length: 255 }),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
    emailIndex: index("idx_email").on(vt.email),
  }),
);

export const clientsRelations = relations(clients, ({ one }) => ({
  entidad: one(companies, {
    fields: [clients.entidadId],
    references: [companies.id]
  }),
}));

export const stores = pgTable(
  "stores",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    cityId: varchar("cityId", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }),
    organizationName: varchar("organizationName", { length: 255 }),
    description: varchar("description", { length: 255 }),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
    cityIndex: index("idx_cityId").on(vt.cityId),
  }),
);

export const storesRelations = relations(stores, ({ one, many }) => ({
  city: one(cities, {
    fields: [stores.cityId],
    references: [cities.identifier],
  }),
  lockers: many(storesLockers),
  entidad: one(companies, {
    fields: [stores.entidadId],
    references: [companies.id]
  }),
}));

export const storesLockers = pgTable(
  "stores_lockers",
  {
    storeId: varchar("storeId", { length: 255 }).notNull(),
    serieLocker: varchar("serieLocker", { length: 255 }).notNull(),
  },
  (t) => ({
    key: primaryKey(t.storeId, t.serieLocker),
    storeIndex: index("store_idx").on(t.storeId),
  })
);

export const storesLockersRelations = relations(storesLockers, ({ one }) => ({
  store: one(stores, {
    fields: [storesLockers.storeId],
    references: [stores.identifier]
  }),
}))

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    confirm: boolean("confirm").default(false),
    confirmedAt: text("confirmedAt").default(sql`CURRENT_DATE`),
    client: varchar("client", { length: 255 }),
    amount: integer("amount"),
    nReserve: integer("nReserve"),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.id),
  }),
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  clients: one(clients, {
    fields: [transactions.client],
    references: [clients.identifier],
  }),
  entidad: one(companies, {
    fields: [transactions.entidadId],
    references: [companies.id]
  }),
}));

export const sizes = pgTable(
  "sizes",
  {
    id: integer("id").notNull(),
    alto: integer("alto"),
    ancho: integer("ancho"),
    profundidad: integer("profundidad"),
    nombre: varchar("nombre", { length: 255 }),
    cantidad: integer("cantidad"),
    cantidadSeleccionada: integer("cantidadSeleccionada"),
    tarifa: varchar("tarifa", { length: 255 }),
    image: varchar("image", { length: 255 }),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.id, vt.entidadId] }),
  }),
);

export const sizesRelations = relations(sizes, ({ one }) => ({
  entidad: one(companies, {
    fields: [sizes.entidadId],
    references: [companies.id]
  }),
}));

export const reservasToClients = pgTable(
  "reservasToClients",
  {
    identifier: serial("id").primaryKey(),
    clientId: integer("clientId"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const reservasToClientsRelations = relations(
  reservasToClients,
  ({ one }) => ({
    clients: one(clients, {
      fields: [reservasToClients.clientId],
      references: [clients.identifier],
    }),
  }),
);
export const reservas = pgTable(
  "reservas",
  {
    identifier: varchar("identifier", { length: 255 }),
    NroSerie: varchar("NroSerie", { length: 255 }),
    IdSize: integer("IdSize"),
    IdBox: integer("IdBox"),
    IdFisico: integer("IdFisico"),
    Token1: integer("Token1"),
    FechaCreacion: varchar("FechaCreacion", { length: 255 }),
    FechaInicio: varchar("FechaInicio", { length: 255 }),
    FechaFin: varchar("FechaFin", { length: 255 }),
    Contador: integer("Contador"),
    Confirmado: boolean("Confirmado").default(false),
    Modo: varchar("Modo", { length: 255 }),
    Cantidad: integer("Cantidad"),
    IdTransaction: integer("IdTransaction"),
    client: varchar("client", { length: 255 }),
    nReserve: integer("nReserve"),
    mpPagadoOk: boolean("mpPagadoOk").default(false),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
    clientIndex: index("idx_client").on(vt.client), // Índice no único en client
    nReserveIndex: index("idx_nReserve").on(vt.nReserve), // Índice no único en nReserve
    idBoxIndex: index("idx_IdBox").on(vt.IdBox),
    idBoxFechaFinIndex: index("idx_IdBox_FechaFin").on(vt.IdBox, vt.FechaFin),
    nReserveTokenIndex: uniqueIndex("idx_nReserve_Token1").on(
      vt.nReserve,
      vt.Token1,
    ), // Índice compuesto
  }),
);

export const reservasRelations = relations(reservas, ({ one }) => ({
  clients: one(clients, {
    fields: [reservas.client, reservas.entidadId],
    references: [clients.email, clients.entidadId],
  }),
  entidad: one(companies, {
    fields: [reservas.entidadId],
    references: [companies.id]
  }),
}));

export const publicConfig = pgTable(
  "publicConfig",
  {
    key: text("identifier").notNull(),
    value: text("value").notNull(),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.key, vt.entidadId] }),
  }),
);

export const publicConfigRelations = relations(publicConfig, ({ one }) => ({
  entidad: one(companies, {
    fields: [publicConfig.entidadId],
    references: [companies.id]
  }),
}));

export const privateConfig = pgTable(
  "privateConfig",
  {
    key: text("identifier").notNull(),
    value: text("value").notNull(),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.key, vt.entidadId] }),
  }),
);

export const privateConfigRelations = relations(privateConfig, ({ one }) => ({
  entidad: one(companies, {
    fields: [privateConfig.entidadId],
    references: [companies.id]
  }),
}));

export const feeData = pgTable(
  "feedata",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    coin: varchar("coin", { length: 255 }),
    size: integer("size"),
    localId: text("localId"),
    value: real("value"),
    discount: real("discount"),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
    localIdIdx: index("local_id_idx").on(vt.localId),
    uniqueLocal: unique("unique_local_size").on(vt.size, vt.localId),
  }),
);

export const feeDataRelations = relations(feeData, ({ one }) => ({
  store: one(stores, {
    fields: [feeData.localId],
    references: [stores.identifier]
  }),
  coin: one(coinData, {
    fields: [feeData.coin],
    references: [coinData.identifier],
  }),
  entidad: one(companies, {
    fields: [feeData.entidadId],
    references: [companies.id]
  }),
}));

export const coinData = pgTable(
  "coindate",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    value: real("value"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const cuponesData = pgTable(
  "cupones",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    codigo: varchar("codigo", { length: 255 }),
    tipo_descuento: varchar("tipo_descuento", { length: 255 }),
    valor_descuento: real("valor_descuento"),
    cantidad_usos: real("cantidad_usos"),
    fecha_desde: text("fecha_desde"),
    fecha_hasta: text("fecha_hasta"),
    usos: real("usos"),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const cuponesRelations = relations(cuponesData, ({ one }) => ({
  entidad: one(companies, {
    fields: [cuponesData.entidadId],
    references: [companies.id]
  }),
}));

export const pagos = pgTable(
  "pagos",
  {
    identifier: serial("identifier").primaryKey(),
    mpMetaJson: text("mpMetaJson"),
    idTransactionsJson: text("idTransactionsJson"),
    entidadId: text("entidadId")
      .references(() => companies.id, { onDelete: "cascade" }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const pagosRelations = relations(pagos, ({ one }) => ({
  entidad: one(companies, {
    fields: [pagos.entidadId],
    references: [companies.id]
  }),
}));

export const companies = pgTable(
  "company",
  {
    id: columnId,
    name: text("name").notNull(),
    createdAt,
  },
  (companies) => ({
    nameIdx: index("company_name_idx").on(companies.name),
  }),
);

export const companiesRelations = relations(companies, ({ many }) => ({
  usuarioEntidades: many(usuarioEntidad),
  clients: many(clients),
  stores: many(stores),
  transactions: many(transactions),
  sizes: many(sizes),
  publicConfig: many(publicConfig),
  privateConfig: many(privateConfig),
  reservas: many(reservas),
  feeData: many(feeData),
  cuponesData: many(cuponesData),
  pagos: many(pagos),
}));

export const userRoles = pgTable(
  "userRoles",
  {
    userId: text("userId")
      .notNull(),
      // .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("roleId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      name: "userRoles_pk",
      columns: [table.userId, table.roleId],
    }),
    userIdIdx: index("userRoles_userIdIdx").on(table.userId),
    roleIdIdx: index("userRoles_roleIdIdx").on(table.roleId),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  rol: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  // user: one(users, {
  //   fields: [userRoles.userId],
  //   references: [users.id],
  // }),
}));

export const usuarioEntidad = pgTable(
  "usuarioEntidad",
  {
    id: columnId,
    userId: text("userId")
      .notNull(),
      // .references(() => users.id, { onDelete: "cascade" }),
    entidadId: text("entidadId")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    isSelected: boolean("isSelected").default(false),
  },
  (tabla) => ({
    userIdIdx: index("usuarioEntidad_userIdIdx").on(tabla.userId),
    entidadIdIdx: index("usuarioEntidad_entidadIdIdx").on(tabla.entidadId),
  }),
);

export const userEntitiesRelations = relations(usuarioEntidad, ({ one }) => ({
  entity: one(companies, {
    fields: [usuarioEntidad.entidadId],
    references: [companies.id],
  }),
  // user: one(users, {
  //   fields: [usuarioEntidad.userId],
  //   references: [users.id],
  // }),
}));

export const roles = pgTable(
  "roles",
  {
    id: columnId,
    name: text("name").notNull(),
    companyId: text("companyId")
      .references(() => companies.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => ({
    companyIdx: index("roles_companyIdx").on(table.companyId),
  }),
);

export const rolesRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, {
    fields: [roles.companyId],
    references: [companies.id],
  }),
  users: many(userRoles),
  permisos: many(permisos),
}));

export const permisos = pgTable(
  "permisos",
  {
    id: columnId,
    value: text("value").notNull(),
    rolId: text("rolId")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => ({
    rolIdIdx: index("permisos_rolIdIdx").on(table.rolId),
  }),
);

export const permisosRelations = relations(permisos, ({ one }) => ({
  rol: one(roles, {
    fields: [permisos.rolId],
    references: [roles.id],
  }),
}));
