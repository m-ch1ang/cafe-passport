import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';
import FeedScreen from '../screens/FeedScreen';
import PassportScreen from '../screens/PassportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MapStackParamList } from './types';

const MapStack = createNativeStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen
        name="MapHome"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <MapStack.Screen
        name="CafeDetail"
        component={CafeDetailScreen}
        options={{ title: 'Café Details' }}
      />
    </MapStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Passport" component={PassportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
