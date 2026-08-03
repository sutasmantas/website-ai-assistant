import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Switchback Cycle Co. Help Demo",
  description: "A functional website-assistant integration demo.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
