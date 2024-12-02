import { Stack } from 'expo-router';
import React from 'react';

export default function ResponderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="responderAlert" />
      <Stack.Screen name="responderMap" />
    </Stack>
  );
}
