import StyledContainer from '@/components/StyledContainer';
import { useRouter, usePathname, Href } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScaledSheet } from 'react-native-size-matters';
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons as MCI,
  SimpleLineIcons,
} from '@expo/vector-icons';
import HeaderText from '@/components/app/HeaderText';
import useUser from '@/hooks/useUser';
import Loading from '@/components/app/Loading';
import ConfirmModal from '@/components/ConfirmModal';
import { getAuth } from 'firebase/auth';

MCI.loadFont();

const Profile = () => {
  const user = getAuth().currentUser;
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.navigate('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <StyledContainer bg="#faf9f6">
      <View style={styles.container}>
        <HeaderText text="Your Profile" />
        <View style={styles.profileInfo}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile.png')}
            style={styles.profileImage}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.profileName}>{user?.displayName}</Text>
            <Text style={styles.profileAt} numberOfLines={2}>
              {user?.email}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/user/profile/edit_profile')}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Feather name="edit" size={24} color="#FFF" />
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileSettings}>
          <TouchableOpacity
            style={styles.settingButton}
            activeOpacity={0.7}
            onPress={() => router.push('/user/profile/notifications')}
          >
            <View style={styles.settingContent}>
              <MCI name="bell" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => router.push('/user/map')}
            activeOpacity={0.8}
          >
            <View style={styles.settingContent}>
              <FontAwesome6 name="location-dot" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Location</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} activeOpacity={0.8}>
            <View style={styles.settingContent}>
              <Ionicons name="settings" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.settingContent}>
              <SimpleLineIcons name="logout" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    </StyledContainer>
  );
};

export default Profile;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '30@s',
    backgroundColor: '#e6e6e6',
    gap: '10@s',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdb',
  },
  headerText: {
    fontSize: '20@s',
    fontFamily: 'BeVietnamProBold',
    color: '#0c0c63',
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30@s',
    gap: '15@s',
  },
  infoContainer: {
    flex: 1,
    gap: '6@vs',
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: '18@s',
    fontFamily: 'BeVietnamProBold',
    color: '#0c0c63',
  },
  profileAt: {
    fontSize: '14@s',
    color: '#b6b6b7',
    fontFamily: 'BeVietnamProRegular',
    width: '85%',
  },
  profileImage: {
    resizeMode: 'cover',
    width: '100@s',
    height: '100@s',
    borderWidth: 2,
    borderColor: '#0c0c63',
    borderRadius: 999,
  },
  editButton: {
    backgroundColor: '#0c0c63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10@s',
    borderRadius: '5@s',
    paddingVertical: '5@s',
    paddingHorizontal: '10@s',
    fontFamily: 'BeVietnamProSemiBold',
  },
  editText: {
    color: '#fff',
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
  },
  profileSettings: {
    gap: '10@s',
    marginTop: '20@s',
    paddingHorizontal: '30@s',
  },
  settingButton: {
    paddingVertical: '10@s',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  settingText: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#b6b6b7',
  },
});
