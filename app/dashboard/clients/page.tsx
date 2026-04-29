export const dynamic = 'force-dynamic'

import { UsersTable } from '@/components/features/users/users-table'; 
import { usersService } from '@/types/user';

export default async function ClientPage() {
  const clients = await usersService.getAllClients();

  return (
    <div className="">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Clientes</h1>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <UsersTable users={clients} />
          </div>
        </main>
    </div>
  );
}