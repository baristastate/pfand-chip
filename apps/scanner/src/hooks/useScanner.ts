import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBarrelStatus = async (rfidUid: string, newStatus: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Find barrel by RFID
      const { data: tag, error: tagError } = await supabase
        .from('rfid_tags')
        .select('barrel_id')
        .eq('rfid_uid', rfidUid)
        .single();

      if (tagError) throw new Error('RFID Tag nicht gefunden');

      // 2. Update barrel status
      const { error: updateError } = await supabase
        .from('barrels')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', tag.barrel_id);

      if (updateError) throw updateError;

      // 3. Log movement
      await supabase.from('barrel_movements').insert({
        barrel_id: tag.barrel_id,
        to_status: newStatus,
        moved_by: null, // Should be current user ID
        location_type: newStatus === 'AT_CUSTOMER' ? 'CUSTOMER' : 'BREWERY'
      });

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { updateBarrelStatus, loading, error };
};
