import { View, Image } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/app/splash-siren.png')} style={styles.image} />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
});
