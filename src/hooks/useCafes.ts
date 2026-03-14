import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cafe } from '../lib/types';

type OverpassElement = {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    'addr:suburb'?: string;
    'addr:city'?: string;
  };
};

type OverpassResponse = {
  elements: OverpassElement[];
};

export function useCafes() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyCafes = async (lat: number, lng: number, radiusMeters = 2000) => {
    setLoading(true);
    setError(null);

    try {
      const query = `[out:json][timeout:25];node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});out body;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Overpass API error');
      const json: OverpassResponse = await res.json();

      const cafesToUpsert = json.elements.map((el) => ({
        osm_id: el.id.toString(),
        name: el.tags?.name ?? 'Unnamed Café',
        lat: el.lat,
        lng: el.lon,
        neighborhood: el.tags?.['addr:suburb'] ?? null,
        city: el.tags?.['addr:city'] ?? null,
        checkin_count: 0,
      }));

      if (cafesToUpsert.length === 0) {
        setCafes([]);
        return;
      }

      const { data, error: upsertError } = await supabase
        .from('cafes')
        .upsert(cafesToUpsert, { onConflict: 'osm_id' })
        .select();

      if (upsertError) {
        setError(upsertError.message);
      } else {
        setCafes(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cafés');
    } finally {
      setLoading(false);
    }
  };

  return { cafes, loading, error, fetchNearbyCafes };
}
