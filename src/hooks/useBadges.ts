import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, UserBadge } from '../lib/types';

export type UserBadgeWithBadge = UserBadge & { badges: Badge | null };

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_checkins, unique_cafes')
    .eq('id', userId)
    .single();
  if (!profile) return [];

  const { data: allBadges } = await supabase.from('badges').select('*');
  if (!allBadges || allBadges.length === 0) return [];

  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);
  const earnedIds = new Set((earned ?? []).map((ub) => ub.badge_id));

  const unearnedBadges = allBadges.filter((b) => !earnedIds.has(b.id));
  if (unearnedBadges.length === 0) return [];

  let maxVisitNumber = 0;
  if (unearnedBadges.some((b) => b.trigger_type === 'same_cafe')) {
    const { data: visits } = await supabase
      .from('check_ins')
      .select('visit_number')
      .eq('user_id', userId)
      .order('visit_number', { ascending: false })
      .limit(1);
    maxVisitNumber = visits?.[0]?.visit_number ?? 0;
  }

  let citiesCount = 0;
  if (unearnedBadges.some((b) => b.trigger_type === 'cities')) {
    const { data: cityRows } = await supabase
      .from('check_ins')
      .select('cafes(city)')
      .eq('user_id', userId);
    const citySet = new Set(
      (cityRows ?? [])
        .map((row: { cafes: { city: string | null } | null }) => row.cafes?.city)
        .filter((c): c is string => c != null && c !== ''),
    );
    citiesCount = citySet.size;
  }

  const newlyEarned: Badge[] = [];
  for (const badge of unearnedBadges) {
    let qualifies = false;
    switch (badge.trigger_type) {
      case 'total_checkins':
        qualifies = (profile.total_checkins ?? 0) >= badge.trigger_value;
        break;
      case 'unique_cafes':
        qualifies = (profile.unique_cafes ?? 0) >= badge.trigger_value;
        break;
      case 'same_cafe':
        qualifies = maxVisitNumber >= badge.trigger_value;
        break;
      case 'cities':
        qualifies = citiesCount >= badge.trigger_value;
        break;
    }
    if (qualifies) newlyEarned.push(badge);
  }

  if (newlyEarned.length > 0) {
    await supabase.from('user_badges').insert(
      newlyEarned.map((b) => ({ user_id: userId, badge_id: b.id })),
    );
  }

  return newlyEarned.map((b) => b.name);
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeWithBadge[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBadges = async () => {
    const { data } = await supabase.from('badges').select('*');
    setBadges(data ?? []);
  };

  const fetchUserBadges = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);
    setUserBadges((data as UserBadgeWithBadge[]) ?? []);
    setLoading(false);
  };

  return { badges, userBadges, loading, fetchBadges, fetchUserBadges, checkAndAwardBadges };
}
