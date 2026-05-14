import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JHT Product Database",
  description: "Internal Product Database backend for fitness equipment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
