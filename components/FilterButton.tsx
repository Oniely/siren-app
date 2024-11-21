import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import MI from 'react-native-vector-icons/MaterialIcons';

interface Props {
  text: string;
  name: string;
}

const FilterButton = ({ text, name }: Props) => {
  return (
    <TouchableOpacity style={[styles.filter]}>
      <Text>{text}</Text>
      <MI name={name} size={30} color={'#0B0C63'} />
    </TouchableOpacity>
  );
};

export default FilterButton;

const styles = StyleSheet.create({
  filter: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#08B6D9',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
  },
});
