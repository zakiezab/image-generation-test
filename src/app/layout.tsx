import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Hero Visual Generator | Brand-Compliant Image Creator",
  description:
    "Generate AI hero backgrounds, add your logo and text, and export production-ready 1080×1080 PNG images.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${libreFranklin.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
