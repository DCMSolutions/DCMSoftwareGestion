import { api } from "~/trpc/server";
import HomePage from "./_components/home_page";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function Home() {
  const cities = await api.city.get.query();
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssea7d571dd89fe9da21174cbb4f8e8c2b5d4c0d3bf2d2700b0602d3f59a9ab.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css316f7beff26e5e9e083d3013ca65ac41be48e6cacd53acb03134c4b608124.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css250a0088c27c2070e06627fb0394ae7866147bc9836b90f8093d437d0d39b.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css9c3ee6bdc973a8d139b0cc67e5be5b29c6bccad6e60c7987f61e252f44209.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssd8b663a49fba10b59210b05e260696f256170db68210cbceb982273cd2419.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssb43f07a0951c25a8e6cfb9fade1025fd0054e420fcb073e7b2c14043e7a7a.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css78f640a4177916ebc98b3fa02b6e409b093286d6b41692ca1551ec83c795b.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css8d8fbfb81c00193ae49b66acb5f2ea68aae2dea2da4a08f80f9b706fa4c6c.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css7e6af7f20afc90f9937b2e12d7806a28286816faf8286b6bbb827658eacf3.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-csseba3cfa6b4e3d0225ae568555b7957a5c64f7ee5af65d28cb87cb1a173b27.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssb7f01fc8f93a1e269a812eed4fcd316ddd57b35ec382e6cc71b7b37363ee5.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssabf79fd976863fe66891dececeed31adece115731c30775272b0d54597744.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css488a286eaed46c6232365922be0922a980c748b20b862b95c3c064a2c663e.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-csscb383fec916c1e9eaf29d79d3440070e239dc7593b3528b9b48fea9e77c58.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css05113462042a2ce11d9dcf46a1a6578e0a9bc90192b340ae1344a1297a335.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssdbd0e881967579bea5edda08870563675c2ddad89d0ff4b67b354057cec9b.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css07720154cac77560a902c8ee87801a05953d8da7ded749f96f08935421391.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css2d31fbef590b999bfc118c0576cbfee87fbf3ac71c5416c2dee097a550d0e.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css0a3d2756b992dfa589f1ac893e83af2dd6777bc3806aecb3b559615a0ce24.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css69d0acce6b952354faf3f876c05475709b60ce8c90dde3b3e125b2a8b87f3.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css02fe7e21a83dd0b52892da6f75f6fea0a6d47bc2938d87b95765b59dc74b3.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css00184181777e76c46ab4d0c60065863a2236de4d783d2b6ca6fac0e879084.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css8b0bd44a4639157766c40b4fcf6c23e2c530a8f0e7c397060a78ddd81dbb3.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css53b78e62ec26c3c527f0826a042003e5d9aa9b500eec42801c1738728f54e.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-csse535fa11c127a6213624ee2aa192a1290a65b000b7ae6c9f634efb7468baa.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css94c38d866bfd104158e753a6e63e4a756a54c5f901c7a05e7d6617ef6e9a6.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css040396869d20b48c7afb12b8f0540983d8264c22de82702aedd9633bac2a8.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css706c872670b3efc39f24526c789341aad592c9cf3cb00a6991746c23ac0f5.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css59bc2ed1dec5950541aaef3a7de8aa714efa8170d49dca23f31ba52db5cb8.css"
          as="style"
          media="all"
        />
        <link
          rel="preload"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css25ff672b1ea64c35db64086a6ec4a39f275340d7940878a6c7ddc2aa17b2f.css"
          as="style"
          media="all"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <meta name="theme-color" content="#5b9a8b" />
        <title>Bagdrop</title>
        <meta name="robots" content="max-image-preview:large" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Bagdrop » Feed"
          href="https://bagdrop.com.ar/feed/"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Bagdrop » Feed de los comentarios"
          href="https://bagdrop.com.ar/comments/feed/"
        />
        <link rel="canonical" href="https://bagdrop.com.ar/" />

        <meta property="og:site_name" content="Bagdrop" />
        <meta property="og:title" content="Home" />
        <meta property="og:url" content="https://bagdrop.com.ar/" />
        <meta property="og:type" content="website" />
        <link rel="profile" href="https://gmpg.org/xfn/11" />
        <link
          rel="stylesheet"
          id="wp-block-library-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css80bf02ea0d3cc2e14eca831ca5f32821a29278641889a430f1a0b842b8b15.css"
          type="text/css"
          media="all"
        />

        <link
          rel="stylesheet"
          id="contact-form-7-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssea7d571dd89fe9da21174cbb4f8e8c2b5d4c0d3bf2d2700b0602d3f59a9ab.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-font-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css316f7beff26e5e9e083d3013ca65ac41be48e6cacd53acb03134c4b608124.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-awesome-fonts-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css250a0088c27c2070e06627fb0394ae7866147bc9836b90f8093d437d0d39b.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-awesome-fonts-back-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css9c3ee6bdc973a8d139b0cc67e5be5b29c6bccad6e60c7987f61e252f44209.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-fontello-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssd8b663a49fba10b59210b05e260696f256170db68210cbceb982273cd2419.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="joinchat-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssb43f07a0951c25a8e6cfb9fade1025fd0054e420fcb073e7b2c14043e7a7a.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="js_composer_front-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css78f640a4177916ebc98b3fa02b6e409b093286d6b41692ca1551ec83c795b.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="dt-web-fonts-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css8d8fbfb81c00193ae49b66acb5f2ea68aae2dea2da4a08f80f9b706fa4c6c.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="dt-main-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css7e6af7f20afc90f9937b2e12d7806a28286816faf8286b6bbb827658eacf3.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-custom-scrollbar-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-csseba3cfa6b4e3d0225ae568555b7957a5c64f7ee5af65d28cb87cb1a173b27.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-wpbakery-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssb7f01fc8f93a1e269a812eed4fcd316ddd57b35ec382e6cc71b7b37363ee5.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-css-vars-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssabf79fd976863fe66891dececeed31adece115731c30775272b0d54597744.css"
          type="text/css"
          media="all"
        />

        <link
          rel="stylesheet"
          id="dt-custom-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css488a286eaed46c6232365922be0922a980c748b20b862b95c3c064a2c663e.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="dt-media-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-csscb383fec916c1e9eaf29d79d3440070e239dc7593b3528b9b48fea9e77c58.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-mega-menu-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css05113462042a2ce11d9dcf46a1a6578e0a9bc90192b340ae1344a1297a335.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="the7-elements-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-cssdbd0e881967579bea5edda08870563675c2ddad89d0ff4b67b354057cec9b.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="style-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css07720154cac77560a902c8ee87801a05953d8da7ded749f96f08935421391.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="ultimate-vc-addons-google-fonts-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css2d31fbef590b999bfc118c0576cbfee87fbf3ac71c5416c2dee097a550d0e.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="ultimate-vc-addons-style-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css0a3d2756b992dfa589f1ac893e83af2dd6777bc3806aecb3b559615a0ce24.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="ultimate-vc-addons-animate-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css69d0acce6b952354faf3f876c05475709b60ce8c90dde3b3e125b2a8b87f3.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="ultimate-vc-addons-tooltip-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css02fe7e21a83dd0b52892da6f75f6fea0a6d47bc2938d87b95765b59dc74b3.css"
          type="text/css"
          media="all"
        />
        <link
          rel="stylesheet"
          id="ultimate-vc-addons-headings-style-css"
          href="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/1702657728-css00184181777e76c46ab4d0c60065863a2236de4d783d2b6ca6fac0e879084.css"
          type="text/css"
          media="all"
        />
        <script
          type="text/javascript"
          src="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/jquery.min.js.descarga"
          id="jquery-core-js"
        ></script>
        <script
          type="text/javascript"
          src="./Lockers Urbanos _ Guarda equipajes en Bariloche – Una solución inteligente para el guardado de equipaje_files/jquery-migrate.min.js.descarga"
          id="jquery-migrate-js"
        ></script>
      </head>
      <body className={`font-sans ${inter.variable} bg-lockersUrbanos`}>
        <main>
          <NextIntlClientProvider>
            <div>
              <HomePage
                lang={locale}
                cities={cities}
              />
            </div>
          </NextIntlClientProvider>
        </main>
      </body>
    </html>
  );
}
