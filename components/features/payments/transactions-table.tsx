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
    CreditCard,
    Calendar,
    User,
    Briefcase,
    Crown,
    DollarSign,
    MoreVertical,
    CheckCircle,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Payment, paymentsService } from '@/types/payment';
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

interface TransactionsTableProps {
    paymentsData: {
        payments: Payment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        summary: {
            totalAmount: number;
            totalCount: number;
            statusBreakdown: {
                [key: string]: {
                    count: number;
                    amount: number;
                };
            };
            methodBreakdown: {
                [key: string]: {
                    count: number;
                    amount: number;
                };
            };
        };
    } | null;
}

export function TransactionsTable({ paymentsData }: TransactionsTableProps) {
    const router = useRouter();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [loading, setLoading] = useState<string | null>(null);

    const payments = paymentsData?.payments || [];
    const total = paymentsData?.total || 0;
    const summary = paymentsData?.summary;


    const holdStats = summary?.statusBreakdown?.HOLD || { count: 0, amount: 0 };
    const releasedStats = summary?.statusBreakdown?.RELEASED || { count: 0, amount: 0 };
    const refundedStats = summary?.statusBreakdown?.REFUNDED || { count: 0, amount: 0 };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'HOLD': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: 'Em Hold' },
            'RELEASED': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Liberado' },
            'REFUNDED': { color: 'bg-red-50 text-red-700 border-red-200', icon: RefreshCw, label: 'Reembolsado' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.HOLD;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`flex items-center gap-1 ${config.color} text-xs`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getMethodBadge = (method: string) => {
        const methodConfig = {
            'CARD': { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Cartão' },
            'MOBILE_MONEY': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Mobile Money' },
            'BANK_TRANSFER': { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Transferência' }
        };

        const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.CARD;

        return (
            <Badge variant="outline" className={`${config.color} text-xs`}>
                {config.label}
            </Badge>
        );
    };

    const getPaymentType = (payment: Payment) => {
        if (payment.jobId) return { type: 'Trabalho', icon: Briefcase, color: 'text-blue-600' };
        if (payment.subscriptionId) return { type: 'Subscrição', icon: Crown, color: 'text-yellow-600' };
        return { type: 'Outro', icon: CreditCard, color: 'text-gray-600' };
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

    const handleUpdateStatus = async (paymentId: string, status: string) => {
        setLoading(paymentId);
        try {
            await paymentsService.updatePaymentStatus(paymentId, status, 'token'); // Você precisará passar o token aqui
            toast.success('Status da transação atualizado com sucesso');
            setStatusDialogOpen(false);
            setNewStatus('');
            router.refresh();
        } catch (error) {
            toast.error('Erro ao atualizar status da transação');
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const openStatusDialog = (payment: Payment, status: string) => {
        setSelectedPayment(payment);
        setNewStatus(status);
        setStatusDialogOpen(true);
    };

    if (total === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="rounded-full bg-gray-100 p-3 mb-3 sm:mb-4">
                        <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg mb-2 text-center">Nenhuma transação encontrada</CardTitle>
                    <CardDescription className="text-center text-xs sm:text-sm max-w-md">
                        Não há transações registradas na plataforma no momento.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 lg:gap-4">
                <Card className="col-span-2 sm:col-span-2 lg:col-span-1">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total</p>
                                <p className="text-lg sm:text-xl font-bold">{total}</p>
                                <p className="text-xs text-green-600 font-medium">
                                    {summary ? formatCurrency(summary.totalAmount) : '0,00 AOA'}
                                </p>
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
                                <p className="text-xs font-medium text-gray-600">Em Hold</p>
                                <p className="text-lg sm:text-xl font-bold text-yellow-600">
                                    {holdStats.count}
                                </p>
                                <p className="text-xs text-yellow-600">
                                    {formatCurrency(holdStats.amount)}
                                </p>
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
                                <p className="text-xs font-medium text-gray-600">Liberados</p>
                                <p className="text-lg sm:text-xl font-bold text-green-600">
                                    {releasedStats.count}
                                </p>
                                <p className="text-xs text-green-600">
                                    {formatCurrency(releasedStats.amount)}
                                </p>
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
                                <p className="text-xs font-medium text-gray-600">Reembolsados</p>
                                <p className="text-lg sm:text-xl font-bold text-red-600">
                                    {refundedStats.count}
                                </p>
                                <p className="text-xs text-red-600">
                                    {formatCurrency(refundedStats.amount)}
                                </p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
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
                        Todas as Transações
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        {total} transação(ões) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Versão Desktop */}
                    <div className="hidden lg:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transação</TableHead>
                                    <TableHead>Utilizador</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => {
                                    const paymentType = getPaymentType(payment);
                                    const Icon = paymentType.icon;

                                    return (
                                        <TableRow key={payment.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`p-2 rounded-full bg-gray-100 ${paymentType.color}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-sm">#{payment.id.slice(-8)}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {paymentType.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">
                                                        {payment.user?.name || payment.Job?.client?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {payment.user?.email || payment.Job?.client?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {payment.jobId && payment.Job && (
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{payment.Job.title}</div>
                                                            <div className="text-xs text-muted-foreground">Trabalho</div>
                                                        </div>
                                                    )}
                                                    {payment.subscriptionId && payment.Subscription && (
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{payment.Subscription.plan}</div>
                                                            <div className="text-xs text-muted-foreground">Subscrição</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getMethodBadge(payment.method)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(payment.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    {formatDate(payment.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                                                                <MoreVertical className="h-3 w-3 mr-1" />
                                                                Ações
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {payment.status === 'HOLD' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => openStatusDialog(payment, 'RELEASED')}>
                                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                        Liberar Pagamento
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => openStatusDialog(payment, 'REFUNDED')}>
                                                                        <RefreshCw className="h-4 w-4 mr-2 text-red-600" />
                                                                        Reembolsar
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {payment.status === 'RELEASED' && (
                                                                <DropdownMenuItem onClick={() => openStatusDialog(payment, 'REFUNDED')}>
                                                                    <RefreshCw className="h-4 w-4 mr-2 text-red-600" />
                                                                    Reembolsar
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Versão Mobile e Tablet */}
                    <div className="lg:hidden space-y-3 p-3">
                        {payments.map((payment) => {
                            const paymentType = getPaymentType(payment);
                            const Icon = paymentType.icon;

                            return (
                                <Card key={payment.id} className="p-3">
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className={`p-2 rounded-full bg-gray-100 ${paymentType.color}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-sm">#{payment.id.slice(-8)}</h3>
                                                    <p className="text-xs text-muted-foreground">{paymentType.type}</p>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {payment.status === 'HOLD' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => openStatusDialog(payment, 'RELEASED')}>
                                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                Liberar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openStatusDialog(payment, 'REFUNDED')}>
                                                                <RefreshCw className="h-4 w-4 mr-2 text-red-600" />
                                                                Reembolsar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {payment.status === 'RELEASED' && (
                                                        <DropdownMenuItem onClick={() => openStatusDialog(payment, 'REFUNDED')}>
                                                            <RefreshCw className="h-4 w-4 mr-2 text-red-600" />
                                                            Reembolsar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Informações do Utilizador */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="text-muted-foreground">Utilizador</p>
                                                <p className="font-medium truncate">
                                                    {payment.user?.name || payment.Job?.client?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Email</p>
                                                <p className="font-medium truncate">
                                                    {payment.user?.email || payment.Job?.client?.email || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Detalhes da Transação */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="text-muted-foreground">Valor</p>
                                                <p className="font-medium text-green-600">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Método</p>
                                                <div className="mt-1">
                                                    {getMethodBadge(payment.method)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status e Data */}
                                        <div className="flex flex-wrap gap-2 items-center justify-between">
                                            {getStatusBadge(payment.status)}
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(payment.createdAt)}
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        {(payment.status === 'HOLD' || payment.status === 'RELEASED') && (
                                            <div className="flex gap-2 pt-1">
                                                {payment.status === 'HOLD' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openStatusDialog(payment, 'RELEASED')}
                                                            disabled={loading === payment.id}
                                                            className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs h-8"
                                                        >
                                                            {loading === payment.id ? (
                                                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Liberar
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openStatusDialog(payment, 'REFUNDED')}
                                                            disabled={loading === payment.id}
                                                            className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs h-8"
                                                        >
                                                            {loading === payment.id ? (
                                                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                                    Reembolsar
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                                {payment.status === 'RELEASED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openStatusDialog(payment, 'REFUNDED')}
                                                        disabled={loading === payment.id}
                                                        className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs h-8"
                                                    >
                                                        {loading === payment.id ? (
                                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <RefreshCw className="h-3 w-3 mr-1" />
                                                                Reembolsar
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de Atualização de Status */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            {newStatus === 'RELEASED' ? 'Liberar Pagamento' : 'Reembolsar Pagamento'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {newStatus === 'RELEASED'
                                ? 'Tem certeza que deseja liberar este pagamento para o trabalhador?'
                                : 'Tem certeza que deseja reembolsar este pagamento?'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                                <h4 className="font-semibold mb-2 text-sm">Detalhes da Transação</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID:</span>
                                        <span className="font-medium">#{selectedPayment.id.slice(-8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Valor:</span>
                                        <span className="font-medium">{formatCurrency(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Utilizador:</span>
                                        <span className="font-medium">
                                            {selectedPayment.user?.name || selectedPayment.Job?.client?.name || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status Actual:</span>
                                        <span>{getStatusBadge(selectedPayment.status)}</span>
                                    </div>
                                </div>
                            </div>

                            {newStatus === 'RELEASED' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-green-800 mb-1 text-xs sm:text-sm">Liberação de Pagamento</p>
                                            <p className="text-xs text-green-700">
                                                O valor será transferido para o trabalhador e não poderá ser revertido.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {newStatus === 'REFUNDED' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-red-800 mb-1 text-xs sm:text-sm">Reembolso</p>
                                            <p className="text-xs text-red-700">
                                                O valor será devolvido ao cliente e esta ação não poderá ser revertida.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStatusDialogOpen(false);
                                setNewStatus('');
                            }}
                            disabled={loading === selectedPayment?.id}
                            className="flex-1 text-xs sm:text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant={newStatus === 'RELEASED' ? 'default' : 'destructive'}
                            onClick={() => selectedPayment && handleUpdateStatus(selectedPayment.id, newStatus)}
                            disabled={loading === selectedPayment?.id}
                            className="flex-1 text-xs sm:text-sm"
                        >
                            {loading === selectedPayment?.id ? (
                                <>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    {newStatus === 'RELEASED' ? (
                                        <>
                                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                            Liberar Pagamento
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                            Confirmar Reembolso
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}