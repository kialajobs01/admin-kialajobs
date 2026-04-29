export const dynamic = 'force-dynamic'

import { UsersTable } from '@/components/features/users/users-table'; 
import { usersService } from '@/types/user';

export default async function BlockedUsersPage() {
  const usersBlocked = await usersService.getAllBlockedUsers();

  return (
    <div className="  ">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Usuários Bloqueados</h1>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <UsersTable users={usersBlocked} />
          </div>
        </main>
      </div>
  );
}