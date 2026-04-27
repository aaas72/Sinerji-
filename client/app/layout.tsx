import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";
import "./globals.css";

import { ToastProvider } from "@/context/ToastContext";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sinerji - Çalışarak Yeteneklerini Kanıtla",
  description: "Öğrenciler ve şirketler için yetenek tabanlı görev ve staj platformu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" dir="ltr">
      <body className={`${inter.variable} ${poppins.variable} font-body text-text`}>
        <ToastProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
