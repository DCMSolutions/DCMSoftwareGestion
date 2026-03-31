import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import {
  PERMISO_ADMIN,
  Permisos,
  type PermisosValue,
  hasAllSet,
  hasAnySet,
} from "./permisos";
import { db, schema } from "~/server/db";

// todas las asignaciones de roles de un usuario
const preparedUserPermsRoles = db.query.userRoles
  .findMany({
    where: eq(schema.userRoles.userId, sql.placeholder("userId")),
    with: {
      rol: {
        columns: {
          id: true,
          companyId: true,
        },
        with: {
          permisos: {
            columns: {
              value: true,
            },
          },
        },
      },
    },
  })
  .prepare();

/// con companyId agarra los roles de la company también,
/// sino solo agarra los roles globales
export async function serverUserPerms(
  userId: string,
  companyId: string | null,
): Promise<{
  perms: Set<PermisosValue>;
  roles: {
    id: string;
    companyId: string | null;
  }[];
}> {
  const res = await preparedUserPermsRoles.execute({ userId });
  if (!res) {
    return {
      perms: new Set(),
      roles: [],
    };
  }

  // un set (conjunto) no puede tener repetidos y la búsqueda es rápida
  const perms: Set<PermisosValue> = new Set();

  res
    .filter((v) => v.userId && v.userId.length > 0)
    // por cada rol asignado
    .map((v) => v.rol)
    // solo los globales y de la company especificada
    .filter((v) => {
      if (typeof companyId === "string") {
        return v.companyId === companyId || v.companyId === null;
      } else {
        return v.companyId === null;
      }
    })
    // agarro los permisos
    .forEach((rol) => {
      // y los agrego en la lista de permisos
      rol.permisos.forEach((perm) => {
        const permisoTranslate = (Permisos as { [key: string]: string })[
          perm.value
        ];
        if (!permisoTranslate) {
          console.error(
            `serverUserPerms se encontró permiso inválido '${perm.value}' en rol ${rol.id}`,
          );
        } else {
          perms.add(perm.value as PermisosValue);
        }
      });
    });

  return {
    perms,
    roles: res.map((v) => ({ id: v.rol.id, companyId: v.rol.companyId })),
  };
}

// no hace validación de companyId (ya espera que sea null a propósito o un string)
export async function trpcTienePermisoNC(
  userId: string,
  companyId: string | null,
  permiso: PermisosValue,
): Promise<Awaited<ReturnType<typeof serverUserPerms>>> {
  const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
  if (!permisoTranslate) {
    console.error(
      "trpcTienePermisoNC intenta chequear permiso que no existe:",
      permiso,
    );
  }

  const res = await serverUserPerms(userId, companyId);

  // si no tiene el permiso Y si tampoco tiene todos los permisos
  if (!res.perms.has(permiso) && !res.perms.has(PERMISO_ADMIN)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Falta el permiso ${permiso}`,
    });
  }

  return res;
}

// Versión any de trpcTienePermisoNC
// ok si contiene ALGUNO de los permisos listados
export async function trpcTienePermisoNCAny(
  userId: string,
  companyId: string | null,
  permisoAny: PermisosValue[],
): Promise<Awaited<ReturnType<typeof serverUserPerms>>> {
  for (const permiso of permisoAny) {
    const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
    if (!permisoTranslate) {
      console.error(
        "trpcTienePermisoNCAny intenta chequear permiso que no existe:",
        permiso,
      );
    }
  }

  const res = await serverUserPerms(userId, companyId);

  // si no tiene alguno de los permisos Y si tampoco tiene todos los permisos
  if (!hasAnySet(res.perms, permisoAny) && !res.perms.has(PERMISO_ADMIN)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Falta alguno de los permisos: [${permisoAny.join(", ")}]`,
    });
  }

  return res;
}

