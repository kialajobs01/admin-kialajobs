"use client"

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreVertical, Mail, Phone, Shield, Lock, Unlock, Trash2, Edit, User as UserIcon } from "lucide-react";
import { User } from '@/types/user';
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users`);
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.users.length);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error(
          "Erro",
          {
            description: "Não foi possível carregar os usuários",
          },
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && !user.isBlocked) ||
      (statusFilter === 'blocked' && user.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlocked: user.isBlocked,
    });
    setIsOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'WORKER':
        return 'secondary';
      case 'CLIENT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * usersPerPage < filteredUsers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEditUser = async () => {
    try {
      if (!selectedUser) return;

      await api.put(`/users/${selectedUser.id}`, editForm);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
      toast.success(
        "Sucesso",
        {
          description: "Usuário atualizado com sucesso",
        });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(
        "Erro",
        {
          description: "Não foi possível atualizar o usuário",
        });
    }
  };

  const handleBlockUser = async (block: boolean) => {
    try {
      if (!selectedUser) return;

      await api.patch(`/users/${selectedUser.id}/status`, { isBlocked: block });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBlocked: block } : u));
      toast.success(
        block ? "Usuário bloqueado" : "Usuário desbloqueado",
        {
          description: `O usuário foi ${block ? 'bloqueado' : 'desbloqueado'} com sucesso`,
        });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error(
        "Erro",
        {
          description: `Não foi possível ${block ? 'bloquear' : 'desbloquear'} o usuário`,
        });
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;

      await api.delete(`/account/admin/users/${selectedUser.id}`);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success(
        "Usuário removido",
        {
          description: "O usuário foi removido com sucesso",
        });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast.error(
        "Erro",
        {
          description: "Não foi possível remover o usuário",
        });
    }
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Carregando usuários...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="px-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Todos os usuários registrados no sistema</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Pesquisar usuários..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      {roleFilter ? roleFilter : 'Função'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('ADMIN')}>
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('WORKER')}>
                      Trabalhador
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('CLIENT')}>
                      Cliente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      {statusFilter === 'active' ? 'Ativos' : statusFilter === 'blocked' ? 'Bloqueados' : 'Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      Ativos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('blocked')}>
                      Bloqueados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[200px]">Usuário</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Função</TableHead>
                  <TableHead className="hidden md:table-cell">Registrado em</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-accent/50 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar ?? undefined} />
                            <AvatarFallback>
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {user.phone || 'Sem telefone'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                          {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUserClick(user)}>
                              <UserIcon className="h-4 w-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(user.email);
                              toast(
                                "Copiado", {
                                description: "Email copiado para a área de transferência",
                              });
                            }}>
                              <Mail className="h-4 w-4 mr-2" />
                              Copiar email
                            </DropdownMenuItem>
                            {user.phone && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(user.phone!);
                                toast(
                                  "Copiado",
                                  {
                                    description: "Telefone copiado para a área de transferência",
                                  });
                              }}>
                                <Phone className="h-4 w-4 mr-2" />
                                Copiar telefone
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * usersPerPage) + 1}-
              {Math.min(currentPage * usersPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-2 sr-only sm:not-sr-only">Anterior</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Página anterior</TooltipContent>
              </Tooltip>
              <div className="text-sm">
                Página {currentPage} de {Math.ceil(filteredUsers.length / usersPerPage)}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage * usersPerPage >= filteredUsers.length}
                  >
                    <span className="mr-2 sr-only sm:not-sr-only">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Próxima página</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader className="pt-6 pb-2">
            <DialogTitle className="text-2xl">
              {isEditing ? 'Editar Usuário' : 'Detalhes do Usuário'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedUser?.avatar ?? undefined} />
                  <AvatarFallback>
                    {selectedUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 flex-1">
                  {isEditing ? (
                    <>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-2xl font-bold"
                        disabled
                      />
                      <Input
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-lg"
                        disabled
                      />
                      <Input
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Telefone"
                        disabled
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                      <p className="text-lg text-muted-foreground">
                        {selectedUser.email}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedUser.phone || 'Sem telefone'}
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <select
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                        className="rounded-md border px-3 py-1 text-sm"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="WORKER">Trabalhador</option>
                        <option value="CLIENT">Cliente</option>
                      </select>
                    ) : (
                      <Badge
                        variant={getRoleBadgeVariant(selectedUser.role)}
                        className="text-sm px-3 py-1"
                      >
                        {selectedUser.role}
                      </Badge>
                    )}
                    <Badge
                      variant={selectedUser.isBlocked ? 'destructive' : 'default'}
                      className="text-sm px-3 py-1"
                    >
                      {selectedUser.isBlocked ? 'Bloqueado' : 'Ativo'}
                    </Badge>
                    <Badge
                      variant={selectedUser.isLoggedIn ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {selectedUser.isLoggedIn ? 'Online' : 'Offline'}
                    </Badge>
                    <Badge
                      variant={selectedUser.verified ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {selectedUser.verified ? 'Verificado' : 'Não verificado'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Informações de Contato</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium">Telefone: <span className="font-normal">{selectedUser.phone || 'Não informado'}</span></p>
                      <p className="font-medium">Provedor: <span className="font-normal">{selectedUser.provider || 'Local'}</span></p>
                      <p className="font-medium">ID do Provedor: <span className="font-normal">{selectedUser.providerId || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Status da Conta</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium">Verificado: <span className="font-normal">{selectedUser.verified ? 'Sim' : 'Não'}</span></p>
                      <p className="font-medium">Excluído: <span className="font-normal">{selectedUser.isDeleted ? 'Sim' : 'Não'}</span></p>
                      <p className="font-medium">Solicitou Exclusão: <span className="font-normal">{selectedUser.deleteRequested ? 'Sim' : 'Não'}</span></p>
                      {selectedUser.deleteRequestedAt && (
                        <p className="font-medium">Data da Solicitação: <span className="font-normal">{formatDate(selectedUser.deleteRequestedAt)}</span></p>
                      )}
                    </div>
                  </div>

                  {selectedUser.isBlocked && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Informações de Bloqueio</h4>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="font-medium">Bloqueado por: <span className="font-normal">{selectedUser.blockedById || 'Sistema'}</span></p>
                        <p className="font-medium">Motivo: <span className="font-normal">{selectedUser.blockReason || 'Não especificado'}</span></p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Datas</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium">Data de Registro: <span className="font-normal">{formatDate(selectedUser.createdAt)}</span></p>
                      <p className="font-medium">Última Atualização: <span className="font-normal">{formatDate(selectedUser.updatedAt)}</span></p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Segurança</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium">Último Login: <span className="font-normal">{selectedUser.isLoggedIn ? 'Atualmente logado' : formatDate(selectedUser.updatedAt)}</span></p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Informações do Sistema</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium">ID do Usuário: <span className="font-normal">{selectedUser.id}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditUser}>
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                {selectedUser?.isBlocked ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleBlockUser(false)}
                    className="gap-1"
                  >
                    <Unlock className="h-4 w-4" />
                    Desbloquear
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handleBlockUser(true)}
                    className="gap-1"
                  >
                    <Lock className="h-4 w-4" />
                    Bloquear
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}