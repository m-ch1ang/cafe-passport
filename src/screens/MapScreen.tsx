import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCafes } from '../hooks/useCafes';
import CafePin from '../components/CafePin';
import { Cafe } from '../lib/types';
import { MapStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

const DEFAULT_DELTA = { latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function MapScreen({ navigation }: Props) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const { cafes, loading, fetchNearbyCafes } = useCafes();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setRegion({ latitude, longitude, ...DEFAULT_DELTA });
      fetchNearbyCafes(latitude, longitude);
    })();
  }, []);

  const handleRefresh = () => {
    if (region) {
      fetchNearbyCafes(region.latitude, region.longitude);
    }
  };

  if (permissionDenied) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Location access is required to discover nearby cafés.{'\n'}
          Please enable it in your device Settings.
        </Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D4820A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={() => setSelectedCafe(null)}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
      >
        {cafes.map((cafe) => (
          <Marker
            key={cafe.id}
            coordinate={{ latitude: cafe.lat, longitude: cafe.lng }}
            onPress={() => setSelectedCafe(cafe)}
            tracksViewChanges={false}
          >
            <CafePin isSelected={selectedCafe?.id === cafe.id} />
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#D4820A" />
        </View>
      )}

      {selectedCafe && (
        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Text style={styles.cafeName}>{selectedCafe.name}</Text>
            {(selectedCafe.neighborhood || selectedCafe.city) && (
              <Text style={styles.cafeLocation}>
                {[selectedCafe.neighborhood, selectedCafe.city].filter(Boolean).join(', ')}
              </Text>
            )}
            <Text style={styles.checkinCount}>
              {selectedCafe.checkin_count ?? 0}{' '}
              {selectedCafe.checkin_count === 1 ? 'check-in' : 'check-ins'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('CafeDetail', { cafe: selectedCafe })}
          >
            <Text style={styles.viewButtonText}>View Café</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>↺</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 32,
  },
  permissionText: {
    fontSize: 16,
    color: '#2C1810',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  infoCardContent: {
    flex: 1,
  },
  cafeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 2,
  },
  cafeLocation: {
    fontSize: 13,
    color: '#2C1810',
    opacity: 0.6,
    marginBottom: 2,
  },
  checkinCount: {
    fontSize: 13,
    color: '#D4820A',
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#2C1810',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  viewButtonText: {
    color: '#FAF7F2',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C1810',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
});
