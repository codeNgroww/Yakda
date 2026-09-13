import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Toast from "@/components/Toast";
import Script from "next/script";

const firaSans = Fira_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-sans",
});

export const metadata: Metadata = {
  title: "Yakda - Best-In-Class Stationery & Office Supplies",
  description:
    "Yakda Dubai - Leading supplier of office stationery, furniture, paper, and printers in UAE with fast next day delivery.",
  keywords: [
    "stationery dubai",
    "office supplies uae",
    "paper reams dubai",
    "office chairs uae",
    "printers dubai",
    "yakda stationery",
  ],
  authors: [{ name: "Yakda UAE" }],
  metadataBase: new URL("https://yakda.ae"),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Yakda - Best-In-Class Stationery & Office Supplies",
    description:
      "Leading supplier of office stationery, furniture, paper, and printers in the UAE.",
    url: "https://yakda.ae",
    siteName: "Yakda",
    images: [
      {
        url: "/images/hero-desk.png",
        width: 1200,
        height: 630,
        alt: "Yakda Office Supplies",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Yakda - Best-In-Class Stationery & Office Supplies",
    description: "Leading supplier of office stationery, furniture, paper, and printers in UAE.",
    images: ['/images/hero-desk.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://yakda.ae/#organization',
      name: 'Yakda UAE',
      url: 'https://yakda.ae',
      logo: 'https://yakda.ae/images/hero-desk.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+971-4-0000000',
        contactType: 'customer service',
        areaServed: 'AE',
        availableLanguage: ['en', 'ar']
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://yakda.ae/#website',
      url: 'https://yakda.ae',
      name: 'Yakda',
      publisher: {
        '@id': 'https://yakda.ae/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://yakda.ae/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaSans.variable}`}>
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WH2276B2');
          `
        }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-surface text-on-surface antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
        <noscript
          dangerouslySetInnerHTML={{
            __html: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WH2276B2"
height="0" width="0" style="display:none;visibility:hidden"><' + '/iframe>',
          }}
        />
        <CartProvider>
          {children}
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
