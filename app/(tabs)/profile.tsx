import Footer from '@/components/Footer';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { get, ref } from 'firebase/database';
// import { db } from '../firebase';

interface User {
  username: string;
  email: string;
  role: string;
}

const Profile = () => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

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
    <StyledContainer>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image source={require('@/assets/images/profile.png')} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.infoUsername}>{user?.username}</Text>
            <Text style={styles.infoEmail}>{user?.email}</Text>
            <Text style={styles.infoRole}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTitle}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTitle}>Terms of Use</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTitle}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTitle}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </StyledContainer>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  profileContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },
  infoUsername: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoEmail: {
    fontSize: 16,
    fontWeight: '400',
  },
  infoRole: {
    fontSize: 14,
    color: '#08B6D9',
  },
  button: {
    backgroundColor: '#93E0EF',
    width: '100%',
    height: 60,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  buttonTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 40,
    width: '100%',
    paddingHorizontal: 40,
  },
  image: {
    width: 100,
    height: 100,
  },
});
