import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeCustomizerProvider } from "@/components/shared/theme-customizer-context";
import { ThemeCustomizerFAB } from "@/components/shared/theme-customizer-fab";

// Premium Sans-Serif Font for Body (Extremely clean & readable)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Modern Geometric Sans-Serif for Headings (Premium look)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigitalERP | Professional ERP Solution",
  description: "A modern, scalable Enterprise Resource Planning frontend built with Next.js and shadcn/ui.",
  keywords: ["ERP", "Dashboard", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Antigravity AI" }],
};

import { PermissionProvider } from "@/components/shared/permission-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeCustomizerProvider>
            <PermissionProvider>
              {children}
              <ThemeCustomizerFAB />
            </PermissionProvider>
          </ThemeCustomizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
