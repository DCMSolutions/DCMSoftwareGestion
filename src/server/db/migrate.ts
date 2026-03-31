import { sql } from "drizzle-orm";
import { db } from "~/server/db";

async function migrarDatos() {
  try {
    // Migrar los datos de __old_push_test_clients a test_clients
    await db.execute(sql`
      INSERT INTO test_clients (identifier, name, email, dni)
      SELECT identifier, name, email, 'no-dni' FROM __old_push_test_clients
    `);

    console.log("Migración completada exitosamente.");
  } catch (error) {
    console.error("Error durante la migración:", error);
  }
}

migrarDatos();
