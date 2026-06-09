import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import { StoreProvider } from "./store/StoreContext";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vokrub",
  description: "Your personal vocabulary trainer",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hanken.variable} ${jetbrains.variable} h-full`}>
      <body className="h-screen flex flex-col overflow-hidden">
        <StoreProvider>
          <main className="flex-1 overflow-y-auto vk-scroll pb-16">
            {children}
          </main>
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
