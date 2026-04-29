import { api, serverApi } from './api';

interface Log {
  id: string;
  action: string;
  description: string;
  userId: string;
  adminId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  relatedId: string | null;
  metadata: any;
  level: 'INFO' | 'WARN' | 'ERROR';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  admin: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
}

export async function getLogsClient(): Promise<Log[]> {
  try {
    const response = await api.get('/admin/logs');
    return response.data.data.logs;
  } catch (error) {
    console.error('Error fetching logs (client):', error);
    throw error;
  }
}

export async function getLogsServer(token: string): Promise<Log[]> {
  try {
    const response = await serverApi(token).get('/admin/logs');
    return response.data.data.logs;
  } catch (error) {
    console.error('Error fetching logs (server):', error);
    throw error;
  }
}

export async function getLogs(token?: string): Promise<Log[]> {
  if (typeof window === 'undefined') {
    if (!token) {
      throw new Error('Token is required for server-side requests');
    }
    return getLogsServer(token);
  } else {
    return getLogsClient();
  }
}