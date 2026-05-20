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
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="booking-details" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
