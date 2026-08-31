import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fidback | La plateforme togolaise de feedbacks produits qualitatifs",
  description: "Fidback permet aux entreprises togolaises (startups, restaurants, services) de collecter des retours d'expérience qualitatifs de leurs abonnés sans notation artificielle.",
  keywords: ["Fidback", "Togo", "Feedback client", "Lomé", "Produit", "Expérience utilisateur", "Startups Togo"],
  openGraph: {
    title: "Fidback - Retours d'expérience qualitatifs pour entreprises togolaises",
    description: "Écoutez véritablement vos clients. Sans étoiles, 100% qualitatif, axé sur l'amélioration continue.",
    type: "website",
    locale: "fr_TG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}

