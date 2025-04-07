import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | DIU ACM",
    default: "DIU ACM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <NextTopLoader showSpinner={false} />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          scriptProps={{ "data-cfasync": "false" }}
        >
          <SessionProvider>
            {/* Background elements */}
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950" />
              <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/40 dark:bg-blue-900/20" />
              <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-cyan-200/50 dark:bg-cyan-800/20" />
              <div className="absolute bottom-0 right-0 h-40 w-52 rounded-full bg-violet-200/40 dark:bg-violet-900/20" />
            </div>

            {children}
            <Toaster richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
