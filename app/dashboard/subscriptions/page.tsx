export const dynamic = 'force-dynamic'

import { SubscriptionsTable } from '@/components/features/subiscripions/subscriptions-table';
import { subscriptionsService } from '@/types/subscription';

const { cookies } = await import('next/headers');

export default async function SubscriptionsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    let subscriptionsData: any = null;
    let error = null;

    try {
        subscriptionsData = await subscriptionsService.getAllSubscriptions(token || '');
        console.log("Dados das subscrições:", subscriptionsData);
    } catch (err) {
        console.error("Erro ao buscar subscrições:", err);
        error = err;
    }

    return (
        <div className="min-h-screen">
            <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">Gestão de Subscrições</h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Gerencie todas as subscrições da plataforma
                        </p>
                    </div>
                     
                    {subscriptionsData && (
                        <div className="flex sm:hidden items-center gap-2">
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {subscriptionsData.total} subscrição(ões)
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1">
                    {error ? (
                        <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-4 sm:p-6 md:p-8 text-center">
                            <div className="text-red-600 font-medium mb-2 text-sm sm:text-base">
                                Erro ao carregar subscrições
                            </div>
                            <p className="text-red-500 text-xs sm:text-sm">
                                Não foi possível carregar as subscrições. Tente novamente mais tarde.
                            </p>
                        </div>
                    ) : (
                        <SubscriptionsTable subscriptionsData={subscriptionsData} />
                    )}
                </div>
            </main>
        </div>
    );
}