// Versión all de trpcTienePermisoNC
// ok si contiene TODOS los permisos listados
export async function trpcTienePermisoNCAll(
  userId: string,
  companyId: string | null,
  permisoAll: PermisosValue[],
): Promise<Awaited<ReturnType<typeof serverUserPerms>>> {
  for (const permiso of permisoAll) {
    const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
    if (!permisoTranslate) {
      console.error(
        "trpcTienePermisoNCAll intenta chequear permiso que no existe:",
        permiso,
      );
    }
  }

  const res = await serverUserPerms(userId, companyId);

  // si no tiene todos los permisos especificados Y si tampoco tiene todos los permisos
  if (!hasAllSet(res.perms, permisoAll) && !res.perms.has(PERMISO_ADMIN)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Falta tener todos los permisos: [${permisoAll.join(", ")}]`,
    });
  }

  return res;
}

// trpcTienePermiso además hace un check de companyId válido (no null ni undefined ni "")
// retorna el companyId, internamente usa trpcTienePermisoNC
export async function trpcTienePermiso(
  userId: string,
  companyId: unknown,
  permiso: PermisosValue,
): Promise<
  {
    companyId: string;
  } & Awaited<ReturnType<typeof trpcTienePermisoNC>>
> {
  if (typeof companyId !== "string" || companyId.trim() === "") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No tiene entidad asignada",
    });
  }

  return {
    companyId,
    ...(await trpcTienePermisoNC(userId, companyId, permiso)),
  };
}

// versión "any" de trpcTienePermiso
export async function trpcTienePermisoAny(
  userId: string,
  companyId: unknown,
  permisoAny: PermisosValue[],
): Promise<
  {
    companyId: string;
  } & Awaited<ReturnType<typeof trpcTienePermisoNCAny>>
> {
  if (typeof companyId !== "string" || companyId.trim() === "") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No tiene entidad asignada",
    });
  }

  return {
    companyId,
    ...(await trpcTienePermisoNCAny(userId, companyId, permisoAny)),
  };
}

// versión "all" de trpcTienePermiso
export async function trpcTienePermisoAll(
  userId: string,
  companyId: unknown,
  permisoAll: PermisosValue[],
): Promise<
  {
    companyId: string;
  } & Awaited<ReturnType<typeof trpcTienePermisoNCAll>>
> {
  if (typeof companyId !== "string" || companyId.trim() === "") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No tiene entidad asignada",
    });
  }

  return {
    companyId,
    ...(await trpcTienePermisoNCAll(userId, companyId, permisoAll)),
  };
}

// si permiso es un array, retorna ok si contiene AL MENOS UN PERMISO DE permiso
export async function trpcTienePermisoCtx(
  ctx: {
    orgId: string | undefined | null;
    session: {
      user?: {
        id?: string;
      };
    };
  },
  permiso: PermisosValue,
): Promise<Awaited<ReturnType<typeof trpcTienePermiso>>> {
  if (
    typeof ctx.session?.user?.id !== "string" ||
    ctx.session.user.id.trim() === ""
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No está logueado" });
  }

  return await trpcTienePermiso(
    ctx.session.user.id,
    ctx.orgId,
    permiso,
  );
}

// ok si tiene ALGUNO de los permisos listados
export async function trpcTienePermisoCtxAny(
  ctx: {
    orgId: string | undefined | null;
    session: {
      user?: {
        id?: string;
      };
    };
  },
  permisoAny: PermisosValue[],
): Promise<Awaited<ReturnType<typeof trpcTienePermisoAny>>> {
  if (
    typeof ctx.session?.user?.id !== "string" ||
    ctx.session.user.id.trim() === ""
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No está logueado" });
  }

  return await trpcTienePermisoAny(
    ctx.session.user.id,
    ctx.orgId,
    permisoAny,
  );
}

// ok si tiene TODOS los permisos listados
export async function trpcTienePermisoCtxAll(
  ctx: {
    orgId: string | undefined | null;
    session: {
      user?: {
        id?: string;
      };
    };
  },
  permisoAll: PermisosValue[],
): Promise<Awaited<ReturnType<typeof trpcTienePermisoAll>>> {
  if (
    typeof ctx.session?.user?.id !== "string" ||
    ctx.session.user.id.trim() === ""
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No está logueado" });
  }

  return await trpcTienePermisoAll(
    ctx.session.user.id,
    ctx.orgId,
    permisoAll,
  );
}
