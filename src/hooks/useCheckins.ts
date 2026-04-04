import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckIn } from '../lib/types';

type CheckInWithReview = CheckIn & {
  reviews: {
    brew_method: string | null;
    rating: number | null;
    note: string | null;
    photo_url: string | null;
  }[];
};

async function uploadPhoto(photoUri: string, checkinId: string): Promise<string | null> {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const ext = photoUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${checkinId}.${ext}`;
    const { error } = await supabase.storage
      .from('review-photos')
      .upload(path, blob, { contentType: `image/${ext}`, upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('review-photos').getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export function useCheckins() {
  const [checkins, setCheckins] = useState<CheckInWithReview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCheckins = async (userId: string, cafeId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('check_ins')
      .select('*, reviews(*)')
      .eq('user_id', userId)
      .eq('cafe_id', cafeId)
      .order('visited_at', { ascending: false });
    setCheckins((data as CheckInWithReview[]) ?? []);
    setLoading(false);
  };

  const submitCheckin = async (
    cafeId: string,
    brewMethod: string,
    rating: number,
    note: string,
    photoUri: string | null,
  ): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setLoading(false);
      return { success: false, error: 'Not authenticated' };
    }
    const userId = userData.user.id;

    const { count } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('cafe_id', cafeId);

    const visitNumber = (count ?? 0) + 1;

    const { data: checkinData, error: checkinError } = await supabase
      .from('check_ins')
      .insert({ user_id: userId, cafe_id: cafeId, visit_number: visitNumber })
      .select()
      .single();

    if (checkinError || !checkinData) {
      setLoading(false);
      return { success: false, error: checkinError?.message ?? 'Failed to save check-in' };
    }

    let photoUrl: string | null = null;
    if (photoUri) {
      photoUrl = await uploadPhoto(photoUri, checkinData.id);
    }

    const { error: reviewError } = await supabase.from('reviews').insert({
      checkin_id: checkinData.id,
      brew_method: brewMethod || null,
      rating: rating || null,
      note: note.trim() || null,
      photo_url: photoUrl,
    });

    if (reviewError) {
      setLoading(false);
      return { success: false, error: reviewError.message };
    }

    await supabase.rpc('increment_cafe_checkin', { p_cafe_id: cafeId });
    await supabase.rpc('increment_user_stats', { p_user_id: userId, p_cafe_id: cafeId });

    setLoading(false);
    return { success: true, error: null };
  };

  return { checkins, loading, fetchCheckins, submitCheckin };
}
