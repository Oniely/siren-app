import Footer from '@/components/Footer';
import StyledContainer from '@/components/StyledContainer';
import { useRouter, usePathname, Href } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

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
  const currentPath = usePathname();
  const [user, setUser] = useState<User | null>(null);


  const handlePress = (path: Href) => {
    if (currentPath !== path) {
      router.push(path);
    }
  };
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
            <Text style={styles.infoUsername}>{user?.username}Lorem Ipsum</Text>
            <Text style={styles.infoEmail}>{user?.email}Loremipsum@gmail.com</Text>
            <Text style={styles.infoRole}>{user?.role?.toUpperCase()}User</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Entypo name="key" size={30} color="black" />
            <Text style={styles.buttonTitle}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <AntDesign name="book" size={30} color="black" />
            <Text style={styles.buttonTitle}>Terms of Use</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <MaterialIcons name="privacy-tip" size={30} color="black" />
            <Text style={styles.buttonTitle}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('/(auth)/login')}>
            <MaterialIcons name="logout" size={30} color="black" />
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
    backgroundColor: '#fff',
  },
  profileContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingTop: 40,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 30,
    color: '#000',
  },
  infoUsername: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingVertical: 4,

  },
  infoEmail: {
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 4,
  },
  infoRole: {
    fontSize: 18,
    color: '#0c0c63',
    paddingVertical: 4,
  },
  button: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 5,
    borderBottomWidth: 1,
  },
  buttonTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 30,
    paddingLeft: 10,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingVertical: 40,
    height: '100%',
  },
  image: {
    width: 100,
    height: 100,
    marginLeft: 25,
  },
});
