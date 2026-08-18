import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Playfair_Display, Instrument_Serif, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
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

        {/* Floating WhatsApp CTA Button */}
        <a
          href="https://wa.me/919544636566"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[9990] flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] hover:scale-108 transition-all duration-300 group"
          aria-label="Chat on WhatsApp"
        >
          <svg
            className="w-7 h-7 fill-current transition-transform duration-300 group-hover:rotate-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.903-6.99-1.872-1.873-4.354-2.902-6.993-2.904-5.442 0-9.868 4.425-9.873 9.869-.001 1.748.461 3.454 1.336 4.966l-.99 3.614 3.701-.971zm10.74-5.46c-.302-.151-1.785-.882-2.057-.981-.273-.099-.472-.148-.671.151-.197.3-.765.981-.937 1.181-.173.199-.346.223-.648.072-1.077-.54-1.85-.935-2.585-2.193-.195-.336.195-.312.558-1.037.06-.12.03-.226-.015-.317-.045-.091-.472-1.137-.648-1.558-.171-.411-.344-.356-.472-.363-.121-.006-.26-.008-.4-.008s-.368.053-.56.26c-.192.206-.733.717-.733 1.748 0 1.03.75 2.023.854 2.164.104.141 1.477 2.256 3.578 3.163.499.215.888.344 1.192.44.502.159.96.137 1.321.083.402-.061 1.785-.73 2.037-1.437.253-.707.253-1.314.177-1.437-.076-.123-.273-.199-.575-.35z" />
          </svg>
        </a>
        <Toaster />
      </body>
    </html>
  );
}
