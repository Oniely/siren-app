import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="map" />
      <Stack.Screen name="emergency_report/index" />
      <Stack.Screen name="emergency_report/report_detail" />
      <Stack.Screen name="analytics/index" />
    </Stack>
  );
}
