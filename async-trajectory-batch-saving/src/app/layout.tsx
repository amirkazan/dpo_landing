import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// У Space Grotesk нет кириллического subset — латиница/цифры через google,
// кириллица в display-заголовках падает на локальный Manrope (см. globals.css).
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const displayCyrillic = localFont({
  src: "../../public/fonts/manrope-200800-cyrillic.woff2",
  variable: "--font-manrope",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Современные подходы к разработке систем ДЗЗ и космической связи — МФТИ",
  description:
    "Программа дополнительного профессионального образования ФАКТ МФТИ: орбитальная динамика, проектирование космических систем, имитационное моделирование в ПК «Интеграл» и защита собственного аванпроекта.",
  icons: { icon: "/assets/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${displayCyrillic.variable} ${mono.variable}`}>
      <body className="noise min-h-screen antialiased">
        <Script src="/links.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
