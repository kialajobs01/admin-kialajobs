// components/features/verification/verification-details-modal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  Award,
  Video,
  Download,
  Check,
  X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Image from 'next/image';

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

interface VerificationDetailsModalProps {
  request: VerificationRequest;
  onClose: () => void;
}

export function VerificationDetailsModal({ request, onClose }: VerificationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'work' | 'certificates'>('documents');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesReason, setChangesReason] = useState('');

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

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES', rejectionReason?: string) => {
    setIsLoading(true);
    try {
      const payload = {
        status,
        rejectionReason: rejectionReason || null
      };

      await api.patch(`/verification/${request.id}/review`, payload);

      toast.success(`Pedido ${status === 'APPROVED' ? 'aprovado' : status === 'REJECTED' ? 'rejeitado' : 'alterações solicitadas'} com sucesso`);
      onClose();
      window.location.reload();

    } catch (error: any) {
      console.error('Error reviewing verification request:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    await handleReview('APPROVED');
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, digite o motivo da rejeição');
      return;
    }
    await handleReview('REJECTED', rejectionReason.trim());
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleChangesConfirm = async () => {
    if (!changesReason.trim()) {
      toast.error('Por favor, digite o que precisa ser alterado');
      return;
    }
    await handleReview('REQUEST_CHANGES', changesReason.trim());
    setShowChangesModal(false);
    setChangesReason('');
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              Pedido de Verificação - {request.worker.user.name}
              <Badge
                variant={getStatusVariant(request.status)}
                className="flex items-center gap-1 text-sm py-1 px-3"
              >
                {getStatusIcon(request.status)}
                {getStatusText(request.status)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-rows-2  gap-6 xl:grid-rows-4 p-4">
            {/* Conteúdo Principal */}
            <div className="xl:col-span-3 space-y-6">
              {/* Tabs de Documentos */}
              <div className="border-b">
                <div className="flex space-x-4">
                  <Button
                    variant={activeTab === 'documents' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('documents')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Documentos
                  </Button>
                  <Button
                    variant={activeTab === 'work' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('work')}
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Trabalhos ({request.workPhotos.length})
                  </Button>
                  <Button
                    variant={activeTab === 'certificates' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('certificates')}
                    className="flex items-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Certificados ({request.certificates.length})
                  </Button>
                </div>
              </div>

              {/* Conteúdo das Tabs */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Documentos de Identificação</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Frente do Documento */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Frente do Documento</h4>
                      <div className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedImage(request.idDocumentFront)}>
                        <Image
                          src={request.idDocumentFront}
                          alt="Frente do documento"
                          width={120}
                          height={120}
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => downloadImage(request.idDocumentFront, 'frente-documento.jpg')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Verso do Documento */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Verso do Documento</h4>
                      <div className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedImage(request.idDocumentBack)}>
                        <Image
                          src={request.idDocumentBack}
                          alt="Verso do documento"
                          width={120}
                          height={120}
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => downloadImage(request.idDocumentBack, 'verso-documento.jpg')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {/* Selfie com Documento */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Selfie com Documento</h4>
                      <div className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedImage(request.selfieWithId)}>
                        <Image
                          src={request.selfieWithId}
                          alt="Selfie com documento"
                          width={120}
                          height={120}
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => downloadImage(request.selfieWithId, 'selfie-documento.jpg')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Vídeo de Verificação */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Vídeo de Verificação</h4>
                    <div className="border-2 border-dashed rounded-lg overflow-hidden bg-black">
                      <video
                        src={request.verificationVideo}
                        controls
                        className="w-full h-80 object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(request.verificationVideo, 'video-verificacao.mp4')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Vídeo
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'work' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Fotos de Trabalhos Realizados</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {request.workPhotos.map((photo, index) => (
                      <div key={index} className="space-y-3">
                        <div
                          className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors aspect-square"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <Image
                            src={photo}
                            alt={`Trabalho ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => downloadImage(photo, `trabalho-${index + 1}.jpg`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Certificados e Qualificações</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {request.certificates.map((certificate, index) => (
                      <div key={index} className="space-y-3">
                        <div
                          className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors aspect-square"
                          onClick={() => setSelectedImage(certificate)}
                        >
                          <Image
                            src={certificate}
                            alt={`Certificado ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => downloadImage(certificate, `certificado-${index + 1}.jpg`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Informações do Trabalhador */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg">Informações do Trabalhador</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Nome</p>
                      <p className="text-sm">{request.worker.user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm">{request.worker.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm">{request.worker.user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg">Informações Profissionais</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Profissão</p>
                      <p className="text-sm">{request.profession}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Experiência</p>
                      <p className="text-sm">{request.yearsExperience} anos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Localização</p>
                      <p className="text-sm">{request.municipality}, {request.province}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Áreas de Atuação */}
              {request.operatingAreas.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold text-lg">Áreas de Atuação</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.operatingAreas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-lg">Informações do Pedido</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Submetido em</p>
                      <p className="text-sm">{formatDate(request.submittedAt)}</p>
                    </div>
                  </div>

                  {request.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Revisado em</p>
                        <p className="text-sm">{formatDate(request.reviewedAt)}</p>
                      </div>
                    </div>
                  )}

                  {request.reviewedBy && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Revisado por</p>
                        <p className="text-sm">{request.reviewedBy.user.name}</p>
                      </div>
                    </div>
                  )}

                  {request.rejectionReason && (
                    <div>
                      <p className="font-medium text-sm">Motivo da Rejeição</p>
                      <p className="text-sm text-muted-foreground mt-1 bg-destructive/10 p-2 rounded">
                        {request.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold text-lg">Ações de Revisão</h3>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleApprove}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                      {isLoading ? 'Processando...' : 'Aprovar'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowChangesModal(true)}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Solicitar Alterações
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectModal(true)}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Motivo da Rejeição</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Digite o motivo da rejeição..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleRejectConfirm} disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Confirmar Rejeição'}
              </Button>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alterações */}
      {showChangesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Solicitar Alterações</h3>
            <textarea
              value={changesReason}
              onChange={(e) => setChangesReason(e.target.value)}
              placeholder="Digite o que precisa ser alterado..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleChangesConfirm} disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Confirmar Alterações'}
              </Button>
              <Button variant="outline" onClick={() => setShowChangesModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Image
              src={selectedImage}
              alt="Visualização ampliada"
              width={120}
              height={120}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}