import { Stack } from 'expo-router';
import React from 'react';

export default function ResponderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="responderAlert" />
      <Stack.Screen name="responderMap" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="validation" />
    </Stack>
  );
}
