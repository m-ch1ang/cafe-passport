import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import CheckInCard, { FeedItem } from '../components/CheckInCard';
import { FeedStackParamList } from '../navigation/types';
import { Cafe } from '../lib/types';

type Props = NativeStackScreenProps<FeedStackParamList, 'FeedHome'>;

const FEED_SELECT = `
  id, visited_at, visit_number,
  profiles(id, username, avatar_url),
  cafes(id, name, neighborhood, city, lat, lng, checkin_count, osm_id, created_at),
  reviews(brew_method, rating, note, photo_url)
`;

export default function FeedScreen({ navigation }: Props) {
  const [tab, setTab] = useState<'friends' | 'discover'>('friends');
  const [userId, setUserId] = useState<string | null>(null);
  const [friendsFeed, setFriendsFeed] = useState<FeedItem[]>([]);
  const [discoverFeed, setDiscoverFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const loadFeeds = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    const followingIds = (follows ?? []).map((f) => f.following_id);

    const [friendsRes, discoverRes] = await Promise.all([
      supabase
        .from('check_ins')
        .select(FEED_SELECT)
        .in('user_id', followingIds.length > 0 ? followingIds : [''])
        .order('visited_at', { ascending: false })
        .limit(20),
      supabase
        .from('check_ins')
        .select(FEED_SELECT)
        .order('visited_at', { ascending: false })
        .limit(20),
    ]);

    setFriendsFeed((friendsRes.data as unknown as FeedItem[]) ?? []);
    setDiscoverFeed((discoverRes.data as unknown as FeedItem[]) ?? []);
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { loadFeeds(); }, [loadFeeds]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeeds();
    setRefreshing(false);
  };

  const navigateToCafe = (cafe: Cafe) => {
    (navigation as any).navigate('Map', { screen: 'CafeDetail', params: { cafe } });
  };

  const navigateToUser = (targetUserId: string) => {
    navigation.navigate('UserProfile', { userId: targetUserId });
  };

  const feed = tab === 'friends' ? friendsFeed : discoverFeed;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Feed</Text>
        <View style={styles.pills}>
          <TouchableOpacity
            style={[styles.pill, tab === 'friends' && styles.pillActive]}
            onPress={() => setTab('friends')}
          >
            <Text style={[styles.pillText, tab === 'friends' && styles.pillTextActive]}>
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, tab === 'discover' && styles.pillActive]}
            onPress={() => setTab('discover')}
          >
            <Text style={[styles.pillText, tab === 'discover' && styles.pillTextActive]}>
              Discover
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#D4820A" />
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D4820A" />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CheckInCard
              checkin={item}
              onPressCafe={navigateToCafe}
              onPressUser={navigateToUser}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>☕</Text>
              <Text style={styles.emptyText}>
                {tab === 'friends'
                  ? 'No check-ins yet. Follow some coffee lovers!'
                  : 'No check-ins yet. Be the first!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  topBar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FAF7F2' },
  screenTitle: { fontSize: 28, fontWeight: '700', color: '#2C1810', marginBottom: 12 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2C1810',
    backgroundColor: 'transparent',
  },
  pillActive: { backgroundColor: '#2C1810', borderColor: '#2C1810' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#2C1810' },
  pillTextActive: { color: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 8, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#2C1810', opacity: 0.5, textAlign: 'center', lineHeight: 24 },
});
