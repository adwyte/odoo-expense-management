// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackOn"
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* hard-lock to light in case something persisted a `dark` class */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
            `,
          }}
        />
        <header className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-white">
          <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            <span className="text-blue-600">Track</span>On
          </span>
          

          {/* Theme toggle removed */}
        </header>

        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
