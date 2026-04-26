import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAGROM SARLU",
  description: "Plateforme integree de gestion des formations, apprenants, prestations et finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
