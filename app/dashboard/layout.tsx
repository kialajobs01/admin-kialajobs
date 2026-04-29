import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Kiala Jobs | Painel Administrativo",
  description: "Painel de administração para gerenciamento da plataforma Kiala Jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block sticky top-0 h-screen z-40">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}