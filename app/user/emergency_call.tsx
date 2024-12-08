import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native'; // For calling functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

export default function EmergencyCall() {
  const router = useRouter();
  const user = getAuth().currentUser;

  // State for modal visibility and siren contacts
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sirenContacts, setSirenContacts] = useState([]); // Use this state to store siren contacts

  // WebRTC Peer Connection
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  type ContactType = {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    number: string;
    category: 'personal' | 'emergency' | 'siren';
  };

  // Fetch siren contacts
  const fetchSirenContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const snapshot = await get(ref(db, `users/${userId}/contacts/siren/`));
        if (snapshot.exists()) {
          const sirenContacts: ContactType[] = Object.values(snapshot.val() || []);
          setSirenContacts(sirenContacts);
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

  // Fetch siren contacts when the component mounts
  useEffect(() => {
    fetchSirenContacts();
  }, []);

  // Set up WebRTC connection
  // const setUpPeerConnection = () => {
  //   const pc = new RTCPeerConnection({
  //     iceServers: [
  //       {
  //         urls: 'stun:stun.l.google.com:19302', // STUN server for WebRTC
  //       },
  //     ],
  //   });

    // Handle ICE candidate
  //   pc.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       console.log('ICE Candidate: ', event.candidate);
  //     }
  //   };

  //   setPeerConnection(pc);
  // };

  // Handle call: Use Linking for a phone call or WebRTC for in-app call
  // const handleCall = (number: string, isWebrtc: boolean = false) => {
  //   if (isWebrtc && peerConnection) {
  //     // Set up peer connection for WebRTC call
  //     setUpPeerConnection();
  //     initiateWebRTCConnection();
  //   } else {
  //     // If it's a phone number, use Linking to place a call
  //     if (number) {
  //       Linking.openURL(`tel:${number}`);
  //     } else {
  //       alert('No phone number available for this contact');
  //     }
  //   }
  // };

  // Initiate WebRTC connection (simplified)
  // const initiateWebRTCConnection = async () => {
  //   if (peerConnection) {
  //     // Get user media (camera/mic) for the call
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //         video: false, // or true for video calls
  //       });

  //       // Add stream to the connection
  //       stream.getTracks().forEach((track) => peerConnection?.addTrack(track, stream));

  //       // Create offer
  //       const offer = await peerConnection.createOffer();
  //       await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  //       // Send the offer to the other user via Firebase
  //       // Here, you need to implement the Firebase signaling logic
  //       // e.g., update Firebase with the offer

  //       console.log('WebRTC offer created');
  //     } catch (error) {
  //       console.error('Error getting media devices:', error);
  //     }
  //   }
  // };

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

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
              onPress={() => setIsModalVisible(true)} // Show modal on panic button click
              style={styles.panicButton}
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
            <Text style={styles.modalTitle}>Siren Contacts</Text>
            <FlatList
              data={sirenContacts}
              keyExtractor={(item) => item.id || item.username || `${item.firstname}-${item.lastname}`}
              renderItem={({ item }) => (
                <View style={styles.contactItem}>
                  <Text style={styles.contactName}>{item.username}</Text>
                  <TouchableOpacity
                    onPress={() => handleCall(item.number, true)} // Use WebRTC for in-app call
                  >
                    <Text style={styles.callButton}>Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
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
});
