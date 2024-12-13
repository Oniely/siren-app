import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, get, query, orderByChild, equalTo, update, onValue, remove } from 'firebase/database';
import { db, auth, storage } from '@/firebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ReceiverCallScreen = () => {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);
  const [isReceiverRecordingPlayed, setIsReceiverRecordingPlayed] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);

  const receiverId = getAuth().currentUser?.uid;
  useEffect(() => {
    if (!receiverId) return;

    const callRef = ref(db, 'calls');
    const unsubscribe = onValue(callRef, async (snapshot) => {
      if (!snapshot.exists()) {
        handleCallRoomNotFound();
        return;
      }

      const calls = snapshot.val();
      const matchingCall = Object.entries(calls).find(
        ([_, callData]) => callData.receiver?.id === receiverId
      );

      if (matchingCall) {
        const [roomId, callData] = matchingCall;
        setCallRoomId(roomId);
        setCallDetails(callData);

        const callerRecordingUri = callData.caller?.recordingUri;
        if (callerRecordingUri && callerRecordingUri.startsWith('https://') && !isReceiverRecordingPlayed) {
          try {
            await playCallerRecording(callerRecordingUri);
            setIsReceiverRecordingPlayed(true);
          } catch (error) {
            console.error('Error auto-playing caller recording:', error);
          }
        }
      } else {
        handleCallRoomNotFound();
      }
    });

    return () => unsubscribe();
  }, [receiverId]);
  // Automatic recording function
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'You need to allow microphone access to record audio.');
        return;
      }

      // Start recording here
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started.');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        // Stop the recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri) {
          console.log('Recording saved at:', uri);

          // Upload the recording and play the final version
          const downloadURL = await uploadRecordingToStorage(uri);
          if (downloadURL) {
            await insertRecordingToCallRoom(downloadURL);
            playCallerRecording(downloadURL); // Play only once after stop
          }
        }

        setRecording(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // const stopAndUploadRecording = async (currentRecording: Audio.Recording) => {
  //   try {
  //     // Stop the current recording
  //     await currentRecording.stopAndUnloadAsync();
  //     const uri = currentRecording.getURI();

  //     if (uri && callRoomId) {
  //       console.log('Recording saved at:', uri);

  //       // Upload the recording and get the download URL
  //       const downloadURL = await uploadRecordingToStorage(uri);

  //       if (downloadURL) {
  //         // Update Firebase with the new recording URL
  //         await insertRecordingToCallRoom(downloadURL);
  //       }
  //     }

  //     // Reset recording state
  //     setRecording(null);
  //     setIsRecording(false);

  //     // Immediately start a new recording
  //     await startRecordingAutomatically();
  //   } catch (error) {
  //     console.error('Error stopping and uploading recording:', error);

  //     // Even if there's an error, try to start a new recording
  //     setRecording(null);
  //     setIsRecording(false);
  //     await startRecordingAutomatically();
  //   }
  // };

  const uploadRecordingToStorage = async (localUri: string) => {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageReference = storageRef(storage, `recordings/${auth.currentUser?.uid}/${Date.now()}.3gp`);

      if (!blob) {
        throw new Error('Failed to create blob from recording');
      }

      const uploadResult = await uploadBytes(storageReference, blob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading recording:', error);
      Alert.alert('Upload Error', 'Could not upload recording.');
      return null;
    }
  };

  const insertRecordingToCallRoom = async (downloadURL: string) => {
    try {
      if (!callRoomId || !callDetails) {
        console.log('No call room or details available');
        return;
      }

      const callRef = ref(db, `calls/${callRoomId}`);

      // Ensure we're not overwriting existing call details
      await update(callRef, {
        receiver: {
          ...callDetails.receiver,
          recordingUri: downloadURL,
        },
        status: 'ongoing',
        timestamp: new Date().toISOString(),
      });

      console.log('Call updated with new recording URI.');
    } catch (error) {
      console.error('Error inserting recording into call room:', error);
      Alert.alert('Recording Error', 'Could not update call room with recording.');
    }
  };

  // Automatic recording and playback when call starts
  // useEffect(() => {
  //   if (isCallStarted) {
  //     startRecordingAutomatically();
  //   }

  //   return () => {
  //     if (recording) {
  //       recording.stopAndUnloadAsync();
  //     }
  //   };
  // }, [isCallStarted]);

  // Playback of caller's recording
  const playCallerRecording = async (uri: string) => {
    try {
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        Alert.alert('No recording found', 'Receiver has not uploaded any recording.');
      }
    } catch (error) {
      console.error('Error playing receiver recording:', error);
      Alert.alert('Error', "Couldn't play receiver's recording.");
    }
  };

  // Clean up sound
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // End call function
  const endCall = async () => {
    try {
      // Stop the recording
      if (recording) {
        await recording.stopAndUnloadAsync();
      }

      // Stop the recording automation if it's active
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Remove the call room from Firebase
      if (callRoomId) {
        const callRef = ref(db, `calls/${callRoomId}`);
        await remove(callRef);
        setCallRoomId('');
        setCallDetails(null);
        Alert.alert('Call Ended', 'The call has been ended successfully.');
      } else {
        Alert.alert('Error', 'No active call to end.');
      }

      // Navigate back to the previous screen
      router.back();
    } catch (error) {
      console.error('Error ending the call:', error);
      Alert.alert('Error', 'Could not end the call. Please try again.');
    }
  };

  // Handle room not found
  const handleCallRoomNotFound = () => {
    Alert.alert('Call Ended', 'The call room has been closed or does not exist.', [
      {
        text: 'OK',
        onPress: () => {
          if (callRoomId) {
            const currentCallRef = ref(db, `calls/${callRoomId}`);
            remove(currentCallRef)
              .then(() => router.back())
              .catch((error) => {
                console.error('Error updating call status:', error);
                router.back();
              });
          } else {
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contactContainer}>
        <Text style={styles.title}>{'Calling'} </Text>
        <Image source={require('@/assets/images/profile-logo.png')} style={styles.contactImage} />
        {/* Caller Recording Playback */}
        {callDetails?.caller?.recordingUri && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[styles.upperButton, { backgroundColor: isPlaying ? '#FF6347' : '#2CFF62' }]}
              onPress={() => playCallerRecording(callDetails.caller.recordingUri)}
              disabled={isPlaying}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color="white" />
              <Text style={styles.callButtonText}>
                {isPlaying ? 'Playing...' : "Play Caller's Recording"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#FF6347' }]}
          onPress={startRecording} // Start the call automatically
        >
          <Ionicons name="mic" size={50} color="white" />
          <Text style={styles.callButtonText}>{isRecording ? 'Recording...' : 'Start Call'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.callButton, { backgroundColor: '#FF6347' }]} onPress={stopRecording}>
          <FontAwesome name="send" size={50} color="white" />
          <Text style={styles.callButtonText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.endcallButton, { backgroundColor: '#FF4500' }]} onPress={endCall}>
          <Ionicons name="call" size={50} color="white" />
          <Text style={styles.callButtonText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  endcallButton: {
    backgroundColor: '#2CFF62',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  contactImage: {
    resizeMode: 'contain',
    height: hp(20),
    width: wp(30),
  },
  contactContainer: {
    height: hp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: hp(50),
    flexDirection: 'row',
    width: wp(90),
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(5),
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  callButton: {
    backgroundColor: '#2CFF62',
    height: hp(15),
    width: wp(25),
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startCallButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 18,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    width: wp(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  upperButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    width: wp(70),
    borderRadius: 30,
    textAlign: 'center',
  },
});

export default ReceiverCallScreen;
