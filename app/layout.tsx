import React, { Suspense } from "react";

/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-css-tags */
import { Metadata, Viewport } from "next";
import { Providers } from "./Providers";
import ClientNavigation from "./ClientNavigation";

const APP_TITLE = "Gwak Minji";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="//cloud.typography.com/6794156/6837792/css/fonts.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense>
          <Providers>
            <Suspense>
              <ClientNavigation />
            </Suspense>
            <Suspense>{children}</Suspense>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
};

export const metadata: Metadata = {
  metadataBase: new URL("https://meenj04.com"),
  title: {
    template: `%s | ${APP_TITLE}`,
    default: APP_TITLE,
  },
  description: "Gwak Minji - Fine Art · Fashion Design",
  keywords: [
    "Gwak Minji",
    "곽민지",
    "meenj04",
    "Fine Art",
    "Fashion Design",
    "성균관대학교",
    "미술",
    "의상",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Gwak Minji",
    siteName: "Gwak Minji",
    description: "Gwak Minji - Fine Art · Fashion Design",
    url: "https://meenj04.com",
    images: "https://meenj04.com/og.png",
  },
};

export const viewport: Viewport = {
  themeColor: "white",
  width: "device-width",
  initialScale: 1,
};

export default RootLayout;
