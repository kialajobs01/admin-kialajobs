// components/features/logs/logs-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  Info,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface Log {
  id: string;
  action: string;
  description: string;
  userId: string;
  adminId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  relatedId: string | null;
  metadata: any;
  level: 'INFO' | 'WARN' | 'ERROR';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  admin: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
}

interface LogsTableProps {
  logs: Log[];
}

export function LogsTable({ logs }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });
 
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);
  
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="h-4 w-4" />;
      case 'WARN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'INFO':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'destructive';
      case 'WARN':
        return 'secondary';
      case 'INFO':
        return 'default';
      default:
        return 'default';
    }
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

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data', 'Nível', 'Ação', 'Descrição', 'Utilizador', 'Email', 'Admin'],
      ...filteredLogs.map(log => [
        formatDate(log.createdAt),
        log.level,
        formatAction(log.action),
        log.description,
        log.user?.name || 'N/A',
        log.user?.email || 'N/A',
        log.admin?.user.name || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {levelFilter === 'ALL' ? 'Todos' : levelFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLevelFilter('ALL')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter('INFO')}>
                <Info className="h-4 w-4 mr-2" />
                Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter('WARN')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Aviso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter('ERROR')}>
                <XCircle className="h-4 w-4 mr-2" />
                Erro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={exportLogs} variant="outline" className="flex gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Informação de resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} de {filteredLogs.length} logs
        </div>
        {filteredLogs.length > logsPerPage && (
          <div>
            Página {currentPage} de {totalPages}
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Utilizador</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.map((log) => (
              <TableRow key={log.id} className="group">
                <TableCell className="font-mono text-xs">
                  {formatDate(log.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getLevelVariant(log.level)}
                    className="flex items-center gap-1 w-20 justify-center"
                  >
                    {getLevelIcon(log.level)}
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="font-medium">{formatAction(log.action)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate" title={log.description}>
                    {log.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{log.user?.name || 'Sistema'}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.user?.email || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {currentLogs.length} logs por página
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostrar páginas ao redor da página atual
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum log encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Tente ajustar os filtros ou termos de pesquisa.
          </p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalhes do Log</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLog.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data/Hora</label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nível</label>
                  <div className="mt-1">
                    <Badge variant={getLevelVariant(selectedLog.level)}>
                      {selectedLog.level}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Ação</label>
                  <p className="text-sm text-muted-foreground">
                    {formatAction(selectedLog.action)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Utilizador</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.user?.name || 'Sistema'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Admin</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.admin?.user.name || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.admin?.user.email || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedLog.relatedId && (
                <div>
                  <label className="text-sm font-medium">ID Relacionado</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLog.relatedId}
                  </p>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <label className="text-sm font-medium">Metadados</label>
                  <pre className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}