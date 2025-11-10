import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/toaster";
import { RouteTransition } from "@/components/layout/route-transition";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  preload: true,
});

export const metadata: Metadata = {
  icons: {
    // Use absolute paths so nested routes resolve the favicon correctly
    icon: "/333.png",
    apple: "/333.png",
    shortcut: "/333.png",
  },
  title: "333EXPRESS",
  description: "Modern delivery management platform",
  charset: "utf-8",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${interSans.className} bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            <RouteTransition>{children}</RouteTransition>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
