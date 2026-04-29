export const dynamic = 'force-dynamic'

import { UsersTable } from '@/components/features/users/users-table'; 
import { CreateUserModal } from '@/components/features/users/create-user-modal';
import { usersService } from '@/types/user';

export default async function AdminPage() {
  const users = await usersService.getAdmins();

  return (
    <div className=" ">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Administradores</h1>
            <div className="flex gap-2">
              <CreateUserModal defaultRole="ADMIN" />
            </div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <UsersTable users={users} />
          </div>
        </main>
    </div>
  );
}