export const dynamic = 'force-dynamic'

import { UsersTable } from '@/components/features/users/users-table';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CreateUserModal } from '@/components/features/users/create-user-modal';
import { usersService } from '@/types/user';

export default async function WorkersPage() {
  const workers = await usersService.getAllWorkers();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Trabalhadores</h1>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <UsersTable users={workers} />
      </div>
    </main>
  );
}