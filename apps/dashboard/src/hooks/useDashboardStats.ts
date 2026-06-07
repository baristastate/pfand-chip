import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    activeBarrels: 0,
    atCustomer: 0,
    maintenance: 0,
    totalDeposit: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get counts for different statuses
      const { data: barrelCounts, error: countError } = await supabase
        .from('barrels')
        .select('status');

      if (countError) throw countError;

      const counts = (barrelCounts || []).reduce((acc: any, b) => {
        acc.total++;
        if (b.status === 'AT_CUSTOMER') acc.atCustomer++;
        if (b.status === 'MAINTENANCE' || b.status === 'DAMAGED') acc.maintenance++;
        return acc;
      }, { total: 0, atCustomer: 0, maintenance: 0 });

      // Get total deposit balance
      const { data: accounts, error: depositError } = await supabase
        .from('deposit_accounts')
        .select('balance');

      if (depositError) throw depositError;

      const totalDeposit = (accounts || []).reduce((sum, acc) => sum + Number(acc.balance), 0);

      setStats({
        activeBarrels: counts.total,
        atCustomer: counts.atCustomer,
        maintenance: counts.maintenance,
        totalDeposit
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Subscribe to multiple tables to refresh stats
    const barrelChannel = supabase.channel('stats-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barrels' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_accounts' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(barrelChannel);
    };
  }, []);

  return { stats, loading };
};
