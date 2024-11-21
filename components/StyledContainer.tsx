import React from 'react';
import { Image, Platform, StatusBar, StyleSheet } from 'react-native';
import Footer from './Footer';
import { ThemedView } from './ThemedView';

const StyledContainer = ({ children, bg = '#e6e6e6' }: any) => {
  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      {children}
      <Footer />
    </ThemedView>
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
