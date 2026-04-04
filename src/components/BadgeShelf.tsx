import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Badge, UserBadge } from '../lib/types';

type Stats = {
  total_checkins: number;
  unique_cafes: number;
  max_visit: number;
  cities: number;
};

type Props = {
  badges: Badge[];
  userBadges: UserBadge[];
  stats?: Stats;
};

function currentProgress(badge: Badge, stats: Stats): number {
  switch (badge.trigger_type) {
    case 'total_checkins': return stats.total_checkins;
    case 'unique_cafes':   return stats.unique_cafes;
    case 'same_cafe':      return stats.max_visit;
    case 'cities':         return stats.cities;
    default:               return 0;
  }
}

function progressLabel(badge: Badge): string {
  switch (badge.trigger_type) {
    case 'total_checkins': return 'check-ins';
    case 'unique_cafes':   return 'cafés';
    case 'same_cafe':      return 'visits';
    case 'cities':         return 'cities';
    default:               return '';
  }
}

export default function BadgeShelf({ badges, userBadges, stats }: Props) {
  const earnedIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <FlatList
      data={badges}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const earned = earnedIds.has(item.id);
        const progress = stats ? currentProgress(item, stats) : 0;
        const label = progressLabel(item);
        return (
          <View style={[styles.card, earned ? styles.cardEarned : styles.cardLocked]}>
            <Text style={styles.icon}>{earned ? '☕' : '🔒'}</Text>
            <Text style={[styles.name, earned ? styles.nameEarned : styles.nameLocked]} numberOfLines={2}>
              {item.name}
            </Text>
            {earned ? (
              <Text style={styles.earnedLabel}>Earned</Text>
            ) : (
              <Text style={styles.progress}>
                {progress} / {item.trigger_value} {label}
              </Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.empty}>No badges yet</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, gap: 10 },
  card: {
    width: 100,
    height: 120,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardEarned: { backgroundColor: '#D4820A' },
  cardLocked: { backgroundColor: '#E8E8E8' },
  icon: { fontSize: 24 },
  name: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  nameEarned: { color: '#FFFFFF' },
  nameLocked: { color: '#888888' },
  earnedLabel: { fontSize: 10, color: '#FFFFFF', opacity: 0.85, fontWeight: '500' },
  progress: { fontSize: 10, color: '#888888', textAlign: 'center' },
  empty: { color: '#2C1810', opacity: 0.4, fontSize: 14, paddingLeft: 8 },
});
