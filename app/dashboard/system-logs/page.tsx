export const dynamic = 'force-dynamic'

import { LogsTable } from '@/components/features/logs/logs-table';
import { getLogsServer } from '@/lib/logs-service';
import { cookies } from 'next/headers';

async function getLogs() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) { 
      return [];
    }

    const logs = await getLogsServer(token);
    return logs;
  } catch (error) {
    console.error('Error fetching logs in server component:', error);
    return [];
  }
}

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <div className=" ">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Logs do Sistema</h1>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <LogsTable logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
}
