import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const Options = ({ path, text }: any) => (
  <TouchableOpacity style={styles.option}>
    <Image source={path} />
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

export default Options;

const styles = StyleSheet.create({
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
