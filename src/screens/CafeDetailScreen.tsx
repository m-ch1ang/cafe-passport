import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MapStackParamList, 'CafeDetail'>;

export default function CafeDetailScreen({ route }: Props) {
  const { cafe } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{cafe.name}</Text>
      {(cafe.neighborhood || cafe.city) && (
        <Text style={styles.location}>
          {[cafe.neighborhood, cafe.city].filter(Boolean).join(', ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' },
  name: { fontSize: 24, fontWeight: '700', color: '#2C1810', marginBottom: 8 },
  location: { fontSize: 16, color: '#2C1810', opacity: 0.6 },
});
