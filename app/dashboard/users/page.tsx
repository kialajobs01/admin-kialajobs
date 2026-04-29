export const dynamic = 'force-dynamic'

import { UsersTable } from '@/components/features/users/users-table'; 
import { api } from '@/lib/api';

async function getUsers() {
    try {
        const response = await api.get('/users');
        return response.data.data.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className=" ">
            <div className="flex flex-col">
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold md:text-2xl">Todos Utilizadores</h1>
                        <div className="flex gap-2">
                            {/* Botões de ação podem ser adicionados aqui */}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <UsersTable users={users} />
                    </div>
                </main>
            </div>
        </div>
    );
}