import React, { useState, useRef } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, usePathname, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScaledSheet } from 'react-native-size-matters';
import ConfirmModal from '../ConfirmModal';
import Feather from '@expo/vector-icons/Feather';
import { FontAwesome } from '@expo/vector-icons';
const { height } = Dimensions.get('window');
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface HeaderProps {
  bg?: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ bg = '#e6e6e6' }) => {
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
    <View style={[styles.container]}>
      {/* Left Side: Burger Menu */}
      <Pressable onPress={toggleMenu}>
        <MaterialCommunityIcons name="menu" size={30} color="#8F8E8D" />
      </Pressable>
      {/* Right Side: Notifications & Profile */}
      <View style={styles.rightSide}>
        <Pressable>
          <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
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
            <Pressable>
              <Image source={require('@/assets/images/profile-logo.png')} style={styles.sliderNavImage} />
            </Pressable>
            <Text style={styles.burgerName}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/')}>
            <AntDesign name="home" size={40} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sliderNavItem}
            onPress={() => handlePress('/admin/emergency_report')}
          >
            <Image source={require('@/assets/images/reports-purple.png')} style={styles.adminSideBarIcon} />
            <Text style={styles.sliderNavItemText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sliderNavItem}
            onPress={() => handlePress('/admin/manage_accounts')}
          >
            <Image source={require('@/assets/images/people-purple.png')} style={styles.adminSideBarIcon} />
            <Text style={styles.sliderNavItemText}>Manage Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/analytics')}>
            <Image source={require('@/assets/images/analytics-purple.png')} style={styles.adminSideBarIcon} />
            <Text style={styles.sliderNavItemText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => handlePress('/admin/settings')}>
            <Ionicons name="settings-sharp" size={40} color="#0c0c63" />
            <Text style={styles.sliderNavItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sliderNavItem} onPress={() => setShowModal(true)}>
            <Ionicons name="exit" size={40} color="#0c0c63" />
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

export default AdminHeader;

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
    resizeMode: 'cover',
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
    flexWrap: 'wrap',
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
    top: hp(20),
    bottom: 0,
    height: '200@s',
  },
  adminSideBarIcon: { width: 40, height: 40, resizeMode: 'center' },
});
