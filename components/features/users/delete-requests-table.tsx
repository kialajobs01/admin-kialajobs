'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  HardDrive,
  Building,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usersService, User as UserType } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

interface DeleteRequestsTableProps {
  requests: UserType[];
}

export function DeleteRequestsTable({ requests }: DeleteRequestsTableProps) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<UserType | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const getStatusBadge = (user: UserType) => {
    if (user.isDeleted) {
      return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Eliminado
      </Badge>;
    }

    if (user.deleteRequested) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>;
    }

    return <Badge variant="outline" className="text-xs">Ativo</Badge>;
  };

  const getUserType = (user: UserType) => {
    if (user.worker) return 'Trabalhador';
    if (user.client) return 'Cliente';
    if (user.role === 'ADMIN') return 'Administrador';
    return user.role;
  };

  const getUserTypeIcon = (user: UserType) => {
    if (user.worker) return <HardDrive className="h-3 w-3" />;
    if (user.client) return <User className="h-3 w-3" />;
    return <Building className="h-3 w-3" />;
  };

  const getUserTypeColor = (user: UserType) => {
    if (user.worker) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (user.client) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleApprove = async (userId: string) => {
    setLoading(userId);
    try {
      await usersService.approveDeleteRequest(userId);
      toast.success('Conta eliminada com sucesso');
      setApproveDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao eliminar conta');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    setLoading(userId);
    try {
      await usersService.rejectDeleteRequest(userId, reason);
      toast.success('Pedido de eliminação rejeitado com sucesso');
      setRejectDialogOpen(false);
      setRejectReason('');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao rejeitar pedido de eliminação');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const openApproveDialog = (user: UserType) => {
    setSelectedRequest(user);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (user: UserType) => {
    setSelectedRequest(user);
    setRejectDialogOpen(true);
  };

  // Filtrar apenas usuários com deleteRequested = true e não deletados
  const pendingRequests = requests.filter(user =>
    user.deleteRequested && !user.isDeleted
  );

  if (pendingRequests.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="rounded-full bg-green-100 p-3 mb-3 sm:mb-4">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <CardTitle className="text-base sm:text-lg mb-2 text-center">Nenhum pedido pendente</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm max-w-md">
            Todos os pedidos de eliminação foram processados ou não há pedidos pendentes no momento.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas - Versão Mobile Melhorada */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-4">
        <Card className="col-span-2 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-lg sm:text-xl font-bold">{pendingRequests.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Trabalhadores</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {pendingRequests.filter(user => user.worker).length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Clientes</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {pendingRequests.filter(user => user.client).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Pedidos Pendentes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {pendingRequests.length} pedido(s) aguardando aprovação
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Versão Desktop */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Usuário</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[150px]">Contacto</TableHead>
                  <TableHead className="w-[140px]">Data do Pedido</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[180px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 w-fit text-xs ${getUserTypeColor(user)}`}
                      >
                        {getUserTypeIcon(user)}
                        <span className="hidden sm:inline">{getUserType(user)}</span>
                        <span className="sm:hidden">
                          {getUserType(user).charAt(0)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span>
                          {user.deleteRequestedAt ? formatDateShort(user.deleteRequestedAt) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openApproveDialog(user)}
                          disabled={loading === user.id}
                          className="h-8 px-2 sm:px-3 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          {loading === user.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Aprovar</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(user)}
                          disabled={loading === user.id}
                          className="h-8 px-2 sm:px-3 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        >
                          {loading === user.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Rejeitar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Versão Tablet */}
          <div className="hidden md:block lg:hidden">
            <div className="space-y-3 p-4">
              {pendingRequests.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 text-xs ${getUserTypeColor(user)}`}
                            >
                              {getUserTypeIcon(user)}
                              {getUserType(user)}
                            </Badge>
                            {getStatusBadge(user)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Contacto</p>
                        <p className="text-sm font-medium">{user.phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data do Pedido</p>
                        <p className="text-sm font-medium">
                          {user.deleteRequestedAt ? formatDateShort(user.deleteRequestedAt) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openApproveDialog(user)}
                        disabled={loading === user.id}
                        className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs"
                      >
                        {loading === user.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectDialog(user)}
                        disabled={loading === user.id}
                        className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs"
                      >
                        {loading === user.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeitar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Versão Mobile */}
          <div className="md:hidden space-y-3 p-3">
            {pendingRequests.map((user) => (
              <Card key={user.id} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="h-8 w-8 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openApproveDialog(user)}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openRejectDialog(user)}>
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Rejeitar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 text-xs ${getUserTypeColor(user)}`}
                    >
                      {getUserTypeIcon(user)}
                      {getUserType(user)}
                    </Badge>
                    {getStatusBadge(user)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="font-medium">{user.phone || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data Pedido</p>
                      <p className="font-medium">
                        {user.deleteRequestedAt ? formatDateShort(user.deleteRequestedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openApproveDialog(user)}
                      disabled={loading === user.id}
                      className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs h-8"
                    >
                      {loading === user.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectDialog(user)}
                      disabled={loading === user.id}
                      className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs h-8"
                    >
                      {loading === user.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeitar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs Responsivos */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirmar Eliminação
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Esta ação irá eliminar permanentemente a conta do usuário.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold mb-2 text-sm">Informações do Usuário</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-xs">Nome</p>
                    <p className="text-muted-foreground text-sm">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs">Email</p>
                    <p className="text-muted-foreground text-sm">{selectedRequest.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-medium text-xs">Tipo</p>
                      <p className="text-muted-foreground text-sm">{getUserType(selectedRequest)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-xs">Telefone</p>
                      <p className="text-muted-foreground text-sm">{selectedRequest.phone || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1 text-xs sm:text-sm">Atenção: Esta ação é irreversível</p>
                    <p className="text-xs text-red-700">
                      Todos os dados do usuário serão permanentemente removidos do sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={loading === selectedRequest?.id}
              className="flex-1 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
              disabled={loading === selectedRequest?.id}
              className="flex-1 text-xs sm:text-sm"
            >
              {loading === selectedRequest?.id ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              Rejeitar Pedido
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Informe o motivo para rejeitar este pedido de eliminação.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold mb-2 text-sm">Usuário</h4>
                <div className="flex items-center gap-2 sm:gap-3">
                  {selectedRequest.avatar ? (
                    <Image
                      src={selectedRequest.avatar}
                      alt={selectedRequest.name}
                      width={40}
                      height={40}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{selectedRequest.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedRequest.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="rejectReason" className="text-sm font-medium">
                  Motivo da Rejeição *
                </label>
                <Textarea
                  id="rejectReason"
                  placeholder="Explique por que está rejeitando este pedido..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Este motivo será registrado e poderá ser consultado posteriormente.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={loading === selectedRequest?.id}
              className="flex-1 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedRequest && handleReject(selectedRequest.id, rejectReason)}
              disabled={loading === selectedRequest?.id || !rejectReason.trim()}
              className="flex-1 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs sm:text-sm"
            >
              {loading === selectedRequest?.id ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Rejeitando...
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Rejeitar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}