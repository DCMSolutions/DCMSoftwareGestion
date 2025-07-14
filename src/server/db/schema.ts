import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  primaryKey,
  real,
  sqliteTableCreator,
  uniqueIndex,
  index,
  unique,
} from "drizzle-orm/sqlite-core";
export const sqliteTable = sqliteTableCreator((name) => `${name}`);

export const cities = sqliteTable(
  "test_cities",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    description: text("description", { length: 255 }).notNull(),
    image: text("image", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const clients = sqliteTable(
  "test_clients",
  {
    identifier: integer("identifier").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }),
    surname: text("surname", { length: 255 }),
    email: text("email", { length: 255 }),
    prefijo: integer("prefijo"),
    telefono: integer("telefono"),
    dni: text("dni", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
    emailIndex: index("idx_email").on(vt.email),
  }),
);

export const stores = sqliteTable(
  "test_stores",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    image: text("image", { length: 255 }),
    cityId: text("cityId", { length: 255 }).notNull(),
    address: text("address", { length: 255 }),
    organizationName: text("organizationName", { length: 255 }),
    description: text("description", { length: 255 }),
    firstTokenUseTime: integer("first_token_use_time").default(15)
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
}));

export const storesLockers = sqliteTable(
  "test_stores_lockers",
  {
    storeId: text("storeId", { length: 255 }).notNull(),
    serieLocker: text("serieLocker", { length: 255 }).notNull(),
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

export const transactions = sqliteTable(
  "test_transactions",
  {
    id: integer("id").primaryKey().primaryKey({ autoIncrement: true }),
    confirm: integer("confirm", { mode: "boolean" }).default(false),
    confirmedAt: text("confirmedAt").default(sql`(CURRENT_DATE)`),
    client: text("client", { length: 255 }),
    amount: integer("amount"),
    nReserve: integer("nReserve"),
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
}));

export const sizes = sqliteTable(
  "test_sizes",
  {
    id: integer("id").notNull(),
    alto: integer("alto"),
    ancho: integer("ancho"),
    profundidad: integer("profundidad"),
    nombre: text("nombre", { length: 255 }),
    cantidad: integer("cantidad"),
    cantidadSeleccionada: integer("cantidadSeleccionada"),
    tarifa: text("tarifa", { length: 255 }),
    image: text("image", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.id),
  }),
);
export const reservasToClients = sqliteTable(
  "test_reservasToClients",
  {
    identifier: integer("id").primaryKey({ autoIncrement: true }),
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
export const reservas = sqliteTable(
  "test_reservas",
  {
    identifier: text("identifier", { length: 255 }),
    NroSerie: text("NroSerie", { length: 255 }),
    IdSize: integer("IdSize"),
    IdBox: integer("IdBox"),
    IdFisico: integer("IdFisico"),
    Token1: integer("Token1"),
    Token2: integer("Token2"),
    FechaCreacion: text("FechaCreacion", { length: 255 }),
    FechaInicio: text("FechaInicio", { length: 255 }),
    FechaFin: text("FechaFin", { length: 255 }),
    Contador: integer("Contador"),
    Confirmado: integer("Confirmado", { mode: "boolean" }).default(false),
    Modo: text("Modo", { length: 255 }),
    Cantidad: integer("Cantidad"),
    IdTransaction: integer("IdTransaction"),
    client: text("client", { length: 255 }),
    nReserve: integer("nReserve"),
    mpPagadoOk: integer("mpPagadoOk", { mode: "boolean" }).default(false),
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
    fields: [reservas.client],
    references: [clients.email],
  }),
}));

export const publicConfig = sqliteTable(
  "test_publicConfig",
  {
    key: text("identifier").notNull(),
    value: text("value").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.key),
  }),
);

export const privateConfig = sqliteTable(
  "test_privateConfig",
  {
    key: text("identifier").notNull(),
    value: text("value").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.key),
  }),
);

export const lockers = sqliteTable(
  "test_lockers",
  {
    id: text("identifier", { length: 255 }).notNull(),
    nroSerieLocker: text("name", { length: 255 }).notNull(),
    status: text("description", { length: 255 }),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.id),
  }),
);

export const userData = sqliteTable(
  "test_userdata",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    last_name: text("last_name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    tel: integer("tel").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const feeData = sqliteTable(
  "test_feedata",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    description: text("description", { length: 255 }),
    coin: text("coin", { length: 255 }),
    size: integer("size"),
    localId: text("localId"),
    value: real("value"),
    discount: real("discount"),
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
}));

export const coinData = sqliteTable(
  "test_coindate",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    description: text("description", { length: 255 }),
    value: real("value"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const cuponesData = sqliteTable(
  "test_cupones",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    codigo: text("codigo", { length: 255 }),
    tipo_descuento: text("tipo_descuento", { length: 255 }),
    valor_descuento: real("valor_descuento"),
    cantidad_usos: real("cantidad_usos"),
    fecha_desde: text("fecha_desde"),
    fecha_hasta: text("fecha_hasta"),
    usos: real("usos"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);

export const pagos = sqliteTable(
  "test_pagos",
  {
    identifier: integer("identifier").primaryKey({ autoIncrement: true }),
    mpMetaJson: text("mpMetaJson"),
    idTransactionsJson: text("idTransactionsJson"),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier),
  }),
);
