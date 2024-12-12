import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, get, query, orderByChild, equalTo, update, onValue, remove } from 'firebase/database';
import { db, auth, storage } from '@/firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const TestRecordingScreen = () => {
  const router = useRouter(); // Get the router instance

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const receiverName = params.name;
  const [callDetails, setCallDetails] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callRoomId, setCallRoomId] = useState<string>(
    'room_1733945490711_VVqOS5w4dsZ8Tv12B8MVbylUNla2_cBH3Ux7ANIcxFPNGm2c2Z3lmlk53'
  );
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For storing interval ID
  const [isCallStarted, setIsCallStarted] = useState(false);
  const callerId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (callerId) {
      const callRef = ref(db, 'calls');
      const unsubscribe = onValue(callRef, (snapshot) => {
        if (snapshot.exists()) {
          const calls = snapshot.val();
          Object.entries(calls).forEach(([roomId, callData]: any) => {
            if (callData.caller.id === callerId) {
              setCallRoomId(roomId);
              setCallDetails(callData);
            }
          });
        }
      });

      return () => unsubscribe();
    }
  }, [callerId]);

  useEffect(() => {
    if (!callRoomId) return;

    const callRef = ref(db, `calls/${callRoomId}`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedCallDetails = snapshot.val();
        setCallDetails(updatedCallDetails);

        // Automatically play receiver's recording if the recordingUri is updated
        if (updatedCallDetails.receiver?.recordingUri) {
          playReceiverRecording(updatedCallDetails.receiver.recordingUri);
        }
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, [callRoomId]);

  // Start recording automatically once the call starts
  const startRecordingAutomatically = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'You need to allow microphone access to record audio.');
        return;
      }

      // Set up audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Only start a new recording if there is no active recording
      if (!isRecording) {
        const newRecording = new Audio.Recording();

        await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await newRecording.startAsync();

        setRecording(newRecording);
        setIsRecording(true);

        console.log('Recording started automatically.');

        // Set a timeout to stop and upload the recording
        setTimeout(async () => {
          try {
            await stopAndUploadRecording(newRecording);
          } catch (error) {
            console.error('Error in recording timeout:', error);
          }
        }, 5000); // 5 seconds
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not start recording automatically. Please try again.');
    }
  };

  const stopAndUploadRecording = async (currentRecording: Audio.Recording) => {
    try {
      // Stop the current recording
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      if (uri) {
        console.log('Recording saved at:', uri);

        // Upload the recording and get the download URL
        const downloadURL = await uploadRecordingToStorage(uri);

        if (downloadURL) {
          // Update Firebase with the new recording URL
          await updateCallWithRecording(downloadURL);
        }
      }

      // Reset recording state
      setRecording(null);
      setIsRecording(false);

      // Immediately start a new recording
      await startRecordingAutomatically();
    } catch (error) {
      console.error('Error stopping and uploading recording:', error);

      // Even if there's an error, try to start a new recording
      setRecording(null);
      setIsRecording(false);
      await startRecordingAutomatically();
    }
  };

  const uploadRecordingToStorage = async (localUri: string) => {
    try {
      console.log('Uploading recording from URI:', localUri);

      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageReference = storageRef(storage, `recordings/${auth.currentUser?.uid}/${Date.now()}.3gp`);

      // Check if blob is created successfully
      if (!blob) {
        throw new Error('Failed to create blob from recording');
      }

      const uploadResult = await uploadBytes(storageReference, blob);

      // Retrieve the download URL from Firebase Storage
      const downloadURL = await getDownloadURL(uploadResult.ref);

      console.log('Recording uploaded successfully. Download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading recording:', error);
      Alert.alert('Upload Error', 'Could not upload recording.');
      return null;
    }
  };

  // Function to insert the recording download URL into Firebase call room
  const updateCallWithRecording = async (downloadURL: string) => {
    try {
      const callRef = ref(db, `calls/${callRoomId}`);
      const callDataUpdate = {
        caller: {
          ...callDetails.caller,
          recordingUri: downloadURL, // Save the Firebase Storage download URL
        },
        status: 'ongoing',
        timestamp: new Date().toISOString(),
      };
      await update(callRef, callDataUpdate);
      console.log('Call updated with new recording URI.');
    } catch (error) {
      console.error('Error updating call with recording:', error);
      Alert.alert('Error', 'Could not update call data.');
    }
  };

  const playReceiverRecording = async (uri: string) => {
    try {
      console.log('Starting to load receiver recording...');
      const { sound, status } = await Audio.Sound.createAsync({ uri });

      // Check if the sound is successfully loaded
      if (status.isLoaded) {
        setSound(sound); // Save the sound instance for later control
        console.log('Receiver recording loaded successfully, starting playback...');
        await sound.playAsync(); // Play the audio
        setIsPlaying(true);

        // Monitor playback status
        sound.setOnPlaybackStatusUpdate((playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            console.log('Playback finished.');
            setIsPlaying(false);
            sound.unloadAsync(); // Unload the sound after playback
            setSound(null);
          }
        });
      } else {
        console.error('Sound could not be loaded:', status.error);
        Alert.alert('Playback Error', 'The audio file could not be loaded for playback.');
      }
    } catch (error) {
      console.error('Error playing receiver recording:', error);
    }
  };

  useEffect(() => {
    if (isCallStarted) {
      startRecordingAutomatically();
    }

    return () => {
      // Clean up any ongoing recordings
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [isCallStarted]);
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const stopRecording = async () => {
    try {
      if (recording) {
        // Stop the current recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri) {
          console.log('Recording saved at:', uri);

          // You can upload the recording here if needed
          const downloadURL = await uploadRecordingToStorage(uri);

          if (downloadURL) {
            // You can update Firebase or do anything else with the URL
            await updateCallWithRecording(downloadURL);
          }
        }

        // Reset recording state
        setRecording(null);
        setIsRecording(false);
        console.log('Recording stopped and unloaded.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const endCall = async () => {
    try {
      // Stop the recording
      await stopRecording();

      // Stop the recording automation if it's active
      if (intervalId) {
        clearInterval(intervalId); // Stop the interval that triggers recording
        setIntervalId(null); // Reset the intervalId state
      }

      // Remove the call room from Firebase
      if (callRoomId) {
        const callRef = ref(db, `calls/${callRoomId}`);
        await remove(callRef); // Delete the call room data from Firebase
        setCallRoomId(''); // Clear the local state
        setCallDetails(null); // Reset the call details
        Alert.alert('Call Ended', 'The call has been ended successfully.');
      } else {
        Alert.alert('Error', 'No active call to end.');
      }

      // Navigate back to the previous screen
      router.back(); // Use router.back() to navigate back to the previous screen
    } catch (error) {
      console.error('Error ending the call:', error);
      Alert.alert('Error', 'Could not end the call. Please try again.');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.contactContainer}>
        <Image source={require('@/assets/images/profile-logo.png')} style={styles.contactImage} />
        <Text style={styles.title}>{receiverName || 'Calling'} </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#FF6347', marginTop: 20 }]}
          onPress={() => setIsCallStarted(true)} // Start the call automatically
        >
          <Ionicons name="mic" size={50} color="white" />
          <Text style={styles.callButtonText}>{isRecording ? 'Recording...' : 'Start Call'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.endcallButton, { backgroundColor: '#FF4500', marginTop: 40 }]}
          onPress={endCall}
        >
          <Ionicons name="call" size={50} color="white" />
          <Text style={styles.callButtonText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  contactContainer: {
    height: hp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: hp(50),
  },
  contactImage: {
    resizeMode: 'contain',
    height: hp(20),
    width: wp(30),
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  callButton: {
    backgroundColor: '#2CFF62',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endcallButton: {
    backgroundColor: '#2CFF62',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
  sectionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TestRecordingScreen;
