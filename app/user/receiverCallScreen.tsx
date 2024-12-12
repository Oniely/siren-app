import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref, get, query, orderByChild, equalTo, update, onValue, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ReceiverCallScreen = () => {
  const router = useRouter();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For storing interval ID
  const [isCallStarted, setIsCallStarted] = useState(false);
  const receiverId = getAuth().currentUser?.uid;

<<<<<<< HEAD
=======
  const fetchCallData = async (receiverId: string) => {
    try {
      const callRef = query(ref(db, 'calls'), orderByChild('receiver/id'), equalTo(receiverId));
      const snapshot = await get(callRef);

      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([callRoomId, callData]: any) => {
          const recordingUri = callData.caller?.recordingUri;

          if (recordingUri && recordingUri.startsWith('https://')) {
            setRecordingUri(recordingUri); // Set the URI
            setCallDetails(callData); // Optionally, you can store additional call details
            return; // Exit the loop once a valid recording is found
          }
        });
      } else {
        Alert.alert('No Calls', 'There are no calls for this receiver.');
      }
    } catch (error) {
      console.error('Error fetching call data:', error);
      Alert.alert('Error', 'Could not fetch the call data. Please try again.');
    }
  };

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert('No Recording', 'There is no recording to play.');
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Could not play the recording. Please try again.');
    }
  };

>>>>>>> b184e995b332498fcf567d3df4f8980c9188ead5
  useEffect(() => {
    if (receiverId) {
      const callRef = ref(db, 'calls');
      const unsubscribe = onValue(callRef, (snapshot) => {
        if (snapshot.exists()) {
          const calls = snapshot.val();
          Object.entries(calls).forEach(([roomId, callData]: any) => {
            if (callData.receiver.id === receiverId) {
              setCallRoomId(roomId);
              setCallDetails(callData);
            }
          });
        }
      });

      return () => unsubscribe();
    }
  }, [receiverId]);

  useEffect(() => {
    if (!callRoomId) return;

    const callRef = ref(db, `calls/${callRoomId}`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedCallDetails = snapshot.val();
        setCallDetails(updatedCallDetails);

        // Automatically play receiver's recording if the recordingUri is updated
        if (updatedCallDetails.caller?.recordingUri) {
          playCallerRecording(updatedCallDetails.caller.recordingUri);
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
        receiver: {
          ...callDetails.receiver,
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

  const insertRecordingToCallRoom = async (downloadURL: string) => {
    try {
      if (!callRoomId) {
        Alert.alert('Error', 'No call room found.');
        return;
      }

      const callRef = ref(db, `calls/${callRoomId}`);

      const updatedCallData = {
        ...callDetails,
        receiver: {
          ...callDetails.receiver,
          recordingUri: downloadURL, // Save the Firebase Storage download URL
        },
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      await update(callRef, updatedCallData);

      Alert.alert('Call data updated', 'Recording has been added to the call.');
    } catch (error) {
      console.error('Error inserting recording into call room:', error);
      Alert.alert('Error', 'Could not update call data. Please try again.');
    }
  };

  const playCallerRecording = async (uri: string) => {
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
            sound.unloadAsync();
            setSound(null);
          }
        });
      } else {
        console.error('Sound could not be loaded:');
        Alert.alert('Playback Error', 'The audio file could not be loaded for playback.');
      }
    } catch (error) {
      console.error('Error playing receiver recording:');
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

  const endCall = async () => {
    try {
      // Stop the recording automation
      if (intervalId) {
        clearInterval(intervalId); // Stop the interval that triggers recording
        setIntervalId(null); // Reset the intervalId state
      }

      // Stop and unload the current recording if it's active
      if (recording) {
        await recording.stopAndUnloadAsync(); // Stop the recording
        setRecording(null); // Clear the recording state
        setIsRecording(false); // Set the recording state to false
      }
      if (!callRoomId) {
        Alert.alert('Error', 'Call Room ID is not available.');
        return;
      }
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
        <Text style={styles.title}>Calling</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#FF6347', marginTop: 20 }]}
          onPress={() => setIsCallStarted(true)}
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

export default ReceiverCallScreen;
