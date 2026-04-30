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
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentImageSet, setCurrentImageSet] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesReason, setChangesReason] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'REJECTED':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'UNDER_REVIEW':
        return <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'REQUEST_CHANGES':
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'PENDING':
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <FileText className="h-3 w-3 sm:h-4 sm:w-4" />;
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
        return 'Alterações';
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
    link.target = '_blank'
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

  const openLightbox = (images: string[], index: number) => {
    setCurrentImageSet(images);
    setSelectedImageIndex(index);
    setSelectedImage(images[index]);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = selectedImageIndex === 0 ? currentImageSet.length - 1 : selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(currentImageSet[newIndex]);
    } else {
      const newIndex = selectedImageIndex === currentImageSet.length - 1 ? 0 : selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(currentImageSet[newIndex]);
    }
  };

  const allDocuments = [
    { url: request.idDocumentFront, title: 'Frente do Documento' },
    { url: request.idDocumentBack, title: 'Verso do Documento' },
    { url: request.selfieWithId, title: 'Selfie com Documento' }
  ];

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-full sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl h-[100vh] sm:h-[95vh] sm:max-h-[95vh] overflow-y-auto p-0 sm:p-4 rounded-none sm:rounded-lg pointer-events-none">
          {/* Header Fixo no Mobile */}
          <div className="sticky top-0 z-10 bg-background border-b p-4 sm:p-6">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-base sm:text-xl">
                <span className="truncate">Verificação - {request.worker.user.name.split(' ')[0]}</span>
                <Badge
                  variant={getStatusVariant(request.status)}
                  className="flex items-center gap-1 text-xs sm:text-sm py-0.5 px-2 sm:py-1 sm:px-3 self-start sm:self-center w-fit"
                >
                  {getStatusIcon(request.status)}
                  <span className="hidden sm:inline">{getStatusText(request.status)}</span>
                  <span className="sm:hidden">{getStatusText(request.status).substring(0, 8)}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Tabs Mobile com Scroll Horizontal */}
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex space-x-1 sm:space-x-2 min-w-max sm:min-w-0">
                  <Button
                    variant={activeTab === 'documents' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('documents')}
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Docs</span>
                    <span className="hidden sm:inline">umentos</span>
                  </Button>
                  <Button
                    variant={activeTab === 'work' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('work')}
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Trabalhos</span>
                    <span className="text-xs ml-1">({request.workPhotos.length})</span>
                  </Button>
                  <Button
                    variant={activeTab === 'certificates' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('certificates')}
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Certificados</span>
                    <span className="text-xs ml-1">({request.certificates.length})</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Layout Principal - Mobile First com Grid Responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Coluna de Conteúdo - Ocupa 2 colunas no desktop */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Documentos Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold">Documentos</h3>

                      {/* Mobile: Swiper Carousel */}
                      <div className="block lg:hidden">
                        <Swiper
                          modules={[Navigation, Pagination]}
                          navigation
                          pagination={{ clickable: true }}
                          spaceBetween={16}
                          slidesPerView={1}
                          className="documents-swiper"
                        >
                          {allDocuments.map((doc, idx) => (
                            <SwiperSlide key={idx}>
                              <div className="space-y-2">
                                <div
                                  className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer bg-muted"
                                  onClick={() => openLightbox(allDocuments.map(d => d.url), idx)}
                                >
                                  <Image
                                    src={doc.url}
                                    alt={doc.title}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <p className="text-sm font-medium text-center">{doc.title}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => downloadImage(doc.url, `${doc.title}.jpg`)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>

                      {/* Desktop: Grid Layout */}
                      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
                        {allDocuments.map((doc, idx) => (
                          <div key={idx} className="space-y-2">
                            <div
                              className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors aspect-[3/4]"
                              onClick={() => openLightbox(allDocuments.map(d => d.url), idx)}
                            >
                              <Image
                                src={doc.url}
                                alt={doc.title}
                                width={300}
                                height={400}
                                className="w-full h-full object-contain bg-gray-50"
                              />
                            </div>
                            <p className="text-sm font-medium text-center">{doc.title}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => downloadImage(doc.url, `${doc.title}.jpg`)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vídeo de Verificação */}
                    {request.verificationVideo && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Vídeo de Verificação</h4>
                        <div className="rounded-lg overflow-hidden bg-black aspect-video">
                          <video
                            src={request.verificationVideo}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => downloadImage(request.verificationVideo, 'video-verificacao.mp4')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Vídeo
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Trabalhos Tab */}
                {activeTab === 'work' && (
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Fotos de Trabalhos</h3>

                    {/* Mobile: Grid 2 colunas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {request.workPhotos.map((photo, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
                            onClick={() => openLightbox(request.workPhotos, index)}
                          >
                            <Image
                              src={photo}
                              alt={`Trabalho ${index + 1}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => downloadImage(photo, `trabalho-${index + 1}.jpg`)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificados Tab */}
                {activeTab === 'certificates' && (
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Certificados</h3>

                    {/* Mobile: Grid 2 colunas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {request.certificates.map((certificate, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
                            onClick={() => openLightbox(request.certificates, index)}
                          >
                            <Image
                              src={certificate}
                              alt={`Certificado ${index + 1}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => downloadImage(certificate, `certificado-${index + 1}.jpg`)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna de Informações - Desktop */}
              <div className="space-y-4">
                {/* Informações do Trabalhador */}
                <div className="space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-sm sm:text-base">Informações</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <InfoRow icon={User} label="Nome" value={request.worker.user.name} />
                    <InfoRow icon={Mail} label="Email" value={request.worker.user.email} isEmail />
                    <InfoRow icon={Phone} label="Telefone" value={request.worker.user.phone} />
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div className="space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-sm sm:text-base">Profissão</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <InfoRow icon={Briefcase} label="Profissão" value={request.profession} />
                    <InfoRow icon={Award} label="Experiência" value={`${request.yearsExperience} anos`} />
                    <InfoRow icon={MapPin} label="Localização" value={`${request.municipality}, ${request.province}`} />
                  </div>
                </div>

                {/* Áreas de Atuação */}
                {request.operatingAreas.length > 0 && (
                  <div className="space-y-2 p-3 sm:p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold text-sm sm:text-base">Áreas de Atuação</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {request.operatingAreas.slice(0, 5).map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {request.operatingAreas.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{request.operatingAreas.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações do Pedido */}
                <div className="space-y-2 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold text-sm sm:text-base">Pedido</h3>
                  <div className="space-y-2">
                    <InfoRow icon={Calendar} label="Submetido" value={formatDate(request.submittedAt)} />
                    {request.reviewedAt && (
                      <InfoRow icon={CheckCircle} label="Revisado" value={formatDate(request.reviewedAt)} />
                    )}
                    {request.rejectionReason && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-destructive">Motivo da Rejeição</p>
                        <p className="text-xs text-muted-foreground mt-0.5 bg-destructive/10 p-2 rounded">
                          {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações - Mobile Fixed Bottom */}
                {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                  <>
                    {/* Desktop Actions */}
                    <div className="hidden lg:block space-y-2">
                      <Button
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowChangesModal(true)}
                        disabled={isLoading}
                        className="w-full"
                        size="sm"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Solicitar Alterações
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          () => {
                            onClose()
                            setShowRejectModal(true)
                          }
                        }}
                        disabled={isLoading}
                        className="w-full"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>

                    {/* Mobile Bottom Actions */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-20">
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowChangesModal(true)}
                          disabled={isLoading}
                          className="flex-1 text-sm"
                          size="sm"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Alterar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            onClose()
                            setShowRejectModal(true)
                          }}
                          disabled={isLoading}
                          className="flex-1 text-sm"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>

                    {/* Espaço para o bottom fixed no mobile */}
                    <div className="lg:hidden h-20" />
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 pointer-events-auto">
          <div className="bg-background p-4 sm:p-6 rounded-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Motivo da Rejeição</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Digite o motivo da rejeição..."
              className="w-full h-28 sm:h-32 p-2 sm:p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              autoFocus
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} className="w-full sm:w-auto order-2 sm:order-1">
                Cancelar
              </Button>
              <Button onClick={handleRejectConfirm} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
                {isLoading ? 'Processando...' : 'Confirmar Rejeição'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 pointer-events-auto">
          <div className="bg-background p-4 sm:p-6 rounded-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Solicitar Alterações</h3>
            <textarea
              value={changesReason}
              onChange={(e) => setChangesReason(e.target.value)}
              placeholder="Digite o que precisa ser alterado..."
              className="w-full h-28 sm:h-32 p-2 sm:p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              autoFocus
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowChangesModal(false)} className="w-full sm:w-auto order-2 sm:order-1">
                Cancelar
              </Button>
              <Button onClick={handleChangesConfirm} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
                {isLoading ? 'Processando...' : 'Confirmar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {currentImageSet.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 sm:left-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full z-[9999]"
                onClick={() => navigateLightbox('prev')}
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 sm:right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
                onClick={() => navigateLightbox('next')}
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={selectedImage}
              alt="Visualização ampliada"
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {currentImageSet.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {currentImageSet.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function InfoRow({ icon: Icon, label, value, isEmail = false }: { icon: any; label: string; value: string; isEmail?: boolean }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium">{label}</p>
        <p className={`text-xs sm:text-sm text-muted-foreground truncate ${isEmail ? 'break-all truncate' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
