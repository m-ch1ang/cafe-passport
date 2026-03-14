import { useState } from 'react';
import { Badge, UserBadge } from '../lib/types';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(false);

  return { badges, userBadges, loading };
}
