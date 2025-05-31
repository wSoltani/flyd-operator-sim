import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flyd Operator Sim",
  description: "Flyd Operator Sim",
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
