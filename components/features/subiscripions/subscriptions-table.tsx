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
  Calendar,
  CreditCard,
  Crown,
  Building,
  MoreVertical,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Subscription, subscriptionsService } from '@/types/subscription';
import Image from 'next/image';

interface SubscriptionsTableProps {
  subscriptionsData: {
    subscriptions: Subscription[];
    total: number;
  } | null;
}

export function SubscriptionsTable({ subscriptionsData }: SubscriptionsTableProps) {
  const router = useRouter();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const subscriptions = subscriptionsData?.subscriptions || [];
  const total = subscriptionsData?.total || 0;

  const getPlanBadge = (plan: string) => {
    const plans = {
      'BASIC': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Building },
      'PREMIUM': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Crown },
      'ENTERPRISE': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Building }
    };

    const planConfig = plans[plan as keyof typeof plans] || plans.BASIC;
    const Icon = planConfig.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${planConfig.color} text-xs`}>
        <Icon className="h-3 w-3" />
        {plan}
      </Badge>
    );
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.isActive) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Inativa
      </Badge>;
    }

    const statusConfig = {
      'ACTIVE': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      'CANCELED': { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
      'EXPIRED': { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle },
      'PENDING': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: RefreshCw }
    };

    const config = statusConfig[subscription.status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {subscription.status}
      </Badge>
    );
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

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(subscriptionId);
    try {
      await subscriptionsService.cancelSubscription(subscriptionId, 'token'); // Você precisará passar o token aqui
      toast.success('Subscrição cancelada com sucesso');
      setCancelDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao cancelar subscrição');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const openCancelDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  // Estatísticas
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive).length;
  const premiumSubscriptions = subscriptions.filter(sub => sub.plan === 'PREMIUM').length;
  const monthlyRevenue = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => sum + sub.price, 0);

  if (total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="rounded-full bg-gray-100 p-3 mb-3 sm:mb-4">
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
          </div>
          <CardTitle className="text-base sm:text-lg mb-2 text-center">Nenhuma subscrição encontrada</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm max-w-md">
            Não há subscrições ativas ou pendentes no momento.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3 lg:gap-4">
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold">{total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Ativas</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{activeSubscriptions}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Premium</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-600">{premiumSubscriptions}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Receita Mensal</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600">
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            Todas as Subscrições
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {total} subscrição(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Versão Desktop */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        {subscription.user.avatar ? (
                          <Image
                            src={subscription.user.avatar}
                            alt={subscription.user.name}
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
                          <div className="font-medium text-sm truncate">{subscription.user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {subscription.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(subscription.plan)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {formatCurrency(subscription.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {subscription.autoRenew ? 'Renovação automática' : 'Manual'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {formatDate(subscription.startDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {formatDate(subscription.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {subscription.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {subscription.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCancelDialog(subscription)}
                            disabled={loading === subscription.id}
                            className="h-8 px-3 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          >
                            {loading === subscription.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Versão Mobile e Tablet */}
          <div className="lg:hidden space-y-3 p-3">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="p-3">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {subscription.user.avatar ? (
                        <Image
                          src={subscription.user.avatar}
                          alt={subscription.user.name}
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
                        <h3 className="font-semibold text-sm truncate">{subscription.user.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{subscription.user.email}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {subscription.isActive && (
                          <DropdownMenuItem onClick={() => openCancelDialog(subscription)}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Informações do Plano e Status */}
                  <div className="flex flex-wrap gap-2">
                    {getPlanBadge(subscription.plan)}
                    {getStatusBadge(subscription)}
                    <Badge variant="outline" className="text-xs">
                      {subscription.paymentMethod}
                    </Badge>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium">{formatCurrency(subscription.price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renovação</p>
                      <p className="font-medium">{subscription.autoRenew ? 'Automática' : 'Manual'}</p>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Início</p>
                      <p className="font-medium">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fim</p>
                      <p className="font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>

                  {/* Ações */}
                  {subscription.isActive && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCancelDialog(subscription)}
                        disabled={loading === subscription.id}
                        className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs h-8"
                      >
                        {loading === subscription.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelar Subscrição
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              Cancelar Subscrição
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Tem certeza que deseja cancelar esta subscrição?
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold mb-2 text-sm">Detalhes da Subscrição</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usuário:</span>
                    <span className="font-medium">{selectedSubscription.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano:</span>
                    <span>{selectedSubscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span>{formatCurrency(selectedSubscription.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Próxima renovação:</span>
                    <span>{formatDate(selectedSubscription.endDate)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-800 mb-1 text-xs sm:text-sm">Atenção</p>
                    <p className="text-xs text-yellow-700">
                      O usuário perderá acesso aos benefícios do plano após o cancelamento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={loading === selectedSubscription?.id}
              className="flex-1 text-xs sm:text-sm"
            >
              Manter Ativa
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSubscription && handleCancelSubscription(selectedSubscription.id)}
              disabled={loading === selectedSubscription?.id}
              className="flex-1 text-xs sm:text-sm"
            >
              {loading === selectedSubscription?.id ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}