import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import HeaderComponent from "./components/Header.component";
import FooterComponent from "./components/Footer.component";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MatchChat",
  description: "Chat with random people around the world anonymously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HeaderComponent />
        <main>
          {children}
        </main>
        <FooterComponent />
      </body>
    </html>
  );
}
