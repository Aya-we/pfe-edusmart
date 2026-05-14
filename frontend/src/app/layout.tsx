import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EduSmart | Système de Gestion Scolaire Moderne",
  description: "La plateforme SaaS pour l'excellence éducative au Maroc. Gestion des notes, absences, et communication en temps réel.",
  keywords: ["EduSmart", "SaaS scolaire", "Maroc", "PRONOTE", "gestion école", "éducation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
