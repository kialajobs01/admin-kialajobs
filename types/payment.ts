export interface Payment {
  id: string;
  amount: number;
  status: 'HOLD' | 'RELEASED' | 'REFUNDED';
  method: 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
  jobId?: string;
  createdAt: string;
  subscriptionId?: string;
  paymentIntentId?: string;
  userId?: string;
  Job?: {
    id: string;
    title: string;
    clientId: string;
    workerId?: string;
    client: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    worker?: {
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
      };
    };
  };
  Subscription?: {
    id: string;
    plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface PaymentsResponse {
  message: string;
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalAmount: number;
    totalCount: number;
    statusBreakdown: {
      [key: string]: {
        count: number;
        amount: number;
      };
    };
    methodBreakdown: {
      [key: string]: {
        count: number;
        amount: number;
      };
    };
  };
}

export interface PaymentStatsResponse {
  message: string;
  overview: {
    totalPayments: number;
    totalAmount: number;
    currentMonth: {
      count: number;
      amount: number;
    };
    previousMonth: {
      count: number;
      amount: number;
    };
    growthRate: number;
  };
  statusBreakdown: {
    [key: string]: {
      count: number;
      amount: number;
      percentage: number;
    };
  };
  recentPayments: Payment[];
}

export const paymentsService = {
  async getAllPayments(
    token: string, 
    page: number = 1, 
    limit: number = 50,
    filters?: { status?: string; method?: string; startDate?: string; endDate?: string }
  ): Promise<PaymentsResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/all?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    return data.data; 
    
  },

  async getPaymentStats(token: string): Promise<PaymentStatsResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment stats');
    }

    return response.json();
  },

  async updatePaymentStatus(paymentId: string, status: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/${paymentId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }
  },

  async getPaymentById(paymentId: string, token: string): Promise<{ payment: Payment }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    return response.json();
  }
};