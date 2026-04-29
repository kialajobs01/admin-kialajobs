'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertCircle,
  Building,
  Tag,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { JobDetailsModal } from './job-details-modal';

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  price: number;
  clientId: string;
  workerId: string | null;
  serviceId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  isRemote: boolean;
  location: string | null;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  worker: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  category: {
    id: string;
    name: string;
  };
  media: Array<{
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  JobApplication: Array<{
    id: string;
    status: string;
    worker: {
      user: {
        name: string;
      };
    };
  }>;
  Payment: {
    id: string;
    status: string;
    amount: number;
  } | null;
}

interface JobsGridProps {
  jobs: Job[];
}

export function JobsGrid({ jobs }: JobsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'ACCEPTED':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ACCEPTED':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'ACCEPTED':
        return 'Aceite';
      case 'IN_PROGRESS':
        return 'Em Progresso';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, descrição, cliente, categoria..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                  <Filter className="h-4 w-4" />
                  {statusFilter === 'ALL' ? 'Todos Status' : getStatusText(statusFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                  <Users className="h-4 w-4 mr-2" />
                  Todos os Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Pendentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('ACCEPTED')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('IN_PROGRESS')}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Em Progresso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('COMPLETED')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluídos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredJobs.length} de {jobs.length} trabalho(s)
          </div>
        </div>

        {/* Grid de Cards */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20 group"
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader className="pb-3 space-y-3">
                  {/* Header com status e preço */}
                  <div className="flex items-start justify-between">
                    <Badge
                      variant={getStatusVariant(job.status)}
                      className={`flex items-center gap-1 ${getStatusColor(job.status)}`}
                    >
                      {getStatusIcon(job.status)}
                      {getStatusText(job.status)}
                    </Badge>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(job.price)}
                    </div>
                  </div>

                  {/* Título e categoria */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span>{job.category.name}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3 space-y-4">
                  {/* Descrição */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Informações principais */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate font-medium" title={job.client.name}>
                          {job.client.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate" title={job.isRemote ? 'Remoto' : job.location || 'Local não especificado'}>
                          {job.isRemote ? '🌐 Remoto' : job.location || '📍 Local não especificado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    {job.worker && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600 font-medium truncate">
                            Atribuído: {job.worker.user.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags e candidaturas */}
                  <div className="flex items-center justify-between">
                    {job.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {job.tags.length} tag(s)
                        </span>
                      </div>
                    )}

                    {job.JobApplication.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {job.JobApplication.length} cand.
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t bg-muted/50">
                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhum trabalho encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Tente ajustar os termos de pesquisa ou filtrar por um status diferente.'
                : 'Não há trabalhos disponíveis no momento.'
              }
            </p>
          </div>
        )}
      </div>
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}
