import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { hashColor } from '../lib/utils';

type Props = {
  avatarUrl?: string | null;
  username: string;
  size?: number;
};

export default function Avatar({ avatarUrl, username, size = 40 }: Props) {
  const radius = size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
      />
    );
  }

  const bg = hashColor(username);
  const initial = username.charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.4);

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#FFFFFF', fontWeight: '700' },
});
