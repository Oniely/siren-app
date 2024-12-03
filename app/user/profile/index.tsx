import StyledContainer from '@/components/StyledContainer';
import { useRouter, usePathname, Href } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { get, ref } from 'firebase/database';
// import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { db, auth } from '@/firebaseConfig';
import { ScaledSheet } from 'react-native-size-matters';
import Burger from '@/components/Burger';
import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import HeaderText from '@/components/app/HeaderText';

const fetchProfileData = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No user ID found');

    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No data available');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

interface User {
  username: string;
  email: string;
  role: string;
}

const Profile = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

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
  useEffect(() => {
    async function loadProfileData() {
      try {
        const data = await fetchProfileData();
        setProfileData(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    loadProfileData();
  }, []);

  // useEffect(() => {
  //   init();
  // }, []);

  // async function init() {
  //   const userId = await AsyncStorage.getItem('userId');
  //   console.log(userId);
  //   const userRef = ref(db, `users/${userId}`);

  //   const userSnapshot = await get(userRef);
  //   console.log(userSnapshot.val());
  //   const userVal = userSnapshot.val();
  //   setUser({
  //     role: userVal.role,
  //     email: userVal.email,
  //     username: userVal.username,
  //   });
  // }

  return (
    <StyledContainer bg="#faf9f6">
      <View style={styles.container}>
        <HeaderText text="Your Profile" />
        <View style={styles.profileInfo}>
          <Image source={require('@/assets/images/profile.png')} style={styles.profileImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.profileName}>{profileData?.firstname + ' ' + profileData?.lastname}</Text>
            <Text style={styles.profileAt}>{profileData?.email}</Text>
            <TouchableOpacity
              onPress={() => router.push('/user/profile/edit_profile')}
              style={styles.editButton}
            >
              <Feather name="edit" size={24} color="#FFF" />
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileSettings}>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => router.push('/user/profile/notifications')}
          >
            <View style={styles.settingContent}>
              <MaterialCommunityIcons name="bell" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <View style={styles.settingContent}>
              <SimpleLineIcons name="globe" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <View style={styles.settingContent}>
              <FontAwesome6 name="location-dot" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Location</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={handleLogout}>
            <View style={styles.settingContent}>
              <SimpleLineIcons name="logout" size={24} color="#b6b6b7" />
              <Text style={styles.settingText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    gap: '5@s',
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
