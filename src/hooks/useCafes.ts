import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cafe } from '../lib/types';

export function useCafes() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyCafes = async (_lat: number, _lng: number) => {
    setLoading(true);
    const { data, error } = await supabase.from('cafes').select('*');
    if (error) setError(error.message);
    else setCafes(data ?? []);
    setLoading(false);
  };

  return { cafes, loading, error, fetchNearbyCafes };
}
