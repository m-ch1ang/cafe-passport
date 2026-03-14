import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  isSelected?: boolean;
};

export default function CafePin({ isSelected = false }: Props) {
  return (
    <View style={[styles.pin, isSelected && styles.pinSelected]}>
      <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>☕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C1810',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinSelected: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D4820A',
    borderWidth: 3,
  },
  emoji: {
    fontSize: 14,
  },
  emojiSelected: {
    fontSize: 20,
  },
});
