import { TRPCReactProvider } from "~/trpc/react";
import { cookies } from "next/headers";
import AppLayout from "~/components/applayout";
import { getServerAuthSession } from "~/server/auth";
import AppSidenav from "~/components/app-sidenav";
import AuthProvider from "~/components/auth-provider";
import { Toaster } from "sonner";
import LayoutContainer from "~/components/layout-container";

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="mb-10 flex justify-center">
            <TRPCReactProvider cookies={cookies().toString()}>
              <LayoutContainer>{props.children}</LayoutContainer>
            </TRPCReactProvider>
          </div>
          <div></div>
        </AuthProvider>
      </body>
    </html>
  );
}
