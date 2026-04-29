  'use client';

  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { ScrollArea } from '@/components/ui/scroll-area';
  import {
    MapPin,
    Calendar,
    User,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    PlayCircle,
    AlertCircle,
    Phone,
    Mail,
    Tag,
    Building,
    Users,
    Download,
    ExternalLink,
    Shield
  } from 'lucide-react';
  import { Separator } from '@/components/ui/separator';
  import Image from 'next/image';

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

  interface JobDetailsModalProps {
    job: Job;
    onClose: () => void;
  }

  export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
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
          return 'border-green-200 bg-green-50 text-green-700';
        case 'CANCELLED':
          return 'border-red-200 bg-red-50 text-red-700';
        case 'IN_PROGRESS':
          return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'PENDING':
          return 'border-yellow-200 bg-yellow-50 text-yellow-700';
        case 'ACCEPTED':
          return 'border-green-200 bg-green-50 text-green-700';
        default:
          return 'border-gray-200 bg-gray-50 text-gray-700';
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(amount);
    };

    const downloadMedia = (url: string, filename: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent size="wide">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                  {job.title}
                  <Badge
                    variant={getStatusVariant(job.status)}
                    className={`flex items-center gap-1 text-sm py-1 px-3 ${getStatusColor(job.status)}`}
                  >
                    {getStatusIcon(job.status)}
                    {getStatusText(job.status)}
                  </Badge>
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{job.category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(95vh-80px)] px-6 overflow-auto">
            <div className="flex flex-col gap-6 py-4">
              {job.media.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Galeria de Mídia
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {job.media.length} {job.media.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.media.map((media, index) => (
                      <div key={media.id} className="group relative rounded-lg overflow-hidden border-2">
                        <Image
                          src={media.url}
                          alt={`${job.title} - Imagem ${index + 1}`}
                          width={40}
                          height={40}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(media.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadMedia(media.url, `job-${job.id}-${index + 1}.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {media.type === 'IMAGE' ? '📷 Imagem' : '🎥 Vídeo'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo Principal - SEMPRE EMBAIXO DAS IMAGENS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna da Esquerda - Descrição e Candidaturas */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Descrição Detalhada */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Descrição do Trabalho</h3>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  {/* Candidaturas */}
                  {job.JobApplication.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Candidaturas
                        </h3>
                        <Badge variant="outline">
                          {job.JobApplication.length} candidato(s)
                        </Badge>
                      </div>

                      <div className="grid gap-3">
                        {job.JobApplication.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{application.worker.user.name}</p>
                                <Badge variant="outline" className="mt-1">
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver Perfil
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna da Direita - Informações do Trabalho */}
                <div className="space-y-6">
                  {/* Informações do Trabalho */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Informações do Trabalho
                    </h3>

                    <div className="space-y-4">
                      {/* Preço */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Preço</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(job.price)}
                        </span>
                      </div>

                      {/* Localização */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Localização</p>
                          <p className="text-sm text-muted-foreground">
                            {job.isRemote ? '🌐 Trabalho Remoto' : `📍 ${job.location || 'Local não especificado'}`}
                          </p>
                        </div>
                      </div>

                      {/* Categoria */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Building className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Categoria</p>
                          <p className="text-sm text-muted-foreground">{job.category.name}</p>
                        </div>
                      </div>

                      {/* Datas */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <Calendar className="h-5 w-5 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Criado em</p>
                            <p className="text-sm text-muted-foreground">{formatDate(job.createdAt)}</p>
                          </div>
                        </div>

                        {job.completedAt && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">Concluído em</p>
                              <p className="text-sm text-muted-foreground">{formatDate(job.completedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Informações do Cliente */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações do Cliente
                    </h3>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {job.client.avatar ? (
                          <Image
                            src={job.client.avatar}
                            alt={job.client.name}
                            width={40}
                            height={40}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{job.client.name}</p>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{job.client.email}</span>
                        </div>

                        {job.client.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{job.client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trabalhador Atribuído */}
                  {job.worker && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-green-600" />
                          Trabalhador Atribuído
                        </h3>

                        <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900">{job.worker.user.name}</p>
                              <p className="text-sm text-green-700">Trabalhador</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">{job.worker.user.email}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tags */}
                  {job.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="px-3 py-1">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pagamento */}
                  {job.Payment && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Informações de Pagamento</h3>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Status:</span>
                            <Badge variant={job.Payment.status === 'COMPLETED' ? 'default' : 'outline'}>
                              {job.Payment.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Valor:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(job.Payment.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
