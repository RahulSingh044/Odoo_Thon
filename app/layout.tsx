import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import AuthProvider from "@/context/authContext";
import OdooNavbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odoo Portal",
  description: "Enterprise Employee Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F0F0F] text-white min-h-screen relative overflow-x-hidden`}
      >

        <AuthProvider>
          {/* Navbar and Content wrapper */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <OdooNavbar />
            <main className="flex-grow">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}