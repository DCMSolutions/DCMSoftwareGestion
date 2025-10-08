"use client"

import { useEffect } from "react"

export function PageRefresh() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      location.reload()
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return <html lang={"es"}>
    <head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
      <meta name="theme-color" content="#5b9a8b" />
      <title>Iguazú Lockers | Espere...</title>
      <meta name="robots" content="max-image-preview:large" />
      <link rel="canonical" href="https://iguazulockers.com/" />

      <meta property="og:site_name" content="Bagdrop | Pago" />
      <meta property="og:title" content="Pago" />
      <meta property="og:url" content="https://iguazulockers.com/" />
      <meta property="og:type" content="website" />
      <link rel="profile" href="https://gmpg.org/xfn/11" />
    </head>
    <body className={`font-sans bg-lockersUrbanos`}>
      <main>
        <div className="w-[100vw] h-[100vh] flex items-center justify-center">
          <p>Espere...</p>
        </div>
      </main>
    </body>
  </html>;
}