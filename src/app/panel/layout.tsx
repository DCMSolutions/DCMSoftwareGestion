import { TRPCReactProvider } from "~/trpc/react";
import { cookies } from "next/headers";
import AppLayout from "~/components/applayout";
import AppSidenav from "~/components/app-sidenav";
import { Toaster } from "sonner";
import LayoutContainer from "~/components/layout-container";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { PermsProvider } from "~/components/perms-provider";
import { api } from "~/trpc/server";

export default async function RootLayout(props: { children: React.ReactNode }) {
  const _ = await api.user.selfEntidadAutoasignada.query();
  return (
    <ClerkProvider>
      <PermsProvider>
        <html lang="en">
          <body>
            <main>
              <AppLayout
                title={<h1>DCM Solution</h1>}
                sidenav={<AppSidenav />}
              >
                <div className="mb-10 flex justify-center">
                  <TRPCReactProvider cookies={cookies().toString()}>
                    <Toaster />
                    <LayoutContainer>{props.children}</LayoutContainer>
                  </TRPCReactProvider>
                </div>
                <div></div>
              </AppLayout>
            </main>
          </body>
        </html>
      </PermsProvider>
    </ClerkProvider>
  );
}
