import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoTalk - AI English Practice",
  description: "EchoTalk AI-powered English speaking practice system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
