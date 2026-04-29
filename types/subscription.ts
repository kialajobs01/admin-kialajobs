export interface Subscription {
  id: string;
  userId: string;
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PENDING';
  isActive: boolean;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  paymentMethod: 'CARD' | 'MBWAY' | 'BANK_TRANSFER' | 'OTHER';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SubscriptionsResponse {
  message: string;
  subscriptions: Subscription[];
  total: number;
}

export const subscriptionsService = {
  async getAllSubscriptions(token: string): Promise<SubscriptionsResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  },

  async cancelSubscription(subscriptionId: string, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  },

  async updateSubscription(subscriptionId: string, data: any, token: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }
  }
};