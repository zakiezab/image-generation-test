import type { Metadata } from "next";
import { Libre_Franklin, Metrophobic } from "next/font/google";
import { HeaderNav } from "@/components/header-nav";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const metrophobic = Metrophobic({
  variable: "--font-metrophobic",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mobiz | AI Hero Visual & Storyline Studio",
  description:
    "Strategy, Executed. Generate AI hero visuals and scene-by-scene storylines with brand-compliant design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${libreFranklin.variable} ${metrophobic.variable} font-sans antialiased`}>
        <HeaderNav />
        {children}
      </body>
    </html>
  );
}
