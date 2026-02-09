import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PromoCode {
  id: string;
  code: string;
  type: 'free_credits' | 'discount';
  value: number;
  max_uses: number | null;
  current_uses: number;
  max_uses_per_user: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export interface PromoCodeStats {
  totalCodes: number;
  activeCodes: number;
  totalRedemptions: number;
  totalCreditsAwarded: number;
  thisMonthRedemptions: number;
}

interface CreateCodeData {
  code: string;
  type: 'free_credits' | 'discount';
  value: number;
  max_uses?: number | null;
  max_uses_per_user?: number;
  valid_from?: string;
  valid_until?: string | null;
  description?: string;
}

interface BatchGenerateData {
  prefix: string;
  count: number;
  value: number;
  type?: 'free_credits' | 'discount';
  max_uses_per_user?: number;
  valid_until?: string | null;
  description?: string;
}

export function useAdminPromoCode() {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<PromoCodeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin status
  const checkAdminStatus = useCallback(async () => {
    if (!session?.access_token) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'stats' },
      });

      // If we can fetch stats, user is admin
      if (!error && data?.stats) {
        setIsAdmin(true);
        setStats(data.stats);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Fetch all codes
  const fetchCodes = useCallback(async () => {
    if (!session?.access_token || !isAdmin) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'list' },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, isAdmin]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!session?.access_token || !isAdmin) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'stats' },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [session?.access_token, isAdmin]);

  // Create a new code
  const createCode = useCallback(async (codeData: CreateCodeData): Promise<PromoCode | null> => {
    if (!session?.access_token || !isAdmin) return null;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'create', data: codeData },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Refresh codes list
      await fetchCodes();
      await fetchStats();

      return data.code;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, isAdmin, fetchCodes, fetchStats]);

  // Update a code
  const updateCode = useCallback(async (id: string, updateData: Partial<PromoCode>): Promise<PromoCode | null> => {
    if (!session?.access_token || !isAdmin) return null;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'update', data: { id, ...updateData } },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Refresh codes list
      await fetchCodes();

      return data.code;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, isAdmin, fetchCodes]);

  // Delete a code
  const deleteCode = useCallback(async (id: string): Promise<boolean> => {
    if (!session?.access_token || !isAdmin) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'delete', data: { id } },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Refresh codes list
      await fetchCodes();
      await fetchStats();

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, isAdmin, fetchCodes, fetchStats]);

  // Generate batch codes
  const generateBatch = useCallback(async (batchData: BatchGenerateData): Promise<string[]> => {
    if (!session?.access_token || !isAdmin) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-promo-codes', {
        body: { action: 'generate_batch', data: batchData },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Refresh codes list
      await fetchCodes();
      await fetchStats();

      return data.codes || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, isAdmin, fetchCodes, fetchStats]);

  // Export codes to CSV
  const exportCsv = useCallback(() => {
    if (!codes.length) return;

    const headers = ['Code', 'Type', 'Valeur', 'Utilisations', 'Limite', 'Expire', 'Actif', 'Description'];
    const rows = codes.map(code => [
      code.code,
      code.type === 'free_credits' ? 'Crédits' : 'Réduction',
      code.value.toString(),
      `${code.current_uses}/${code.max_uses ?? '∞'}`,
      code.max_uses?.toString() ?? 'Illimité',
      code.valid_until ? new Date(code.valid_until).toLocaleDateString('fr-FR') : 'Jamais',
      code.is_active ? 'Oui' : 'Non',
      code.description ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codes-promo-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [codes]);

  return {
    isAdmin,
    isCheckingAdmin,
    codes,
    stats,
    isLoading,
    error,
    fetchCodes,
    fetchStats,
    createCode,
    updateCode,
    deleteCode,
    generateBatch,
    exportCsv,
  };
}
