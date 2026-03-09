import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ConnectedAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  email: string;
  created_at: string;
}

interface NewAccount {
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token: string;
  email: string;
}

export function useConnectedAccounts() {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/accounts', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (e) {
      console.error('Failed to fetch accounts:', e);
    }
    setLoading(false);
  }

  async function addAccount(account: NewAccount) {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      } as Record<string, string>,
      body: JSON.stringify(account)
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add account');
    }
    
    await fetchAccounts();
  }

  async function removeAccount(id: string) {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      throw new Error('Failed to remove account');
    }
    
    await fetchAccounts();
  }

  return { accounts, loading, addAccount, removeAccount, refetch: fetchAccounts };
}
