import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import AuthGuard from "./components/AuthGuard";
import { StoreProvider } from "./store/StoreContext";
import { ThemeProvider } from "./store/ThemeContext";

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
    <html lang="en" className={`${hanken.variable} ${jetbrains.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('vk_theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}})();` }} />
      </head>
      <body className="h-screen flex flex-col overflow-hidden">
        <ThemeProvider>
          <StoreProvider>
            <AuthGuard>
              <main className="flex-1 overflow-y-auto vk-scroll pb-16">
                {children}
              </main>
              <BottomNav />
            </AuthGuard>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
