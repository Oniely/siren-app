import React, { useState, useRef } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Href, usePathname, useRouter, useNavigation } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeaderProps {
  responder?: boolean;
  bg?: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ responder = false, bg = '#e6e6e6' }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnimation = useRef(new Animated.Value(-350)).current;
  const router = useRouter();
  const currentPath = usePathname();

  const handlePress = (path: Href) => {
    if (currentPath !== path) {
      router.push(path);
    }
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.navigate('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
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
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Left Side: Burger Menu */}
      <Pressable onPress={toggleMenu}>
        <MaterialCommunityIcons name="menu" size={30} color="#8F8E8D" />
      </Pressable>
      {/* Right Side: Notifications & Profile */}
      <View style={styles.rightSide}>
        <Pressable>
          <MaterialCommunityIcons name="bell" size={32} color="#016ea6" />
        </Pressable>
        <Pressable>
          {responder ? (
            <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
          ) : (
            <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
          )}
        </Pressable>
      </View>

      {/* Burger Menu Modal */}
      <Animated.View style={[styles.sliderNav, { transform: [{ translateX: slideAnimation }] }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
        <View style={styles.burgerProfile}>
          <Pressable>
            {responder ? (
              <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
            ) : (
              // <Icon name="user-circle" size={70} color="#8F8E8D" />
              <Image source={require('@/assets/images/profile-logo.png')} style={styles.sliderNavImage} />
            )}
          </Pressable>
          <Text style={styles.burgerName}>Elizabeth Olsen</Text>
        </View>
        <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/emergency_report')}>
          <Feather name="phone-call" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>View Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/manage_accounts')}>
          <FontAwesome name="send" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Manage Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/analytics')}>
          <Foundation name="alert" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>View Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/user/settings')}>
          <Ionicons name="settings-sharp" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sliderNavItem} onPress={handleLogout}>
          <Ionicons name="exit" size={35} color="#0c0c63" />
          <Text style={styles.sliderNavItemText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.burgerFooter}>All Rights Reserved @Siren2024</Text>
      </Animated.View>
    </View>
  );
};

export default AdminHeader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  rightSide: {
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
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
    fontFamily: 'BeVietnamProThin',
  },
  sliderNav: {
    position: 'absolute',
    top: 0,
    left: -350,
    width: 350,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    display: 'flex',
    zIndex: 1000,
    height: 900,
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
    fontFamily: 'BeVietnamProThin',
  },
  sliderNavImage: {},
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
