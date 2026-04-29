export const dynamic = 'force-dynamic'

import { DeleteRequestsTable } from '@/components/features/users/delete-requests-table';
import { usersService } from '@/types/user';
const { cookies } = await import('next/headers');

export default async function DeleteRequestsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    let deleteRequests: any = [];
    let error = null;

    try {
        deleteRequests = await usersService.getDeleteRequests(token || '');
        console.log("Dados da requisicao", deleteRequests);
    } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        error = err;
        deleteRequests = []; // Garantir que não seja undefined
    }

    if (!deleteRequests) {
        deleteRequests = [];
    }

    return (
        <div className="min-h-screen ">
            <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* Header responsivo */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold sm:text-xl md:text-2xl">Pedidos de Eliminação</h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Gerencie os pedidos de eliminação de conta dos usuários
                        </p>
                    </div>
                    
                    {/* Estatísticas rápidas no header para mobile */}
                    <div className="flex sm:hidden items-center gap-2">
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            {deleteRequests.length} pendente(s)
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1">
                    {error ? (
                        <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-4 sm:p-6 md:p-8 text-center">
                            <div className="text-red-600 font-medium mb-2 text-sm sm:text-base">
                                Erro ao carregar pedidos
                            </div>
                            <p className="text-red-500 text-xs sm:text-sm">
                                Não foi possível carregar os pedidos de eliminação. Tente novamente mais tarde.
                            </p>
                        </div>
                    ) : (
                        <DeleteRequestsTable requests={deleteRequests} />
                    )}
                </div>
            </main>
        </div>
    );
}