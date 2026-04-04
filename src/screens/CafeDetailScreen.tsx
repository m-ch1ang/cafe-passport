import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MapStackParamList } from '../navigation/types';
import { useCheckins } from '../hooks/useCheckins';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<MapStackParamList, 'CafeDetail'>;

const STAR = '★';
const EMPTY_STAR = '☆';

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (i < r ? STAR : EMPTY_STAR)).join('')}
    </Text>
  );
}

export default function CafeDetailScreen({ route, navigation }: Props) {
  const { cafe } = route.params;
  const { checkins, loading, fetchCheckins } = useCheckins();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const load = useCallback(() => {
    if (userId) fetchCheckins(userId, cafe.id);
  }, [userId, cafe.id]);

  useFocusEffect(load);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCheckins(userId!, cafe.id);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D4820A" />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.cafeName}>{cafe.name}</Text>
              {(cafe.neighborhood || cafe.city) && (
                <Text style={styles.cafeLocation}>
                  {[cafe.neighborhood, cafe.city].filter(Boolean).join(', ')}
                </Text>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{cafe.checkin_count ?? 0}</Text>
                <Text style={styles.statLabel}>Total check-ins</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{checkins.length}</Text>
                <Text style={styles.statLabel}>My visits</Text>
              </View>
            </View>

            {loading && checkins.length === 0 && (
              <ActivityIndicator color="#D4820A" style={{ marginTop: 32 }} />
            )}

            {checkins.length > 0 && (
              <Text style={styles.sectionTitle}>My Visits</Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const review = item.reviews?.[0];
          const date = item.visited_at
            ? new Date(item.visited_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '';
          return (
            <View style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <Text style={styles.visitNumber}>Visit #{item.visit_number ?? '?'}</Text>
                <Text style={styles.visitDate}>{date}</Text>
              </View>
              {review && (
                <>
                  <Stars rating={review.rating} />
                  {review.brew_method && (
                    <Text style={styles.brewMethod}>{review.brew_method}</Text>
                  )}
                  {review.note ? <Text style={styles.noteText}>{review.note}</Text> : null}
                </>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No visits yet. Check in to get started!</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => navigation.navigate('CheckInModal', { cafe })}
        >
          <Text style={styles.checkInButtonText}>Check In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: { padding: 24, paddingBottom: 16 },
  cafeName: { fontSize: 28, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  cafeLocation: { fontSize: 15, color: '#2C1810', opacity: 0.55 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#D4820A' },
  statLabel: { fontSize: 12, color: '#2C1810', opacity: 0.55, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E8DDD8', marginVertical: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C1810',
    opacity: 0.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  visitHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  visitNumber: { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  visitDate: { fontSize: 13, color: '#2C1810', opacity: 0.5 },
  stars: { fontSize: 16, color: '#D4820A', marginBottom: 4 },
  brewMethod: {
    fontSize: 13,
    color: '#2C1810',
    opacity: 0.65,
    marginBottom: 4,
  },
  noteText: { fontSize: 14, color: '#2C1810', lineHeight: 20 },
  emptyText: {
    textAlign: 'center',
    color: '#2C1810',
    opacity: 0.45,
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FAF7F2',
    borderTopWidth: 1,
    borderTopColor: '#EDE6DF',
  },
  checkInButton: {
    backgroundColor: '#D4820A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInButtonText: { color: '#FAF7F2', fontSize: 17, fontWeight: '700' },
});
