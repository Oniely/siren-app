import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Linking, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref, set, query, orderByChild, equalTo, remove } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

export default function EmergencyCall() {
  const router = useRouter();
  const user = getAuth().currentUser;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sirenContacts, setSirenContacts] = useState<any>([]);
  const [nearestResponder, setNearestResponder] = useState<any>([]);
  const [isCalling, setIsCalling] = useState(false);

  const isCallInProgressRef = useRef(false);

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

  const fetchNearestResponder = useCallback(async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permissions are required');
      }

      // Get current user location
      const userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      // Fetch all responders
      const responderSnapshot = await get(ref(db, 'responders/'));
      if (!responderSnapshot.exists()) {
        throw new Error('No responders found');
      }

      // Convert responders to array with their IDs
      const responders = Object.entries(responderSnapshot.val() || []).map(([key, value]: any) => ({
        id: key,
        ...value,
      }));

      // Fetch user details for responders
      const detailedResponders = await Promise.all(
        responders.map(async (responder) => {
          const userSnapshot = await get(ref(db, `users/${responder.id}`));
          return userSnapshot.exists() ? { ...responder, ...userSnapshot.val() } : null;
        })
      );

      // Filter out null and invalid responders
      const validResponders = detailedResponders
        .filter(Boolean)
        .filter((responder) => responder.latitude && responder.longitude && responder.role === 'responder');

      if (validResponders.length === 0) {
        throw new Error('No valid responders found');
      }

      // Calculate distances
      const respondersWithDistance = validResponders.map((responder) => ({
        ...responder,
        distance: geolib.getDistance(
          {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          },
          {
            latitude: responder.latitude,
            longitude: responder.longitude,
          }
        ),
      }));

      // Sort responders by distance
      const sortedResponders = respondersWithDistance.sort((a, b) => a.distance - b.distance);

      // Select the nearest responder
      const nearest = sortedResponders[0];

      return nearest;
    } catch (error) {
      console.error('Error finding nearest responder:', error);
      throw error;
    }
  }, []);

  const fetchSirenContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const snapshot = await get(ref(db, `users/`));
        if (snapshot.exists()) {
          // Filter the users with the role of 'responder'
          const allUsers = Object.values(snapshot.val() || []);
          const responderContacts = allUsers.filter((user: any) => user.role === 'responder');
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

  const callNumber = (number: any) => {
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

  const startAudioCall = useCallback(
    async (responder: any) => {
      if (!responder || !responder.id || !responder.number) {
        throw new Error('Incomplete responder information');
      }

      try {
        // Set flag to prevent multiple calls
        isCallInProgressRef.current = true;

        // Remove any existing call rooms for this user
        const existingCallsQuery = query(ref(db, 'calls'), orderByChild('caller/id'), equalTo(user?.uid!));

        const existingCallsSnapshot = await get(existingCallsQuery);
        if (existingCallsSnapshot.exists()) {
          const existingCalls = existingCallsSnapshot.val();
          await Promise.all(
            Object.keys(existingCalls).map(async (callId) => {
              await remove(ref(db, `calls/${callId}`));
            })
          );
        }

        // Generate unique room ID
        const roomId = `room_${Date.now()}_${user?.uid}_${responder.id}`;
        const callRef = ref(db, `calls/${roomId}`);

        // Create call record
        await set(callRef, {
          status: 'initiated',
          caller: {
            id: user?.uid || 'unknown',
            name: user?.displayName || 'Unknown Caller',
          },
          receiver: {
            id: responder.id || 'unknown',
            name: responder.username || 'Unknown Responder',
          },
          timestamp: new Date().toISOString(),
          notify: true,
        });

        // Navigate to call screen
        router.push({
          pathname: '/user/call/Caller',
          params: {
            roomId,
            currentUserId: user?.uid,
            receiverId: responder.id,
            receiverName: responder.username,
          },
        });

        setIsCalling(true);
        setIsModalVisible(true);

        return roomId;
      } catch (error) {
        console.error('Error starting audio call:', error);

        // Reset call in progress flag
        isCallInProgressRef.current = false;

        throw error;
      }
    },
    [user, router]
  );

  const initiateEmergencyCall = useCallback(async () => {
    try {
      // Prevent multiple call attempts
      if (isCallInProgressRef.current) {
        console.log('Call already in progress');
        return;
      }

      // Set modal visibility
      setIsModalVisible(true);

      // Find nearest responder
      const responder = await fetchNearestResponder();

      if (responder) {
        await startAudioCall(responder);
        setNearestResponder(responder);
      }
    } catch (error) {
      // Show error alert
      Alert.alert(
        'Emergency Call Failed',
        'Unable to find a nearby responder. Please try again or contact support.'
      );
      setIsModalVisible(false);

      // Reset call in progress flag
      isCallInProgressRef.current = false;
    }
  }, [fetchNearestResponder, startAudioCall]);

  // Initial call setup - only triggered once
  useEffect(() => {
    initiateEmergencyCall();

    // Cleanup function to reset call state
    return () => {
      isCallInProgressRef.current = false;
      setIsCalling(false);
    };
  }, []); // Empty dependency array ensures this runs only once

  // Close modal and reset state
  const closeModal = () => {
    setIsModalVisible(false);
    setIsCalling(false);
    setNearestResponder(null);
    isCallInProgressRef.current = false;
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
              // onPress={handlePanicButtonPress} // Trigger panic button logic
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
