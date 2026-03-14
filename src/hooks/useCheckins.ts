import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckIn } from '../lib/types';

export function useCheckins() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const submitCheckin = async (userId: string, cafeId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('check_ins')
      .insert({ user_id: userId, cafe_id: cafeId })
      .select()
      .single();
    if (data) setCheckins(prev => [data, ...prev]);
    setLoading(false);
    return { data, error };
  };

  return { checkins, loading, submitCheckin };
}
