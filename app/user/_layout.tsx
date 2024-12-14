import { Stack } from 'expo-router';
import React from 'react';

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="emergency_call" />
      <Stack.Screen name="map" />
      <Stack.Screen name="report_emergency" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="view_alert" />
      <Stack.Screen name="waitingResponder" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="response_review" />
      <Stack.Screen name="call/Caller" />
      <Stack.Screen name="call/Receiver" />
    </Stack>
  );
}
