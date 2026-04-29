export const dynamic = 'force-dynamic'

import { TransactionsTable } from '@/components/features/payments/transactions-table';
import { paymentsService } from '@/types/payment';
const { cookies } = await import('next/headers');

export default async function TransactionsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    let paymentsData: any = null;
    let error = null;

    try {
        const response = await paymentsService.getAllPayments(token || '');
        paymentsData = response; 
    } catch (err) {
        console.error("Erro ao buscar transações:", err);
        error = err;
    }

    return (
        <div className="min-h-screen ">
            <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* Header responsivo */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">Gestão de Transações</h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Visualize e gerencie todas as transações da plataforma
                        </p>
                    </div>

                    {/* Estatísticas rápidas no header para mobile */}
                    {paymentsData && (
                        <div className="flex sm:hidden items-center gap-2">
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {paymentsData.total} transação(ões)
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1">
                    {error ? (
                        <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-4 sm:p-6 md:p-8 text-center">
                            <div className="text-red-600 font-medium mb-2 text-sm sm:text-base">
                                Erro ao carregar transações
                            </div>
                            <p className="text-red-500 text-xs sm:text-sm">
                                Não foi possível carregar as transações. Tente novamente mais tarde.
                            </p>
                        </div>
                    ) : (
                        <TransactionsTable paymentsData={paymentsData} />
                    )}
                </div>
            </main>
        </div>
    );
}
