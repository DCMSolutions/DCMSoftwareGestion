import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { RouterOutputs } from "~/trpc/shared";
import { clerkClient } from "@clerk/nextjs/server";

export const clerkRouter = createTRPCRouter({
  getOrganizations: publicProcedure.query(async ({ input }) => {
    const res = clerkClient.organizations.getOrganizationList();
    return res;
  }),
  assignRole: publicProcedure
    .input(
      z.object({
        userId: z.string().min(0).max(1023),
        role: z.string().min(0).max(1023),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = clerkClient.users.updateUser(input.userId, {
        publicMetadata: { role: input.role },
      });
      return { res };
    }),
  editUser: publicProcedure
    .input(
      z.object({
        userId: z.string().min(0).max(1023),
        // role: z.string().min(0).max(1023),
        firstName: z.string().min(0).max(1023).optional().nullable(),
        lastName: z.string().min(0).max(1023).optional().nullable(),
        username: z.string().min(0).max(1023).optional().nullable(),
        organizationId: z.string().min(0).max(1023).optional().nullable(),
        //
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const organization = await clerkClient.organizations.getOrganization({
          organizationId: input.organizationId!,
        });
        //null con string porque value en front no puede ser null

        const response =
          await clerkClient.organizations.createOrganizationMembership({
            organizationId: input.organizationId!,
            userId: input.userId!,
            role: "org:member",
          });
      } catch (e) {
        console.log("error", e);
      }
      const res = clerkClient.users.updateUser(input.userId, {
        // publicMetadata: { role: input.role },
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        // username: input.username ?? undefined,
      });
      return { res };
    }),

  removeUserFromOrganization: publicProcedure
    .input(
      z.object({
        userId: z.string().min(0).max(1023),
        organizationId: z.string().min(0).max(1023).optional().nullable(),
        //
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const res =
          await clerkClient.organizations.deleteOrganizationMembership({
            organizationId: input.organizationId!,
            userId: input.userId!,
          });
        return { res };
      } catch (e) {
        console.log("error", e);
        return e;
      }
    }),
});

export type City = RouterOutputs["city"]["get"][number];
