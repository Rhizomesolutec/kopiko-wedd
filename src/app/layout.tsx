import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Playfair_Display, Instrument_Serif, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const newyork = localFont({
  src: "../newyork/NewYork PERSONAL USE.otf",
  variable: "--font-newyork",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kopiko-weddings.com"),
  title: "KOPIKO | Luxury Wedding Photography & Cinematic Films",
  description: "World-class editorial wedding photography & cinematic films. Documenting timeless love stories across global luxury destinations with an Apple-grade visual experience.",
  keywords: ["Luxury Wedding Photography", "Editorial Wedding Photographer", "Destination Wedding Films", "Fine Art Photography", "Kopiko Weddings"],
  authors: [{ name: "Kopiko Wedding Studios" }],
  openGraph: {
    title: "KOPIKO | Luxury Wedding Photography & Cinematic Films",
    description: "Every love story deserves timeless, emotional, fine-art cinema and photography.",
    url: "https://kopiko-weddings.com",
    siteName: "Kopiko Luxury Wedding Photography",
    images: [
      {
        url: "/showcase/hero.jpeg",
        width: 1920,
        height: 1080,
        alt: "Kopiko Wedding Photography Showcase",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOPIKO | Luxury Wedding Photography",
    description: "Every love story deserves timeless memories.",
    images: ["/showcase/hero.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newyork.variable} ${cormorant.variable} ${playfair.variable} ${instrument.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 bg-grain selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
