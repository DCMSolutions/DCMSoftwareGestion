import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { serverUserPerms, trpcTienePermisoCtx } from "~/lib/roles";
import { PERMISO_ADMIN, Permisos, PermisosValue, ROL_ADMIN_ID, tienePermiso } from "~/lib/permisos";
import { db, schema } from "~/server/db";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { RouterOutputs } from "~/trpc/shared";

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      const user = await clerkClient.users.getUser(input.userId);
      const usuarioEntidades = await db.query.usuarioEntidad.findFirst({
        where: eq(schema.usuarioEntidad.userId, user.id)
      });

      const usuarioRoles = await db.query.userRoles.findMany({
        where: eq(schema.userRoles.userId, user.id),
        with: {
          rol: true
        }
      });

      return {
        ...user,
        fullName: ((user.firstName ?? "") + " " + (user.lastName ?? "")).trim(),
        usuarioEntidades: usuarioEntidades ? [usuarioEntidades] : [],
        usuarioRoles,
      };
    }),
  self: protectedProcedure.query(async ({ ctx }) => {
    if (
      typeof ctx.session?.user?.id !== "string" ||
      ctx.session.user.id.trim() === ""
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No está logueado",
      });
    }

    const userEntity = await db.query.usuarioEntidad.findFirst({
      where: and(
        eq(schema.usuarioEntidad.userId, ctx.userId),
        eq(schema.usuarioEntidad.isSelected, true),
      ),
      with: {
        entity: {
          columns: {
            name: true,
            id: true,
          },
        },
      },
    });

    const res = await serverUserPerms(
      ctx.session.user.id,
      ctx.orgId ?? null,
    );

    return {
      ...res,
      orgId: ctx.orgId,
      id: ctx.session.user.id,
      userEntity,
    };
  }),
  selfWithEntidades: protectedProcedure.query(async ({ ctx }) => {
    if (
      typeof ctx.session?.user?.id !== "string" ||
      ctx.session.user.id.trim() === ""
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No está logueado",
      });
    }

    const user = clerkClient.users.getUser(ctx.userId);
    const res = await serverUserPerms(
      ctx.session.user.id,
      ctx.orgId ?? null,
    );

    let entidades = [];
    if (res.perms.has(PERMISO_ADMIN)) {
      entidades = await db.query.companies.findMany({
        columns: {
          name: true,
          id: true,
        },
      });
    } else {
      const associatedEntities = await db.query.usuarioEntidad.findMany({
        where: eq(schema.usuarioEntidad.userId, ctx.userId),
        with: {
          entity: {
            columns: {
              name: true,
              id: true,
            },
          },
        },
      });

      entidades = associatedEntities.map((v) => v.entity);
    }

    return {
      ...res,
      ...user,
      entidades,
      orgId: ctx.orgId,
      id: ctx.session.user.id,
    };
  }),
  selfEntidadAutoasignada: protectedProcedure.query(async ({ ctx }) => {
    const res = await serverUserPerms(
      ctx.session.user.id,
      ctx.orgId ?? null,
    );
    const user = clerkClient.users.getUser(ctx.userId);

    let autoasignada = false;
    let orgId = ctx.orgId;

    if (!orgId) {
      const anyEntidad = await db.query.usuarioEntidad.findFirst({
        where: eq(schema.usuarioEntidad.userId, ctx.session.user.id),
      });

      if (anyEntidad) {
        await db.transaction(async (tx) => {
          await tx
            .update(schema.usuarioEntidad)
            .set({ isSelected: false })
            .where(eq(schema.usuarioEntidad.userId, ctx.session.user.id));
          await tx
            .update(schema.usuarioEntidad)
            .set({ isSelected: true })
            .where(eq(schema.usuarioEntidad.id, anyEntidad.id));
        });

        autoasignada = true;
        orgId = anyEntidad.entidadId;
      }
    }

    return {
      ...res,
      ...user,
      orgId: ctx.orgId,
      id: ctx.session.user.id,
      autoasignada,
    };
  }),
  selectEntidad: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log("selectEntidad", input);

      if (
        typeof ctx.session?.user?.id !== "string" ||
        ctx.session.user.id.trim() === ""
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No está logueado",
        });
      }

      console.log("selectEntidad", input);

      const { perms } = await serverUserPerms(
        ctx.session.user.id,
        ctx.orgId ?? null,
      );

      const entidad = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.id),
      });

      if (!entidad) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const entidadesPosibles = await db.query.usuarioEntidad.findMany({
        where: eq(schema.usuarioEntidad.userId, ctx.userId),
      });

      const asignada = entidadesPosibles.find((v) => v.entidadId === input.id);

      if (perms.has(PERMISO_ADMIN) && !asignada) {
        await db.transaction(async (db) => {
          await db
            .update(schema.usuarioEntidad)
            .set({ isSelected: false })
            .where(eq(schema.usuarioEntidad.userId, ctx.userId));
          await db.insert(schema.usuarioEntidad).values({
            entidadId: entidad.id,
            userId: ctx.userId,
            isSelected: true,
          });
        });
      } else if (!asignada) {
        throw new TRPCError({ code: "NOT_FOUND" });
      } else {
        await db.transaction(async (db) => {
          await db
            .update(schema.usuarioEntidad)
            .set({ isSelected: false })
            .where(eq(schema.usuarioEntidad.userId, ctx.userId));
          await db
            .update(schema.usuarioEntidad)
            .set({ isSelected: true })
            .where(eq(schema.usuarioEntidad.id, asignada.id));
        });
      }

      return "ok";
    }),
  listBasic: protectedProcedure.query(async ({ ctx }) => {
    await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

    // if (perms.has(PERMISO_ADMIN)) {
      const users = await clerkClient.users.getUserList({
        limit: 1000
      });

      const usersList = users.data;
      const res = [];
      for (const user of usersList) {
        const usuarioEntidades = await db.query.usuarioEntidad.findFirst({
          where: eq(schema.usuarioEntidad.userId, user.id)
        });

        const usuarioRoles = await db.query.userRoles.findMany({
          where: eq(schema.userRoles.userId, user.id),
          with: {
            rol: true
          }
        });

        res.push({
          ...user,
          fullName: ((user.firstName ?? "") + " " + (user.lastName ?? "")).trim(),
          usuarioEntidades: usuarioEntidades ? [usuarioEntidades] : [],
          usuarioRoles,
        });
      }

      return res;
    // }

    // // de todas las entidades asignadas obtengo sus usuarios
    // const usuariosPosibles = await db.query.usuarioEntidad.findMany({
    //   where: eq(schema.usuarioEntidad.userId, ctx.userId),
    //   // por cada entidad asignada
    //   with: {
    //     entity: {
    //       with: {
    //         // agarro su lista de usuarios
    //         usuarioEntidades: {
    //           with: {
    //             user: {
    //               columns: {
    //                 email: true,
    //                 id: true,
    //                 image: true,
    //                 name: true,
    //               },
    //               with: {
    //                 usuarioEntidades: {
    //                   columns: {
    //                     entidadId: true,
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       columns: {
    //         id: true,
    //       },
    //     },
    //   },
    // });

    // const mapaUsers: Map<
    //   string,
    //   {
    //     id: string;
    //     name: string | null;
    //     image: string | null;
    //     email: string | null;
    //     usuarioEntidades: {
    //       entidadId: string;
    //     }[];
    //   }
    // > = new Map();

    // usuariosPosibles.forEach((v) =>
    //   v.entity.usuarioEntidades.forEach((v) => {
    //     if (!mapaUsers.has(v.user.id)) {
    //       mapaUsers.set(v.user.id, v.user);
    //     }
    //   }),
    // );

    // return [...mapaUsers.values()];
  }),
  getWithRoleAndEntities: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      try {
        const user = await clerkClient.users.getUser(ctx.userId);
        const usuarioEntidades = await db.query.usuarioEntidad.findFirst({
          where: eq(schema.usuarioEntidad.userId, user.id)
        });

        const roles = await db.query.userRoles.findMany({
          where: eq(schema.userRoles.userId, user.id),
          with: {
            rol: true
          }
        });

        return {
          ...user,
          usuarioEntidades: usuarioEntidades ? [usuarioEntidades] : [],
          // roles,
          assignedRoles: roles.map((v) => v.rol)
        };
      } catch (_) {
        return null;
      }
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      await clerkClient.users.updateUser(input.id, {
        firstName: input.firstName,
        lastName: input.lastName,
      });

      return "ok";
    }),
  getRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      return await db.query.roles.findFirst({
        with: {
          permisos: true,
          company: true,
        },
        where: eq(schema.roles.id, input.id),
      });
    }),
  listRoles: protectedProcedure
    .input(
      z.object({
        asignables: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { perms, roles } = await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      if (perms.has(PERMISO_ADMIN)) {
        return await db.query.roles.findMany({
          with: {
            permisos: true,
            company: true,
          },
          // where: isNotNull(schema.roles.companyId),
        });
      } else {
        const entidadesAsignadas = await db.query.usuarioEntidad.findMany({
          where: eq(schema.usuarioEntidad.userId, ctx.userId),
        });

        const posiblesRoles = await db.query.roles.findMany({
          with: {
            permisos: true,
            company: true,
          },
          where: inArray(
            schema.roles.companyId,
            entidadesAsignadas.map((v) => v.entidadId),
          ),
        });

        if (!input.asignables) {
          return posiblesRoles;
        }

        // solo puedo ver los roles asignables, los roles con permisos que yo tengo
        return posiblesRoles.filter((rol) => {
          // si ya lo tengo entonces no
          if (roles.some((v) => v.id === rol.id)) {
            return false;
          }

          for (const rolPerm of rol.permisos) {
            if (!tienePermiso(perms, rolPerm.value as PermisosValue)) {
              return false;
            }
          }

          return true;
        });
      }
    }),
  assignRoles: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        rolesId: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { perms } = await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se pueden autoasignar roles",
        });
      }

      const rolesAsignados = await db.query.userRoles.findMany({
        where: eq(schema.userRoles.userId, ctx.session.user.id),
      });

      const entidadesPosibles = await db.query.usuarioEntidad.findMany({
        where: eq(schema.usuarioEntidad.userId, input.userId),
      });

      const selectedEntidad = await db.query.usuarioEntidad.findFirst({
        where: and(
          eq(schema.usuarioEntidad.userId, input.userId),
          eq(schema.usuarioEntidad.isSelected, true),
        ),
      });

      const rolesParaAsignar: string[] = [];
      const entidadesParaAsignar: string[] = [];

      // el set para evitar repetitividad
      for (const rolId of new Set(input.rolesId)) {
        /* if (!perms.has(PERMISO_ADMIN)) {
          if (!rolesAsignados.find(v => v.roleId === rolId)) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Solo se pueden asignar roles que ya tenga asignados' });
          }
        } */

        let rol = await db.query.roles.findFirst({
          with: {
            permisos: true,
          },
          where: eq(schema.roles.id, rolId),
        });

        if (!rol && rolId === ROL_ADMIN_ID) {
          const [rolRes] = await db
            .insert(schema.roles)
            .values({
              name: "Admin",
              companyId: null,
              id: ROL_ADMIN_ID,
            })
            .returning();
          await db.insert(schema.permisos).values({
            value: PERMISO_ADMIN,
            rolId: rolRes!.id,
          });

          rol = await db.query.roles.findFirst({
            with: {
              permisos: true,
              company: this,
            },
            where: eq(schema.roles.id, rolId),
          });
        }

        if (!rol) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No existe el rol",
          });
        }

        // si no es admin
        if (!perms.has(PERMISO_ADMIN)) {
          // tiene que tener todos los permisos del rol que quiere asignar
          for (const permRol of rol.permisos) {
            if (!tienePermiso(perms, permRol.value as PermisosValue)) {
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "Solo se pueden asignar roles que sean iguales o inferiores a los permisos actuales",
              });
            }
          }
        }

        if (!perms.has(PERMISO_ADMIN) && typeof rol.companyId === "string") {
          const entidadPropia = entidadesPosibles.find(
            (v) => v.id === rol.companyId,
          );
          if (!entidadPropia) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message:
                "No se puede asignar rol asociado a compañía a la que no perteneces",
            });
          }
        } else if (!perms.has(PERMISO_ADMIN) && !rol.companyId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No se puede asignar rol global sin ser administrador",
          });
        }

        rolesParaAsignar.push(rol.id);

        if (rol.companyId) {
          entidadesParaAsignar.push(rol.companyId);
        }
      }

      await db.transaction(async (db) => {
        // reasigna roles
        await db
          .delete(schema.userRoles)
          .where(eq(schema.userRoles.userId, input.userId));
        for (const rolAsignarId of rolesParaAsignar) {
          await db
            .insert(schema.userRoles)
            .values({ roleId: rolAsignarId, userId: input.userId });
        }

        // reasigna entidades
        await db
          .delete(schema.usuarioEntidad)
          .where(eq(schema.usuarioEntidad.userId, input.userId));

        let isFirstAssigned = true;
        for (const entidad of entidadesParaAsignar) {
          let isSelected = false;
          if (entidadesParaAsignar.length === 1) {
            isSelected = true;
          } else if (
            entidadesParaAsignar.length > 1 &&
            !selectedEntidad &&
            isFirstAssigned
          ) {
            isSelected = true;
          } else if (entidad === selectedEntidad?.id) {
            isSelected = true;
          }

          await db.insert(schema.usuarioEntidad).values({
            entidadId: entidad,
            userId: input.userId,
            isSelected,
          });

          isFirstAssigned = false;
        }
      });

      return "ok";
    }),
  getRol: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);
      return await db.query.roles.findFirst({
        with: {
          permisos: true,
          company: this,
        },
        where: eq(schema.roles.id, input.id),
      });
    }),
  createRole: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { perms } = await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      // si no tiene el permiso de admin.
      // solo puede crear un rol en su entidad asignada
      if (!perms.has(PERMISO_ADMIN)) {
        if (input.companyId !== ctx.orgId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No se puede crear un rol fuera de entidad",
          });
        }
      }

      // if (input.companyId) {
      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.companyId),
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No existe la entidad",
        });
      }
      // }

      const [res] = await db.insert(schema.roles).values(input).returning();

      return res!;
    }),
  deleteRol: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      const rol = await db.query.roles.findFirst({
        with: {
          permisos: true,
          company: this,
        },
        where: eq(schema.roles.id, input.id),
      });

      if (!rol) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No existe el rol" });
      } else if (!rol.companyId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se pueden eliminar los roles globales",
        });
      } else if (rol.permisos.find((v) => v.value === PERMISO_ADMIN)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se pueden eliminar roles con permiso de administrador",
        });
      } else if (rol.id === ROL_ADMIN_ID) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se puede eliminar el rol de administrador",
        });
      }

      await db.delete(schema.roles).where(eq(schema.roles.id, input.id));

      return "ok";
    }),
  setRolPerms: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        permisos: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { perms } = await trpcTienePermisoCtx(ctx, PERMISO_ADMIN);

      const esAdmin = perms.has(PERMISO_ADMIN);
      const rol = await db.query.roles.findFirst({
        with: {
          permisos: true,
          company: this,
        },
        where: eq(schema.roles.id, input.id),
      });

      if (!rol) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No existe el rol" });
      } else if (!rol.companyId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se pueden editar los roles globales",
        });
      }

      const rolAsignado = await db.query.userRoles.findFirst({
        where: and(
          eq(schema.userRoles.userId, ctx.session.user.id),
          eq(schema.userRoles.roleId, rol.id),
        ),
      });

      if (rolAsignado) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se puede editar el rol asignado actualmente",
        });
      }

      const { perms: permisosEnEntidad } = await serverUserPerms(
        ctx.session.user.id,
        rol.companyId,
      );
      for (const permiso of input.permisos) {
        // casteo a objeto genérico para buscar clave y verificar que figure en la lista
        // ¯\_(ツ)_/¯
        if (!(Permisos as { [key: string]: string })[permiso]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No existe el permiso",
          });
        } else if (
          !(permisosEnEntidad as Set<string>).has(permiso) &&
          !esAdmin
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "No puede otorgar un permiso que no tiene",
          });
        } else if (permiso === PERMISO_ADMIN) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "No se puede manipular el permiso de administrador",
          });
        }
      }

      const permisosExistentes = new Set(rol.permisos.map((v) => v.value));
      if (permisosExistentes.has(PERMISO_ADMIN)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "No se puede manipular un rol con permisos de administrador",
        });
      }

      const permisosObjetivo = new Set(input.permisos);

      await db.transaction(async (db) => {
        for (const permisoExistente of permisosExistentes) {
          if (!permisosObjetivo.has(permisoExistente)) {
            await db
              .delete(schema.permisos)
              .where(
                and(
                  eq(schema.permisos.rolId, rol.id),
                  eq(schema.permisos.value, permisoExistente),
                ),
              );
          }
        }

        for (const permisoObjetivo of permisosObjetivo) {
          if (!permisosExistentes.has(permisoObjetivo)) {
            await db.insert(schema.permisos).values({
              rolId: rol.id,
              value: permisoObjetivo,
            });
          }
        }
      });

      return "ok";
    }),
});

export type UserSelf = RouterOutputs["user"]["self"];
