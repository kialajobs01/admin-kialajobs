export const dynamic = 'force-dynamic'


import { JobsGrid } from '@/components/features/jobs/jobs-grid'; 
import { api } from '@/lib/api';
import { cookies } from 'next/headers';

interface Job {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    price: number;
    clientId: string;
    workerId: string | null;
    serviceId: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    isRemote: boolean;
    location: string | null;
    client: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
    };
    worker: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    } | null;
    category: {
        id: string;
        name: string;
    };
    media: Array<{
        id: string;
        url: string;
        type: 'IMAGE' | 'VIDEO';
    }>;
    tags: Array<{
        id: string;
        name: string;
    }>;
    JobApplication: Array<{
        id: string;
        status: string;
        worker: {
            user: {
                name: string;
            };
        };
    }>;
    Payment: {
        id: string;
        status: string;
        amount: number;
    } | null;
}

async function getJobs(): Promise<Job[]> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            console.log('No token found in cookies');
            return [];
        }

        const response = await api.get('/jobs', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data.jobs || [];
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

async function getJobsCount(): Promise<number> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return 0;

        const response = await api.get('/jobs', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data.jobs?.length || 0;
    } catch (error) {
        console.error('Error fetching jobs count:', error);
        return 0;
    }
}

export default async function JobsPage() {
    const [jobs, jobsCount] = await Promise.all([
        getJobs(),
        getJobsCount()
    ]);

    return (
        <div  >
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Todos os Trabalhos</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {jobs.length} trabalho(s) encontrado(s)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Botões de ação podem ser adicionados aqui */}
                    </div>
                </div>
                <JobsGrid jobs={jobs} />
            </main>
        </div>
    );
}