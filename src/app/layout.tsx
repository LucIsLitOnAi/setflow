import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MosaicReveal - KI-Kachel-Mosaik",
  description: "Erstelle KI-gestützte Kachel-Mosaike als Last-Minute-Geschenke.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
