import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../navigation/types';
import { useCheckins } from '../hooks/useCheckins';

type Props = NativeStackScreenProps<MapStackParamList, 'CheckInModal'>;

const BREW_METHODS = ['Espresso', 'Pour Over', 'AeroPress', 'Cold Brew', 'Drip', 'Other'];
const MAX_NOTE = 280;

export default function CheckInModal({ route, navigation }: Props) {
  const { cafe } = route.params;
  const { loading, submitCheckin } = useCheckins();

  const [brewMethod, setBrewMethod] = useState('');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const { success, error } = await submitCheckin(
      cafe.id,
      brewMethod,
      rating,
      note,
      photoUri,
    );
    if (success) {
      Alert.alert('Stamped!', 'Your visit has been recorded.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', error ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Check in at</Text>
        <Text style={styles.cafeName}>{cafe.name}</Text>

        <Text style={styles.sectionLabel}>Brew Method</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {BREW_METHODS.map((method) => {
            const selected = brewMethod === method;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => setBrewMethod(selected ? '' : method)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                  {method}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star === rating ? 0 : star)}>
              <Text style={[styles.star, star <= rating && styles.starFilled]}>
                {star <= rating ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Note</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="How was it?"
          placeholderTextColor="#9C8B82"
          value={note}
          onChangeText={(t) => setNote(t.slice(0, MAX_NOTE))}
          multiline
          maxLength={MAX_NOTE}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{note.length}/{MAX_NOTE}</Text>

        <Text style={styles.sectionLabel}>Photo</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
          <Text style={styles.photoButtonText}>
            {photoUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FAF7F2" />
          ) : (
            <Text style={styles.submitButtonText}>Stamp Passport</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 15, color: '#2C1810', opacity: 0.55, marginBottom: 2 },
  cafeName: { fontSize: 24, fontWeight: '700', color: '#2C1810', marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C1810',
    opacity: 0.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
  pillRow: { paddingRight: 8, gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2C1810',
    backgroundColor: '#FFFFFF',
  },
  pillSelected: { backgroundColor: '#2C1810', borderColor: '#2C1810' },
  pillText: { fontSize: 14, color: '#2C1810', fontWeight: '500' },
  pillTextSelected: { color: '#FFFFFF' },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 36, color: '#C8B8AF' },
  starFilled: { color: '#D4820A' },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDD4CE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C1810',
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#2C1810',
    opacity: 0.35,
    textAlign: 'right',
    marginTop: 4,
  },
  photoButton: {
    borderWidth: 1.5,
    borderColor: '#2C1810',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  photoButtonText: { fontSize: 15, color: '#2C1810', fontWeight: '500' },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#E8DDD8',
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: '#D4820A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FAF7F2', fontSize: 17, fontWeight: '700' },
});
