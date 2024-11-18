import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// @ts-ignore
import evac from '@/assets/images/evacuation.png';
// @ts-ignore
import secure from '@/assets/images/secure.png';
// @ts-ignore
import warn from '@/assets/images/warning.png';

import Footer from '../Footer';
import SearchInMap from './SearchInMap';

const Options = ({ path, text }: any) => (
  <TouchableOpacity style={styles.option}>
    <Image source={path} />
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

const MapContent = () => {
  return (
    <View style={styles.container}>
      <SearchInMap />
      <View style={styles.options}>
        <Options path={evac} text={'Reported Emergencies'} />
        <Options path={secure} text={'Safe zone'} />
        <Options path={warn} text={'Evacuation'} />
      </View>
      <View style={styles.mapContent} />
      <Footer />
    </View>
  );
};

export default MapContent;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    marginTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0,
  },

  mapContent: {
    flex: 1,
  },
  options: {
    width: '90%',
    flexDirection: 'row',
    gap: 5,
    marginHorizontal: 'auto',
    marginTop: 10,
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  optionText: {
    fontSize: 11,
  },
});
