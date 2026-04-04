import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import CheckInCard, { FeedItem } from '../components/CheckInCard';
import { FeedStackParamList } from '../navigation/types';
import { Cafe, Profile } from '../lib/types';

const FEED_SELECT = `
  id, visited_at, visit_number,
  profiles(id, username, avatar_url),
  cafes(id, name, neighborhood, city, lat, lng, checkin_count, osm_id, created_at),
  reviews(brew_method, rating, note, photo_url)
`;

type Stats = {
  followers: number;
  following: number;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<FeedStackParamList, 'UserProfile'>>();
  const paramUserId: string | undefined = (route.params as any)?.userId;

  const [myId, setMyId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ followers: 0, following: 0 });
  const [checkins, setCheckins] = useState<FeedItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !paramUserId || paramUserId === myId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setMyId(data.user.id);
        setTargetId(paramUserId ?? data.user.id);
      }
    });
  }, [paramUserId]);

  const loadData = useCallback(async () => {
    if (!targetId || !myId) return;
    setLoading(true);

    const [profileRes, followersRes, followingRes, checkinsRes, followingMeRes] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', targetId).single(),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', targetId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', targetId),
        supabase
          .from('check_ins')
          .select(FEED_SELECT)
          .eq('user_id', targetId)
          .order('visited_at', { ascending: false })
          .limit(10),
        !isOwnProfile
          ? supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('follower_id', myId)
              .eq('following_id', targetId)
          : Promise.resolve({ count: 0 }),
      ]);

    setProfile(profileRes.data ?? null);
    setStats({
      followers: followersRes.count ?? 0,
      following: followingRes.count ?? 0,
    });
    setCheckins((checkinsRes.data as unknown as FeedItem[]) ?? []);
    if (!isOwnProfile) {
      setIsFollowing((followingMeRes.count ?? 0) > 0);
    }
    setLoading(false);
  }, [targetId, myId, isOwnProfile]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!myId || !targetId) return;
    setFollowLoading(true);
    if (isFollowing) {
      setIsFollowing(false);
      setStats((s) => ({ ...s, followers: s.followers - 1 }));
      await supabase.from('follows').delete().eq('follower_id', myId).eq('following_id', targetId);
    } else {
      setIsFollowing(true);
      setStats((s) => ({ ...s, followers: s.followers + 1 }));
      await supabase.from('follows').insert({ follower_id: myId, following_id: targetId });
    }
    setFollowLoading(false);
  };

  const handleEditUsername = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Edit Username',
        'Enter a new username',
        async (newUsername) => {
          if (!newUsername?.trim() || !myId) return;
          const trimmed = newUsername.trim();
          await supabase.from('profiles').update({ username: trimmed }).eq('id', myId);
          setProfile((prev) => (prev ? { ...prev, username: trimmed } : prev));
        },
        'plain-text',
        profile?.username,
      );
    } else {
      Alert.alert('Edit Username', 'Username editing requires iOS.');
    }
  };

  const handleAvatarUpload = async () => {
    if (!myId) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `avatars/${myId}.${ext}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    await supabase.storage.from('avatars').upload(path, blob, { contentType: `image/${ext}`, upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', myId);
    setProfile((prev) => (prev ? { ...prev, avatar_url: data.publicUrl } : prev));
  };

  const navigateToCafe = (cafe: Cafe) => {
    navigation.navigate('Map', { screen: 'CafeDetail', params: { cafe } });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D4820A" />
      </View>
    );
  }

  const headerComponent = (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={isOwnProfile ? handleAvatarUpload : undefined} disabled={!isOwnProfile}>
          <Avatar avatarUrl={profile?.avatar_url} username={profile?.username ?? '?'} size={80} />
          {isOwnProfile && <Text style={styles.avatarHint}>tap to change</Text>}
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <Text style={styles.username}>{profile?.username ?? ''}</Text>
          {isOwnProfile && (
            <TouchableOpacity onPress={handleEditUsername}>
              <Text style={styles.editUsername}>Edit username</Text>
            </TouchableOpacity>
          )}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={handleFollow}
              disabled={followLoading}
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{profile?.total_checkins ?? 0}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{profile?.unique_cafes ?? 0}</Text>
          <Text style={styles.statLabel}>Cafés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Check-ins</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={checkins}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={headerComponent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D4820A" />
      }
      renderItem={({ item }) => (
        <CheckInCard checkin={item} onPressCafe={navigateToCafe} />
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No check-ins yet</Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRight: { flex: 1, justifyContent: 'center', paddingTop: 4 },
  username: { fontSize: 22, fontWeight: '700', color: '#2C1810', marginBottom: 6 },
  avatarHint: { fontSize: 10, color: '#2C1810', opacity: 0.4, textAlign: 'center', marginTop: 4 },
  editUsername: { fontSize: 13, color: '#D4820A', fontWeight: '600' },
  followBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2C1810',
    backgroundColor: '#2C1810',
  },
  followingBtn: { backgroundColor: 'transparent' },
  followBtnText: { fontSize: 14, fontWeight: '600', color: '#FAF7F2' },
  followingBtnText: { color: '#2C1810' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
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
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: '#D4820A' },
  statLabel: { fontSize: 10, color: '#2C1810', opacity: 0.5, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#EDE6DF', marginVertical: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C1810',
    opacity: 0.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#2C1810',
    opacity: 0.4,
    fontSize: 15,
    marginTop: 24,
    paddingHorizontal: 32,
  },
});
