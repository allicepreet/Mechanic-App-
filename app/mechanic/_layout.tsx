import React from 'react';
import { Stack } from 'expo-router';

export default function MechanicLayout() {
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
      <Stack.Screen name="customer-preview" />
    </Stack>
  );
}
