export const dynamic = 'force-dynamic'

import { VerificationRequestsTable } from '@/components/features/verification/verification-requests-table';
import { api } from '@/lib/api';
import { cookies } from 'next/headers';

interface VerificationRequest {
    id: string;
    workerId: string;
    idDocumentFront: string;
    idDocumentBack: string;
    selfieWithId: string;
    workPhotos: string[];
    certificates: string[];
    operatingAreas: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGES' | 'UNDER_REVIEW';
    rejectionReason: string | null;
    reviewedById: string | null;
    reviewedAt: string | null;
    submittedAt: string;
    updatedAt: string;
    municipality: string;
    profession: string;
    province: string;
    verificationVideo: string;
    yearsExperience: number;
    worker: {
        id: string;
        userId: string;
        bio: string | null;
        skills: string[];
        experience: number | null;
        averageRating: number | null;
        avatar: string | null;
        title: string | null;
        isVerified: boolean;
        municipality: string | null;
        operatingAreas: string[];
        province: string | null;
        coverUrl: string | null;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    };
    reviewedBy: {
        id: string;
        user: {
            name: string;
            email: string;
        };
    } | null;
}

async function getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            console.log('No token found in cookies');
            return [];
        }

        const response = await api.get('/verification/all-requests', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data.verificationRequests || [];
    } catch (error) {
        console.error('Error fetching verification requests:', error);
        return [];
    }
}

async function getPendingRequestsCount(): Promise<number> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return 0;

        const response = await api.get('/verification/all-requests', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const requests = response.data.data.verificationRequests || [];
        return requests.filter((req: VerificationRequest) => req.status === 'PENDING').length;
    } catch (error) {
        console.error('Error fetching pending requests count:', error);
        return 0;
    }
}

export default async function VerificationRequestsPage() {
    const [requests, pendingCount] = await Promise.all([
        getVerificationRequests(),
        getPendingRequestsCount()
    ]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">Pedidos de Verificação</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {requests.length} pedido(s) encontrado(s) • {pendingCount} pendente(s)
                    </p>
                </div>
            </div>
            <VerificationRequestsTable requests={requests} />
        </main>
    );
}