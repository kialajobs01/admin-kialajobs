'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export default function LoginPage() {
  const { login, isLoading, error, checkAuth } = useAuthStore();
  const router = useRouter();
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await login(values.email, values.password);

      if (response?.status === "success") {  
      } else if (error?.includes('Acesso negado')) {
        setShowRedirectMessage(true);

        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              window.location.href = 'https://www.kialajobs.com';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
      }
    } catch (error) {
      console.error('❌ Login submission error:', error);
    }
  };

  useEffect(() => {
    if (!error?.includes('Acesso negado')) {
      setShowRedirectMessage(false);
      setCountdown(3);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen dark:from-gray-900 dark:to-blue-950">
      <Card className="w-full max-w-md bg-transparent ">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-base">
              Acesso restrito à equipe administrativa
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {showRedirectMessage && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="space-y-2">
                  <p className="font-medium">Acesso restrito a administradores</p>
                  <p className="text-sm">
                    Você será redirecionado para o site principal em{' '}
                    <span className="font-bold">{countdown}</span> segundos...
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@kialajobs.com"
                        {...field}
                        className="h-11"
                        disabled={showRedirectMessage}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••"
                        {...field}
                        className="h-11"
                        disabled={showRedirectMessage}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && !showRedirectMessage && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading || showRedirectMessage}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : showRedirectMessage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecionando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Acessar Painel
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {showRedirectMessage && (
            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-primary"
                onClick={() => window.location.href = 'https://www.kialajobs.com'}
              >
                Clique aqui se o redirecionamento não funcionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
