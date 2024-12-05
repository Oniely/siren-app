import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5000,
  },
});
