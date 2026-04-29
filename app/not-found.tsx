"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-300" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Página não encontrada
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Parece que a página que procuras não existe ou foi movida.  
          Verifica o link ou volta à página inicial.
        </p>

        <Link href="/" passHref>
          <Button className="flex items-center gap-2 mt-4">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </Link>
      </div>

      <footer className="mt-12 text-sm text-gray-500 dark:text-gray-600">
        &copy; {new Date().getFullYear()} — Kiala Jobs | Todos os direitos reservados.
      </footer>
    </div>
  );
}
