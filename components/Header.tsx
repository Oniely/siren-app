import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Header = ({ responder = false }) => {
  return (
    <View style={styles.container}>
      <Pressable>
        <MaterialCommunityIcons name="bell" size={34} color={'#93E0EF'} />
      </Pressable>
      <Pressable>
        {responder ? (
          <Image source={require('@/assets/images/policeman.png')} style={styles.police} />
        ) : (
          <Icon name="user-circle" size={34} color={'#93E0EF'} />
        )}
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 25,
    gap: 20,
  },
  police: {
    resizeMode: 'stretch',
    height: 50,
    width: 50,
  },
});
