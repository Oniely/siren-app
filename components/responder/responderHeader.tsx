import React, { useState, useRef } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, usePathname, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmModal from '../ConfirmModal';
import { FontAwesome } from '@expo/vector-icons';
import { User } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScaledSheet } from 'react-native-size-matters';

const { height } = Dimensions.get('window');

const ResponderHeader = ({ user }: { user: User }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const slideAnimation = useRef(new Animated.Value(-350)).current;
  const router = useRouter();
  const currentPath = usePathname();

  const handlePress = (path: Href) => {
    if (currentPath !== path) {
      router.push(path);
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
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.navigate('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Left Side: Burger Menu */}
      <Pressable onPress={toggleMenu}>
        <MaterialCommunityIcons name="menu" size={30} color="#8F8E8D" />
      </Pressable>
      {/* Right Side: Notifications & Profile */}
      <View style={styles.rightSide}>
        <Pressable onPress={() => router.push('/responder/profile/notifications')}>
          <MaterialCommunityIcons name="bell" size={32} color="#016ea6" />
        </Pressable>
        <Pressable onPress={() => router.push('/responder/profile')}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile-logo.png')}
            style={styles.police}
          />
        </Pressable>
      </View>

      {/* Burger Menu Modal */}
      <Animated.View
        style={[styles.sliderNav, { transform: [{ translateX: slideAnimation }] }, { height: height }]}
      >
        <ScrollView style={styles.navScrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <AntDesign name="close" size={30} color="black" />
          </TouchableOpacity>
          <View style={styles.burgerProfile}>
            <Pressable onPress={() => router.push('/responder/profile')}>
              <Image
                source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile-logo.png')}
                style={styles.sliderNavImage}
              />
            </Pressable>
            <Text style={styles.burgerName}>{user?.displayName || ''}</Text>
          </View>

          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/responder/contacts')}>
            <Feather name="phone-call" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/responder/messages')}>
            <FontAwesome name="send" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Emergency Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sliderNavItem}
            onPress={() => handlePress('/responder/responderMap')}
          >
            <Ionicons name="eye-sharp" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>View Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sliderNavItem}
            onPress={() => handlePress('/responder/profile/notifications')}
          >
            <Ionicons name="notifications" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/responder/settings')}>
            <Ionicons name="settings-sharp" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => setShowModal(true)}>
            <Ionicons name="exit" size={35} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Logout</Text>
          </TouchableOpacity>
          <Text style={styles.burgerFooter}>All Rights Reserved @Siren2024</Text>
        </ScrollView>
      </Animated.View>
      <ConfirmModal
        visible={showModal}
        onConfirm={() => {
          setShowModal(false);
          handleLogout();
        }}
        onCancel={() => setShowModal(false)}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
      />
    </View>
  );
};

export default ResponderHeader;

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '15@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  title: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    color: '#000',
  },
  rightSide: {
    flexDirection: 'row',
    columnGap: '10@s',
    alignItems: 'center',
  },
  police: {
    resizeMode: 'stretch',
    height: '40@s',
    width: '40@s',
    borderRadius: '20@s',
  },
  burgerProfile: {
    height: '250@s',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    width: '100%',
  },
  navScrollContainer: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'scroll',
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  burgerName: {
    marginTop: '20@vs',
    fontSize: '25@ms',
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
    flex: 1,
    height: hp('100%'),
  },
  sliderNavItem: {
    paddingVertical: '10@vs',
    left: wp('10%'),
    flexDirection: 'row',
    alignItems: 'center',
    height: '90@vs',
    zIndex: 100,
  },
  sliderNavItemText: {
    color: '#000',
    fontSize: '24@ms',
    marginHorizontal: '10@s',
    paddingLeft: '30@s',
    fontFamily: 'BeVietnamProThin',
  },
  sliderNavImage: {
    resizeMode: 'cover',
    width: '125@s',
    height: '125@s',
    borderRadius: 999,
  },
  closeButton: {
    position: 'absolute',
    top: '10@s',
    left: '15@s',
    padding: '10@s',
    zIndex: 3,
  },
  closeButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#333',
    fontSize: '50@ms',
  },
  burgerFooter: {
    textAlign: 'center',
    top: '200@s',
    bottom: 0,
    height: '200@s',
  },
});
