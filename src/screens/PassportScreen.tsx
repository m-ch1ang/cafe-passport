import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useBadges } from '../hooks/useBadges';
import BadgeShelf from '../components/BadgeShelf';
import StampGrid from '../components/StampGrid';
import { Cafe } from '../lib/types';

type CheckInRow = {
  cafe_id: string | null;
  visit_number: number | null;
  cafes: Cafe | null;
};

export default function PassportScreen() {
  const navigation = useNavigation<any>();
  const { badges, userBadges, fetchBadges, fetchUserBadges } = useBadges();

  const [userId, setUserId] = useState<string | null>(null);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [uniqueCafes, setUniqueCafes] = useState(0);
  const [citiesCount, setCitiesCount] = useState(0);
  const [maxVisit, setMaxVisit] = useState(0);
  const [visitedCafes, setVisitedCafes] = useState<Cafe[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [profileRes, checkinsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('total_checkins, unique_cafes')
        .eq('id', userId)
        .single(),
      supabase
        .from('check_ins')
        .select('cafe_id, visit_number, cafes(id, name, neighborhood, city, lat, lng, checkin_count, osm_id, created_at)')
        .eq('user_id', userId),
    ]);

    if (profileRes.data) {
      setTotalCheckins(profileRes.data.total_checkins ?? 0);
      setUniqueCafes(profileRes.data.unique_cafes ?? 0);
    }

    const rows = (checkinsRes.data ?? []) as unknown as CheckInRow[];
    const cafeMap = new Map<string, Cafe>();
    const counts: Record<string, number> = {};
    const citySet = new Set<string>();
    let maxV = 0;

    for (const row of rows) {
      if (!row.cafe_id || !row.cafes) continue;
      cafeMap.set(row.cafe_id, row.cafes);
      const vn = row.visit_number ?? 1;
      counts[row.cafe_id] = Math.max(counts[row.cafe_id] ?? 0, vn);
      if (vn > maxV) maxV = vn;
      if (row.cafes.city) citySet.add(row.cafes.city);
    }

    setVisitedCafes(Array.from(cafeMap.values()));
    setVisitCounts(counts);
    setCitiesCount(citySet.size);
    setMaxVisit(maxV);

    await Promise.all([fetchBadges(), fetchUserBadges(userId)]);
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D4820A" />
      </View>
    );
  }

  const stats = { total_checkins: totalCheckins, unique_cafes: uniqueCafes, max_visit: maxVisit, cities: citiesCount };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D4820A" />
      }
    >
      <Text style={styles.screenTitle}>Passport</Text>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCheckins}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{uniqueCafes}</Text>
          <Text style={styles.statLabel}>Cafés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{citiesCount}</Text>
          <Text style={styles.statLabel}>Cities</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <BadgeShelf badges={badges} userBadges={userBadges} stats={stats} />

      <Text style={styles.sectionTitle}>Your Cafés</Text>
      <StampGrid
        cafes={visitedCafes}
        visitCounts={visitCounts}
        onPressCafe={(cafe) =>
          navigation.navigate('Map', { screen: 'CafeDetail', params: { cafe } })
        }
      />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C1810',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 30, fontWeight: '700', color: '#D4820A' },
  statLabel: { fontSize: 12, color: '#2C1810', opacity: 0.5, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#EDE6DF', marginVertical: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C1810',
    opacity: 0.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 12,
    marginTop: 4,
  },
});
