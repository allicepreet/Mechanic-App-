import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useMechanic } from '@/components/MechanicContext';
import { ActivityIndicator, View } from 'react-native';

export default function MechanicLayout() {
  const { isLoggedIn, authLoading } = useMechanic();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' }}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" options={{ animation: 'none' }} />
      <Stack.Screen name="bookings" options={{ animation: 'none' }} />
      <Stack.Screen name="booking-details" />
      <Stack.Screen name="earnings" options={{ animation: 'none' }} />
      <Stack.Screen name="profile" options={{ animation: 'none' }} />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
