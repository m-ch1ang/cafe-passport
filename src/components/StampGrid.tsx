import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Cafe } from '../lib/types';

const NUM_COLS = 3;
const CELL_SIZE = (Dimensions.get('window').width - 48 - 16) / NUM_COLS;

type Props = {
  cafes: Cafe[];
  visitCounts: Record<string, number>;
  onPressCafe: (cafe: Cafe) => void;
};

export default function StampGrid({ cafes, visitCounts, onPressCafe }: Props) {
  return (
    <FlatList
      data={cafes}
      numColumns={NUM_COLS}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => {
        const count = visitCounts[item.id] ?? 1;
        const initial = item.name.charAt(0).toUpperCase();
        return (
          <TouchableOpacity style={styles.cell} onPress={() => onPressCafe(item)}>
            <View style={styles.circle}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
            <Text style={styles.cafeName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>×{count}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.empty}>No cafés visited yet</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 24 },
  row: { gap: 8, marginBottom: 8 },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C1810',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  initial: { fontSize: 20, fontWeight: '700', color: '#FAF7F2' },
  cafeName: { fontSize: 11, color: '#2C1810', textAlign: 'center', fontWeight: '500' },
  countBadge: {
    marginTop: 4,
    backgroundColor: '#D4820A',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  empty: {
    color: '#2C1810',
    opacity: 0.4,
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 16,
  },
});
