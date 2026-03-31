import { TRPCReactProvider } from "~/trpc/react";
import { cookies } from "next/headers";
import { getServerAuthSession } from "~/server/auth";
import LayoutContainer from "~/components/layout-container";

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  return (
    <html lang="es">
      <body>
        <div className="mb-10 flex justify-center">
          <TRPCReactProvider cookies={cookies().toString()}>
            <LayoutContainer>{props.children}</LayoutContainer>
          </TRPCReactProvider>
        </div>
        <div></div>
      </body>
    </html>
  );
}
