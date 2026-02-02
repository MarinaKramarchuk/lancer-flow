import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LancerFlow | Smart Finance Tracker for Freelancers",
  description: "Take control of your freelance income. Track earnings, manage platform fees, and get detailed financial insights in one powerful dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${inter.className}`} suppressHydrationWarning
      >
            <ClerkProvider>
        {/* header */}
        <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>
        {/* footer */}
        <footer className="bg-white py-12 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Brand Side */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#0A192F] tracking-tighter uppercase">
                  Lancer<span className="text-blue-900">Flow</span>
                </span>
              </div>
              
              {/* Copyright Side */}
              <div className="text-slate-400 text-sm font-light">
                <p>© {new Date().getFullYear()} LancerFlow. Built for professionals.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
                Financial Intelligence for Modern Freelancers
              </p>
            </div>
          </div>
        </footer>
          </ClerkProvider>
      </body>
      </html>
  );
}
