import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  FlatList,
  Linking,
  Alert,
  Pressable,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

export default function EmergencyCall() {
  const router = useRouter();
  const user = getAuth().currentUser;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sirenContacts, setSirenContacts] = useState([]);
  const [nearestResponder, setNearestResponder] = useState([]);
  const [isCalling, setIsCalling] = useState(false); // To track whether a call is in progress

  type Responder = {
    id: string;
    latitude: number;
    longitude: number;
    [key: string]: any; // To allow additional fields from the users collection
  };

  type UserDetails = {
    id: string;
    username: string;
    number: string;
    [key: string]: any; // Any additional user fields
  };

  const fetchNearestResponder = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permissions are required to find nearby responders.');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      console.log('User Location:', userCoords);

      // Fetch responders from Firebase
      const responderSnapshot = await get(ref(db, 'responders/'));
      if (!responderSnapshot.exists()) {
        console.log('No responders found in Firebase');
        return;
      }

      // Retrieve responders with their keys
      const responders = Object.entries(responderSnapshot.val() || []).map(([key, value]) => ({
        id: key, // Use the key as the ID
        ...value,
      }));
      console.log('Responders from Firebase:', responders);

      // Fetch user details for each responder
      const detailedResponders = await Promise.all(
        responders.map(async (responder) => {
          const userSnapshot = await get(ref(db, `users/${responder.id}`));
          if (userSnapshot.exists()) {
            const userDetails = userSnapshot.val();
            console.log(`User Details for Responder ID ${responder.id}:`, userDetails);
            return { ...responder, ...userDetails };
          }
          console.log(`No user details found for Responder ID ${responder.id}`);
          return null;
        })
      );

      const validResponders = detailedResponders.filter(Boolean);
      console.log('Valid Responders:', validResponders);

      if (validResponders.length === 0) {
        console.log('No valid responders nearby');
        return;
      }

      // Calculate distances
      const respondersWithDistance = validResponders
        .filter((responder) => responder.latitude && responder.longitude)
        .map((responder) => {
          const distance = geolib.getDistance(
            { latitude: userCoords.latitude, longitude: userCoords.longitude },
            { latitude: responder.latitude, longitude: responder.longitude }
          );
          return { ...responder, distance };
        });

      // Find the nearest responder
      const nearestResponder = respondersWithDistance.sort((a, b) => a.distance - b.distance)[0];
      console.log('Nearest Responder:', nearestResponder);

      if (nearestResponder) {
        setNearestResponder(nearestResponder); // Only set the nearestResponder if valid
      } else {
        console.log('No responders nearby');
      }
    } catch (error) {
      console.error('Error finding nearest responder:', error);
    }
  };
  const fetchSirenContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const snapshot = await get(ref(db, `users/`));
        if (snapshot.exists()) {
          // Filter the users with the role of 'responder'
          const allUsers = Object.values(snapshot.val() || []);
          const responderContacts = allUsers.filter((user) => user.role === 'responder');
          setSirenContacts(responderContacts);
        } else {
          console.log('No Siren contacts found');
        }
      } else {
        console.error('User ID is missing');
      }
    } catch (error) {
      console.error('Error fetching Siren contacts:', error);
    }
  };
  useEffect(() => {
    fetchSirenContacts();
    fetchNearestResponder();
  }, []);

  const callNumber = (number) => {
    const url = `tel:${number}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Your device cannot handle this request.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Error opening phone dialer:', err));
  };

  const autoCallNearestResponder = () => {
    if (nearestResponder && nearestResponder.number) {
      setTimeout(() => {
        callNumber(nearestResponder.number); // Call the nearest responder after 3 seconds
        setIsCalling(true); // Indicate that a call is in progress
      }, 3000);
    } else {
      Alert.alert('No Responder', 'No nearby responder found.');
    }
  };

  const handlePanicButtonPress = () => {
    setIsModalVisible(true); // Show modal on panic button click
    fetchNearestResponder(); // Detect nearest responder when button is clicked

    // Disable the panic button and wait before calling the responder
    setTimeout(() => {
      autoCallNearestResponder(); // Automatically call the nearest responder after 3 seconds
    }, 3000);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setIsCalling(false); // Reset the calling status when the modal is closed
  };

  // This useEffect will handle the logic of calling the nearest responder only if valid data is available
  // useEffect(() => {
  //   if (nearestResponder && nearestResponder.number) {
  //     autoCallNearestResponder();
  //   } else {
  //     console.log('No valid responder or number to call');
  //   }
  // }, [nearestResponder]); // Watch for changes to the nearestResponder

  return (
    <StyledContainer bg={'#f0efee'}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Image source={require('@/assets/images/profile.png')} style={styles.profileImage} />
          <View style={styles.profileDesc}>
            <Text style={styles.profileTextName}>{user?.displayName}</Text>
            <Text style={styles.profileTextAddr}>CT Mall, Kabankalan City</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.topRight} onPress={() => router.back()}>
          <Image source={require('@/assets/images/close_btn.png')} style={styles.closeBtn} />
        </TouchableOpacity>
      </View>

      {/* Emergency Calling Content */}
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <Text style={styles.indexText}>Emergency Calling...</Text>
          <Text style={styles.indexDesc}>
            Your contact persons nearby, ambulance/police contacts will see your request for help.
          </Text>
          <View style={styles.bigCircleContainer}>
            <Image source={require('@/assets/images/emergency_call_hero.png')} style={styles.buttonBg} />
            <TouchableOpacity
              onPress={handlePanicButtonPress} // Trigger panic button logic
              style={styles.panicButton}
              disabled={isCalling} // Disable the button if a call is already in progress
            >
              <Image
                source={require('@/assets/images/emergency_call_btn.png')}
                style={styles.panicButtonImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image
            source={require('@/assets/images/microphone.png')}
            style={styles.bottomBarBtnImage}
            alt="Mic"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image source={require('@/assets/images/plus.png')} style={styles.bottomBarBtnImage} alt="Plus" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image source={require('@/assets/images/camera.png')} style={styles.bottomBarBtnImage} alt="Cam" />
        </TouchableOpacity>
      </View>

      {/* Modal to show siren contacts */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nearby Responder</Text>
            <Text style={styles.modalFooter}>Calling...</Text>
            {nearestResponder && (
              <View style={styles.nearestResponderContainer}>
                <Text style={styles.nearestResponderText}>
                  {nearestResponder.username} ({nearestResponder.distance} meters away)
                </Text>
                {/* <Pressable onPress={() => callNumber(nearestResponder.number)}> */}
                <Ionicons name="call" size={30} color="#0b0c63" />
                {/* </Pressable> */}
              </View>
            )}
            <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </StyledContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '85%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  topLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  profileImage: {
    resizeMode: 'cover',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 999,
  },
  profileDesc: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    rowGap: 2,
  },
  profileTextName: {
    color: '#989898',
    fontFamily: 'BeVietnamProBold',
    fontWeight: '700',
  },
  profileTextAddr: {
    fontSize: 12,
    fontFamily: 'BeVietnamProMedium',
  },
  topRight: {
    width: 20,
    height: 20,
  },
  closeBtn: { width: '100%', height: '100%' },
  indexText: {
    fontSize: 34,
    textAlign: 'center',
    color: '#343434',
    fontFamily: 'BeVietnamProSemiBold',
  },
  indexDesc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#b0adad',
    fontWeight: 'medium',
    fontFamily: 'BeVietnamProRegular',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 1,
    position: 'relative',
  },
  buttonBg: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
    zIndex: 10,
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    alignContent: 'center',
    zIndex: 50,
  },
  panicButtonImage: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  bottomBarBtn: {
    width: '20%',
    height: '25%',
  },
  bottomBarBtnImage: {
    resizeMode: 'center',
    width: '100%',
    height: '100%',
  },

  // Modal styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactItem: {
    marginBottom: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '500',
  },
  callButton: {
    marginTop: 10,
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeModalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0efee',
    borderRadius: 5,
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343434',
  },
  nearestResponderContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  nearestResponderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalFooter: {
    paddingVertical: 10,
  },
});
