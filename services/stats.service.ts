// services/stats.service.ts
import { api } from "@/lib/api";
import { User } from "@/types/user";

export interface Job {
    id: number;
    title: string;
    description: string;
    status: string;
    price: number;
    clientId: number;
    workerId: number | null;
    serviceId: number | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface StatsData {
    totalJobs: number;
    totalUsers: number;
    totalRevenue: number;
    growthRate: number;
    workersCount: number;
    clientsCount: number;
    pendingJobs: number;
    completedJobs: number;
    inprogressJobs: number;
    cancelledJobs: number;
    acceptedJobs: number
}

export const statsService = {
    async getDashboardStats(): Promise<StatsData> {
        try {
            const [usersResponse, jobsResponse] = await Promise.all([
                api.get('/users'),
                api.get('/jobs')
            ]);

            const users: User[] = usersResponse.data.data.users;
            const jobs: Job[] = jobsResponse.data.data.jobs;
 
            const totalJobs = jobs.length;
            const totalUsers = users.length;

            const totalRevenue = jobs
                .filter(job => job.status === 'COMPLETED')
                .reduce((sum, job) => sum + job.price , 0);

            const workersCount = users.filter(user => user.role === 'WORKER').length;
            const clientsCount = users.filter(user => user.role === 'CLIENT').length;

            const pendingJobs = jobs.filter(job => job.status === 'PENDING').length;
            const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length;
            const inprogressJobs = jobs.filter(job => job.status === 'IN_PROGRESS').length;
            const cancelledJobs = jobs.filter(job => job.status === 'CANCELLED').length;
            const acceptedJobs = jobs.filter(job => job.status === 'ACCEPTED').length;

            const growthRate = Math.round((totalJobs / 30) * 100); // Exemplo simplificado
            return {
                totalJobs,
                totalUsers,
                totalRevenue,
                growthRate,
                workersCount,
                clientsCount,
                pendingJobs,
                completedJobs,
                inprogressJobs,
                cancelledJobs,
                acceptedJobs
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};