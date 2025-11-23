import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panchang App",
  description: "Daily Muhurats and Almanac",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
