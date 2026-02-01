import type { Metadata } from "next";
import "./globals.css";
import QuickAdd from "@/components/QuickAdd";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Your personal command center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0d1117]">
        {children}
        <QuickAdd />
      </body>
    </html>
  );
}
