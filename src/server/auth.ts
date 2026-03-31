import { auth, currentUser } from "@clerk/nextjs/server";

// https://clerk.com/docs/organizations/verify-user-permissions
export const getServerAuthSession = () => {
  const { userId, ...session } = auth();

  if (!userId) {
    return null;
  }

  return {
    ...session,
    user: {
      id: userId,
    },
  };
};

export const getServerAuthUser = () => {
  return currentUser();
};
