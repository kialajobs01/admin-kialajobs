// EditUserModal.tsx - Versão completamente atualizada
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, usersService } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(50),
  phone: z.string().min(9, 'Telefone inválido').max(15),
  email: z.string().email('Email inválido'),
  role: z.enum(['WORKER', 'CLIENT', 'ADMIN', 'SUPER_ADMIN']),
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
  verified: z.boolean(),
  isDeleted: z.boolean(),
});

interface EditUserModalProps {
  user: User;
  currentUserRole: 'WORKER' | 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
}

export function EditUserModal({ user, currentUserRole }: EditUserModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone || '',
      role: user.role as "WORKER" | "CLIENT" | "ADMIN" | "SUPER_ADMIN",
      isBlocked: user.isBlocked,
      email: user.email || "",
      blockReason: user.blockReason || '',
      verified: user.verified,
      isDeleted: user.isDeleted,
    },
  });

  const isBlocked = form.watch('isBlocked');
  const isDeleted = form.watch('isDeleted');
  const verified = form.watch('verified');

  const handleQuickAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'block':
          await usersService.blockUser(user.id, data?.reason);
          toast.success('Usuário bloqueado com sucesso!');
          break;
        case 'unblock':
          await usersService.unblockUser(user.id);
          toast.success('Usuário desbloqueado com sucesso!');
          break;
        case 'verify':
          await usersService.verifyUser(user.id);
          toast.success('Usuário verificado com sucesso!');
          break;
        case 'unverify':
          await usersService.unverifyUser(user.id);
          toast.success('Verificação removida com sucesso!');
          break;
        case 'delete':
          await usersService.deleteUser(user.id);
          toast.success('Usuário eliminado com sucesso!');
          break;
        case 'recover':
          await usersService.recoverUser(user.id);
          toast.success('Usuário recuperado com sucesso!');
          break;
      }
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`Erro ao ${action} usuário`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (currentUserRole === 'CLIENT' && values.role === 'ADMIN') {
        toast.error('Clientes não podem promover usuários a Administradores');
        return;
      }

      if (currentUserRole === 'CLIENT' && values.role === 'SUPER_ADMIN') {
        toast.error('Clientes não podem promover usuários a Super Administradores');
        return;
      }

      const updateData = {
        ...values,
        blockedAt: values.isBlocked && !user.isBlocked ? new Date().toISOString() : user.blockedAt,
        blockReason: values.isBlocked ? values.blockReason : '', 
      };

      await usersService.updateUser(user.id, updateData);
      
      toast.success(
        values.isBlocked !== user.isBlocked
          ? values.isBlocked 
            ? 'Usuário bloqueado com sucesso!' 
            : 'Usuário desbloqueado com sucesso!'
          : 'Usuário atualizado com sucesso!'
      );

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = () => {
    if (isDeleted) {
      return <Badge variant="destructive">Eliminado</Badge>;
    }
    if (isBlocked) {
      return <Badge variant="secondary">Bloqueado</Badge>;
    }
    if (verified) {
      return <Badge className="bg-green-500 hover:bg-green-600">Verificado</Badge>;
    }
    return <Badge variant="outline">Ativo</Badge>;
  };

  const getDialogTitle = () => {
    if (isDeleted) return `Usuário Eliminado - ${user.name}`;
    if (isBlocked) return `Usuário Bloqueado - ${user.name}`;
    if (verified) return `Usuário Verificado - ${user.name}`;
    return `Editar Usuário - ${user.name}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isDeleted ? 'Visualizar' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDialogTitle()}
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {!isDeleted && !isBlocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reason = prompt('Motivo do bloqueio:');
                if (reason !== null) handleQuickAction('block', { reason });
              }}
              disabled={isLoading}
            >
              Bloquear
            </Button>
          )}
          
          {isBlocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('unblock')}
              disabled={isLoading}
            >
              Desbloquear
            </Button>
          )}
          
          {!verified && !isDeleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('verify')}
              disabled={isLoading}
            >
              Verificar
            </Button>
          )}
          
          {verified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('unverify')}
              disabled={isLoading}
            >
              Remover Verificação
            </Button>
          )}
          
          {!isDeleted && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja eliminar este usuário?')) {
                  handleQuickAction('delete');
                }
              }}
              disabled={isLoading}
            >
              Eliminar
            </Button>
          )}
          
          {isDeleted && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleQuickAction('recover')}
              disabled={isLoading}
            >
              Recuperar
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} disabled={isDeleted} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} disabled={isDeleted} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone" {...field} disabled={isDeleted} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isDeleted || (currentUserRole === 'ADMIN' && (field.value === 'ADMIN' || field.value === 'SUPER_ADMIN'))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WORKER">Trabalhador</SelectItem>
                      <SelectItem value="CLIENT">Cliente</SelectItem>
                      {currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN' ? (
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      ) : null}
                      {currentUserRole === 'SUPER_ADMIN' ? (
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isDeleted && (
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Atualizando...' : 'Atualizar Usuário'}
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}