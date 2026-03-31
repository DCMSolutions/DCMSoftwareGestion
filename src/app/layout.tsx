import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import ErrorBoundary from "~/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Bagdrop",
  description: "Sistema de reserva de lockers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCReactProvider cookies={cookies().toString()}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </TRPCReactProvider>
  );
}
