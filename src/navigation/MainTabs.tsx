import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';
import CheckInModal from '../screens/CheckInModal';
import FeedScreen from '../screens/FeedScreen';
import PassportScreen from '../screens/PassportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MapStackParamList, FeedStackParamList } from './types';

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
      <MapStack.Screen
        name="CheckInModal"
        component={CheckInModal}
        options={{ presentation: 'modal', title: 'Check In' }}
      />
    </MapStack.Navigator>
  );
}

const FeedStack = createNativeStackNavigator<FeedStackParamList>();

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen
        name="FeedHome"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <FeedStack.Screen
        name="UserProfile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </FeedStack.Navigator>
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
      <Tab.Screen
        name="Feed"
        component={FeedStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Passport" component={PassportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
