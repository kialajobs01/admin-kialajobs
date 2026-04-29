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
  Eye,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { VerificationDetailsModal } from './verification-details-modal';

interface VerificationRequest {
  id: string;
  workerId: string;
  idDocumentFront: string;
  idDocumentBack: string;
  selfieWithId: string;
  workPhotos: string[];
  certificates: string[];
  operatingAreas: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES' | 'UNDER_REVIEW';
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  updatedAt: string;
  municipality: string;
  profession: string;
  province: string;
  verificationVideo: string;
  yearsExperience: number;
  worker: {
    id: string;
    userId: string;
    bio: string | null;
    skills: string[];
    experience: number | null;
    averageRating: number | null;
    avatar: string | null;
    title: string | null;
    isVerified: boolean;
    municipality: string | null;
    operatingAreas: string[];
    province: string | null;
    coverUrl: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  reviewedBy: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
}

interface VerificationRequestsTableProps {
  requests: VerificationRequest[];
}

export function VerificationRequestsTable({ requests }: VerificationRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.worker.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.worker.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.municipality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <RefreshCw className="h-4 w-4" />;
      case 'REQUEST_CHANGES':
        return <AlertTriangle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'UNDER_REVIEW':
        return 'secondary';
      case 'REQUEST_CHANGES':
        return 'outline';
      case 'PENDING':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
      case 'REQUEST_CHANGES':
        return 'Alterações Solicitadas';
      case 'UNDER_REVIEW':
        return 'Em Revisão';
      default:
        return status;
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar pedidos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === 'ALL' ? 'Todos' : getStatusText(statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>
                <Clock className="h-4 w-4 mr-2" />
                Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('UNDER_REVIEW')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Em Revisão
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('REQUEST_CHANGES')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alterações Solicitadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')}>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabalhador</TableHead>
              <TableHead>Profissão</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Experiência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Submissão</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="group">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {request.worker.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.worker.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.worker.user.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{request.profession}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{request.municipality}</div>
                      <div className="text-xs text-muted-foreground">{request.province}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <span className="font-medium">{request.yearsExperience}</span>
                    <div className="text-xs text-muted-foreground">anos</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(request.status)}
                    className="flex items-center gap-1 w-32 justify-center"
                  >
                    {getStatusIcon(request.status)}
                    {getStatusText(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(request.submittedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Tente ajustar os filtros ou termos de pesquisa.
          </p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedRequest && (
        <VerificationDetailsModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}
    </div>
  );
}