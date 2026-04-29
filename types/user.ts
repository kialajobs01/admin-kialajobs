import { api } from "@/lib/api";

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    isLoggedIn: boolean;
    role: 'CLIENT' | 'WORKER' | 'ADMIN';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    isBlocked: boolean;
    blockedAt?: string;
    blockedById?: string;
    blockReason?: string;
    provider?: string;
    providerId?: string;
    verified: boolean;
    isDeleted: boolean;
    deleteRequested: boolean;
    deleteRequestedAt?: string;
    token?: string;
    worker: Worker;
    client:any;
}

export interface DeleteRequest {
    id: string;
    userId: string;
    user: User;
    reason?: string;
    requestedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewReason?: string;
}


interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'WORKER' | 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
}

interface UpdateUserDto {
    name?: string;
    phone?: string;
    role?: 'WORKER' | 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
}

export const usersService = {
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data.data.users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },


    async getAllWorkers(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data.data.users.filter((user: User) =>
                ['WORKER'].includes(user.role)
            );
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },


    async getAllBlockedUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data.data.users.filter((user: User) => user.isBlocked);
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async getAllClients(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data.data.users.filter((user: User) =>
                ['CLIENT'].includes(user.role)
            );
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async getAdmins(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data.data.users.filter((user: User) =>
                ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
            );
        } catch (error) {
            console.error('Error fetching admins:', error);
            throw error;
        }
    },

    async createUser(userData: CreateUserDto): Promise<User> {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data.data.user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
        try {
            const response = await api.patch(`/users/edit/user/${userId}`, userData);
            return response.data.data.user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async promoteToAdmin(userId: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/role`, { role: 'ADMIN' });
            return response.data.data.user;
        } catch (error) {
            console.error('Error promoting user to admin:', error);
            throw error;
        }
    },

    async blockUser(userId: string, reason?: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/block`, { reason });
            return response.data.data.user;
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    async unblockUser(userId: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/unblock`);
            return response.data.data.user;
        } catch (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    },

    async verifyUser(userId: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/verify`);
            return response.data.data.user;
        } catch (error) {
            console.error('Error verifying user:', error);
            throw error;
        }
    },

    async unverifyUser(userId: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/unverify`);
            return response.data.data.user;
        } catch (error) {
            console.error('Error unverifying user:', error);
            throw error;
        }
    },

    async deleteUser(userId: string): Promise<void> {
        try {
            await api.delete(`/users/${userId}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    async recoverUser(userId: string): Promise<User> {
        try {
            const response = await api.patch(`/users/${userId}/recover`);
            return response.data.data.user;
        } catch (error) {
            console.error('Error recovering user:', error);
            throw error;
        }
    },

 
async getDeleteRequests(token: string): Promise<User[]> {
    try {
        if (!token) {
            console.log('No token found in cookies');
            return [];
        }

        const response = await api.get('/account/get-deleted-requests', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('API Response:', {
            status: response.status,
            data: response.data
        });
 
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && response.data.data) {
            return response.data.data;
        } else {
            console.warn('Unexpected response structure:', response.data);
            return [];
        }

    } catch (error: any) {
        console.error('Error fetching delete requests:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
         
        return [];
    }
},

    async approveDeleteRequest(requestId: string): Promise<void> {
        try {
            await api.delete(`/account/admin/users/${requestId}`);
        } catch (error) {
            console.error('Error approving delete request:', error);
            throw error;
        }
    },

    async rejectDeleteRequest(requestId: string, reason?: string): Promise<void> {
        try {
            await api.patch(`/account/reject-delete-request/${requestId}`, { reason });
        } catch (error) {
            console.error('Error rejecting delete request:', error);
            throw error;
        }
    },
};