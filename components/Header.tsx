import React, { useState, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
  responder?: boolean;
}

const Header: React.FC<HeaderProps> = ({ responder = false }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const slideAnimation = useRef(new Animated.Value(-350)).current;

  const toggleMenu = () => {
    const toValue = menuVisible ? 350 : 0;
    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      {/* Left Side: Burger Menu */}
      <Pressable onPress={toggleMenu}>
        <MaterialCommunityIcons name="menu" size={30} color="#8F8E8D" />
      </Pressable>
      {/* Right Side: Notifications & Profile */}
      <View style={styles.rightSide}>
        <Pressable>
          <MaterialCommunityIcons name="bell" size={34} color="#8F8E8D" />
        </Pressable>
        <Pressable>
          {responder ? (
            <Image source={require('@/assets/images/policeman.png')} style={styles.police} />
          ) : (
            <Icon name="user-circle" size={34} color="#8F8E8D" />
          )}
        </Pressable>
      </View>

      {/* Burger Menu Modal */}
      <Animated.View style={[styles.sliderNav, { transform: [{ translateX: slideAnimation }] }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <View style={styles.burgerProfile}>
          <Pressable>
            {responder ? (
              <Image source={require('@/assets/images/policeman.png')} style={styles.police} />
            ) : (
              <Icon name="user-circle" size={70} color="#8F8E8D" />
            )}
          </Pressable>
          <Text style={styles.burgerName}>Elizabeth Olsen</Text>
        </View>

        <TouchableOpacity style={styles.sliderNavItem}>
          <Feather name="phone-call" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Emergency Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem}>
          <FontAwesome name="send" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Emergency Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem}>
          <Foundation name="alert" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Report Emergency</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem}>
          <Ionicons name="eye-sharp" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>View Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem}>
          <Ionicons name="notifications" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Notifications</Text>
        </TouchableOpacity>
        <Text style={styles.burgerFooter}>All Rights Reserved @Siren2024</Text>
      </Animated.View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  rightSide: {
    flexDirection: 'row',
    columnGap: 10,
  },
  police: {
    resizeMode: 'stretch',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  burgerProfile: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    width: '100%',
  },
  burgerName: {
    marginTop: 20,
    fontSize: 25,
    color: '#000',
  },
  sliderNav: {
    position: 'absolute',
    top: 0,
    left: -350,
    width: 350,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    display: 'flex',
    zIndex: 100,
    flex: 1,
    height: 1250,
  },
  sliderNavItem: {
    marginTop: 10,
    paddingVertical: 10,
    left: 50,
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    zIndex: 100,
  },
  sliderNavItemText: {
    color: '#000',
    fontSize: 24,
    marginHorizontal: 10,
    paddingLeft: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 15,
    padding: 10,
    zIndex: 3,
  },
  closeButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#333',
    fontSize: 50,
  },
  burgerFooter: {
    textAlign: 'center',
    top: 200,
    bottom: 0,
    height: 200,
  },
});