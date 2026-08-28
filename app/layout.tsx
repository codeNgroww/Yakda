import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
