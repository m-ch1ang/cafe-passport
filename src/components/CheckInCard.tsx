import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Avatar from './Avatar';
import { timeAgo } from '../lib/utils';
import { Cafe } from '../lib/types';

export type FeedItem = {
  id: string;
  visited_at: string | null;
  visit_number: number | null;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  cafes: Cafe | null;
  reviews: {
    brew_method: string | null;
    rating: number | null;
    note: string | null;
    photo_url: string | null;
  }[];
};

type Props = {
  checkin: FeedItem;
  onPressCafe?: (cafe: Cafe) => void;
  onPressUser?: (userId: string) => void;
};

const STAR = '★';
const EMPTY_STAR = '☆';

export default function CheckInCard({ checkin, onPressCafe, onPressUser }: Props) {
  const { profiles, cafes, reviews, visited_at } = checkin;
  const review = reviews?.[0];
  const rating = review?.rating ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => profiles?.id && onPressUser?.(profiles.id)}
          style={styles.userRow}
        >
          <Avatar
            avatarUrl={profiles?.avatar_url}
            username={profiles?.username ?? '?'}
            size={38}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              <Text style={styles.usernameLink}>{profiles?.username ?? 'Unknown'}</Text>
              {cafes ? (
                <Text style={styles.atText}> at {cafes.name}</Text>
              ) : null}
            </Text>
            <Text style={styles.timeAgo}>
              {visited_at ? timeAgo(visited_at) : ''}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {(review?.brew_method || rating > 0) && (
        <View style={styles.metaRow}>
          {review?.brew_method ? (
            <View style={styles.brewPill}>
              <Text style={styles.brewText}>{review.brew_method}</Text>
            </View>
          ) : null}
          {rating > 0 && (
            <Text style={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (i < rating ? STAR : EMPTY_STAR)).join('')}
            </Text>
          )}
        </View>
      )}

      {review?.note ? <Text style={styles.note}>{review.note}</Text> : null}

      {review?.photo_url ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => cafes && onPressCafe?.(cafes)}
        >
          <Image source={{ uri: review.photo_url }} style={styles.photo} />
        </TouchableOpacity>
      ) : null}

      {cafes && (
        <TouchableOpacity onPress={() => onPressCafe?.(cafes)} style={styles.cafeLink}>
          <Text style={styles.cafeLinkText}>View {cafes.name} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { marginBottom: 10 },
  userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  userInfo: { flex: 1 },
  username: { fontSize: 14, color: '#2C1810', flexWrap: 'wrap', lineHeight: 20 },
  usernameLink: { fontWeight: '700' },
  atText: { fontWeight: '400' },
  timeAgo: { fontSize: 12, color: '#2C1810', opacity: 0.45, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  brewPill: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E8DDD8',
  },
  brewText: { fontSize: 12, color: '#2C1810', fontWeight: '500' },
  stars: { fontSize: 14, color: '#D4820A' },
  note: { fontSize: 14, color: '#2C1810', lineHeight: 20, marginBottom: 10 },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#E8DDD8',
    resizeMode: 'cover',
  },
  cafeLink: { alignSelf: 'flex-start' },
  cafeLinkText: { fontSize: 13, color: '#D4820A', fontWeight: '600' },
});
