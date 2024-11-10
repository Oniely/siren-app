import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import Footer from './Footer';

const StyledContainer = ({ children, bg = '#D7f1f7' }: any) => {
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Image source={require('@/assets/images/top_image.png')} style={styles.image} />
      {children}
      <Footer />
    </View>
  );
};

export default StyledContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0,
    // marginTop: 0,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
