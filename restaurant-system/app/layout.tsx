import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 👇 เพิ่มบรรทัดนี้
import { CartProvider } from "@/src/backend/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grandma Restaurant",
  description: "Restaurant ordering system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* ✅ ครอบทั้งแอป */}
        <CartProvider>
          <main className="flex-1">
            {children}
          </main>
        </CartProvider>

      </body>
    </html>
  );
}