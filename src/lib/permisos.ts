export const Permisos = {
  "*": "ADMINISTRADOR",
  "panel:params": "(Panel) Parámetros",
  "panel:monitor": "(Panel) Monitor",
  "panel:locales": "(Panel) Locales",
  "panel:sizes": "(Panel) Tamaños",
  "panel:clientes": "(Panel) Clientes",
  "panel:reservas": "(Panel) Reservas",
  "panel:cupones": "(Panel) Cupones",
};

export const PermisosVisibles: { [key in PermisosValue]: boolean } = {
  "*": false,
  "panel:clientes": true,
  "panel:cupones": true,
  "panel:locales": true,
  "panel:monitor": true,
  "panel:params": true,
  "panel:reservas": true,
  "panel:sizes": true,
};

// si el usuario tiene este permiso quiere decir que cualquier llamada a
// trpcTienePermiso/trpcTienePermisoNC considerará que el usuario está habilitado
// (o sea, el permiso equivalente a tener todos los permisos)
export const PERMISO_ADMIN: PermisosValue = "*";
export const ROL_ADMIN_ID: string = "admin";
export type PermisosValue = keyof typeof Permisos;

export function tienePermiso(
  permisos: Set<PermisosValue>,
  permiso: PermisosValue,
): boolean {
  const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
  if (!permisoTranslate) {
    console.error(
      "tienePermiso intenta chequear permiso que no existe:",
      permiso,
    );
  }

  return permisos.has(permiso) || permisos.has(PERMISO_ADMIN);
}

export function tieneAnyPermiso(
  permisos: Set<PermisosValue>,
  permisosAny: PermisosValue[],
): boolean {
  for (const permiso of permisosAny) {
    const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
    if (!permisoTranslate) {
      console.error(
        "tieneAnyPermiso intenta chequear permiso que no existe:",
        permiso,
      );
    }
  }

  return hasAnySet(permisos, permisosAny) || permisos.has(PERMISO_ADMIN);
}

export function tieneAllPermiso(
  permisos: Set<PermisosValue>,
  permisosAll: PermisosValue[],
): boolean {
  for (const permiso of permisosAll) {
    const permisoTranslate = (Permisos as { [key: string]: string })[permiso];
    if (!permisoTranslate) {
      console.error(
        "tieneAllPermiso intenta chequear permiso que no existe:",
        permiso,
      );
    }
  }

  return hasAllSet(permisos, permisosAll) || permisos.has(PERMISO_ADMIN);
}

// retorna true si a tiene todos los elementos de b
// (b contenido en a)
export function hasAllSet<T>(a: Set<T>, b: T[]): boolean {
  // por cada valor de b
  for (const valor of b) {
    // tiene que estar en a, sino retorna false
    if (!a.has(valor)) {
      return false;
    }
  }

  return true;
}

// retorna true si a tiene algún elemento de b
export function hasAnySet<T>(a: Set<T>, b: T[]): boolean {
  for (const valor of b) {
    if (a.has(valor)) {
      return true;
    }
  }

  return false;
}

export function setsDifieren<T>(a: Set<T>, b: Set<T>): boolean {
  for (const v of a) {
    if (!b.has(v)) {
      return true;
    }
  }

  for (const v of b) {
    if (!a.has(v)) {
      return true;
    }
  }

  return false;
}

export function hasPermSet(perms: Set<string>, role: PermisosValue): boolean {
  const roleSplit = role.split(":");

  if (role === "*") {
    return perms.has("*");
  }

  for (const iRole of perms) {
    if (role === iRole) {
      return true;
    }
  }

  for (let i = 0; i < roleSplit.length; i++) {
    let roleBuilt = "";
    for (let k = 0; k <= i; k++) {
      if (roleBuilt !== "") {
        roleBuilt += ":";
      }

      roleBuilt += roleSplit[k];
    }

    if (perms.has(`${roleBuilt}:*`)) {
      return true;
    }
  }

  if (perms.has("*")) {
    return true;
  }

  return false;
}
