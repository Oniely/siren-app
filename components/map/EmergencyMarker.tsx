import { View, Text, Image, DimensionValue } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

interface Props {
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function EmergencyMarker({ width = 100, height = 100 }: Props) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image source={require('@/assets/images/map/echo.png')} style={styles.echo} />
      <Image source={require('@/assets/images/profile.png')} style={styles.profile} />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  echo: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  profile: {
    width: '20%',
    height: '20%',
    position: 'absolute',
  },
});
