'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download , Search, Filter, User, UserX, UserCheck, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { User as UserType, usersService } from '@/types/user';
import { EditUserModal } from './edit-user-modal.tsx';


interface UsersTableProps {
  users: UserType[];
}

type UserRole = 'ALL' | 'CLIENT' | 'WORKER' | 'ADMIN';
type UserStatus = 'ALL' | 'ACTIVE' | 'BLOCKED' | 'DELETED' | 'VERIFIED';

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtro de pesquisa
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de role
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      // Filtro de status
      let matchesStatus = true;
      switch (statusFilter) {
        case 'ACTIVE':
          matchesStatus = !user.isBlocked && !user.isDeleted;
          break;
        case 'BLOCKED':
          matchesStatus = user.isBlocked;
          break;
        case 'DELETED':
          matchesStatus = user.isDeleted;
          break;
        case 'VERIFIED':
          matchesStatus = user.verified;
          break;
        case 'ALL':
        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este usuário?')) {
      return;
    }

    try {
      await usersService.deleteUser(userId);
      toast.success('Usuário eliminado com sucesso');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao eliminar usuário');
      console.error(error);
    }
  };

  const getStatusBadge = (user: UserType) => {
    if (user.isDeleted) {
      return <Badge variant="destructive">Eliminado</Badge>;
    }
    if (user.isBlocked) {
      return <Badge variant="secondary">Bloqueado</Badge>;
    }
    if (user.verified) {
      return <Badge className="bg-green-500 hover:bg-green-600">Verificado</Badge>;
    }
    return <Badge variant="outline">Ativo</Badge>;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'WORKER':
        return <User className="h-4 w-4" />;
      case 'CLIENT':
        return <UserCheck className="h-4 w-4" />;
      case 'ADMIN':
        return <UserX className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'WORKER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLIENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      toast.error('Nenhum usuário para exportar');
      return;
    }

    const data = filteredUsers.map(u => ({
      ID: u.id,
      Nome: u.name,
      Email: u.email,
      Telefone: u.phone || '-',
      Tipo: u.role,
      Status: u.isDeleted
        ? 'Eliminado'
        : u.isBlocked
          ? 'Bloqueado'
          : u.verified
            ? 'Verificado'
            : 'Ativo',
      'Data de Registo': new Date(u.createdAt).toLocaleString('pt-AO'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilizadores');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `utilizadores_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success('Exportação concluída!');
  };


  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => !u.isBlocked && !u.isDeleted).length;
    const blocked = users.filter(u => u.isBlocked).length;
    const deleted = users.filter(u => u.isDeleted).length;
    const verified = users.filter(u => u.verified).length;

    return { total, active, blocked, deleted, verified };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bloqueados</p>
                <p className="text-2xl font-bold text-orange-600">{stats.blocked}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eliminados</p>
                <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
              </div>
              <UserX className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campo de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={roleFilter} onValueChange={(value: UserRole) => setRoleFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                <SelectItem value="CLIENT">Clientes</SelectItem>
                <SelectItem value="WORKER">Trabalhadores</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={statusFilter} onValueChange={(value: UserStatus) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">Ativos</SelectItem>
                <SelectItem value="BLOCKED">Bloqueados</SelectItem>
                <SelectItem value="DELETED">Eliminados</SelectItem>
                <SelectItem value="VERIFIED">Verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informações dos Filtros */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>
              Mostrando {filteredUsers.length} de {users.length} usuários
            </span>
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Pesquisa: {searchTerm}
              </Badge>
            )}
            {roleFilter !== 'ALL' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {getRoleIcon(roleFilter)}
                Tipo: {roleFilter === 'CLIENT' ? 'Cliente' : roleFilter === 'WORKER' ? 'Trabalhador' : 'Administrador'}
              </Badge>
            )}
            {statusFilter !== 'ALL' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Status: {
                  statusFilter === 'ACTIVE' ? 'Ativo' :
                    statusFilter === 'BLOCKED' ? 'Bloqueado' :
                      statusFilter === 'DELETED' ? 'Eliminado' : 'Verificado'
                }
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Registo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.isDeleted ? 'bg-gray-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role === 'WORKER' && 'Trabalhador'}
                          {user.role === 'CLIENT' && 'Cliente'}
                          {user.role === 'ADMIN' && 'Administrador'}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-AO')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString('pt-AO')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditUserModal user={user} currentUserRole={"ADMIN"} />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.isDeleted}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}