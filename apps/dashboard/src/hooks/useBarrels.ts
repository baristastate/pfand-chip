import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Barrel {
  id: string;
  barrel_number: string;
  size_liters: number;
  status: string;
  current_batch_id?: string;
  created_at: string;
}

export const useBarrels = () => {
  const [barrels, setBarrels] = useState<Barrel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarrels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('barrels')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBarrels(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarrels();

    // Realtime subscription
    const channel = supabase
      .channel('public:barrels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barrels' }, () => {
        fetchBarrels();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { barrels, loading, error, refresh: fetchBarrels };
};
