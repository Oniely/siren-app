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
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TestRecordingScreen = () => {
  const router = useRouter(); // Get the router instance
  const params = useLocalSearchParams();
  const roomId = params.roomId;
  const receiverName = params.name;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const [callDetails, setCallDetails] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [isRecordingAllowed, setIsRecordingAllowed] = useState(true);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For storing interval ID
  const [isCallStarted, setIsCallStarted] = useState(false);
  const callerId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!callerId) return;

    const callRef = ref(db, `calls`);
    const unsubscribe = onValue(callRef, async (snapshot) => {
      if (!snapshot.exists()) {
        handleCallRoomNotFound();
        return;
      }

      const calls = snapshot.val();
      const matchingCall = Object.entries(calls).find(
        ([_, callData]: any) => callData.caller?.id === callerId
      );

      if (matchingCall) {
        const [roomId, callData]: any = matchingCall;
        setCallRoomId(roomId);
        setCallDetails(callData);

        const callerRecordingUri = callData.receiver?.recordingUri;
        if (callerRecordingUri && callerRecordingUri.startsWith('https://') && !isCallStarted) {
          try {
            await playReceiverRecording(callerRecordingUri);
            setIsCallStarted(true);
          } catch (error) {
            console.error('Error auto-playing caller recording:', error);
          }
        }
      } else {
        handleCallRoomNotFound();
      }
    });

    return () => unsubscribe();
  }, [callerId]);

  // Start recording automatically once the call starts
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'You need to allow microphone access to record audio.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording here
      const newRecording = new Audio.Recording();
      // @ts-ignore
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
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingUri(uri);
        setRecording(null);
        setIsRecording(false);

        if (uri) {
          console.log('Recording saved at:', uri);

          // Upload the recording and get the download URL
          const downloadURL = await uploadRecordingToStorage(uri);

          if (downloadURL) {
            // Insert recording data into the call record
            await insertRecordingToCallRoom(downloadURL);
          }
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Could not stop recording. Please try again.');
    }
  };

  // const stopAndUploadRecording = async (currentRecording: Audio.Recording) => {
  //   try {
  //     // Stop the current recording
  //     await currentRecording.stopAndUnloadAsync();
  //     const uri = currentRecording.getURI();

  //     if (uri) {
  //       console.log('Recording saved at:', uri);

  //       // Upload the recording and get the download URL
  //       const downloadURL = await uploadRecordingToStorage(uri);

  //       if (downloadURL) {
  //         // Update Firebase with the new recording URL
  //         await updateCallWithRecording(downloadURL);
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

  // Function to upload recording to Firebase Storage
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
  const insertRecordingToCallRoom = async (downloadURL: string) => {
    try {
      const callsRef = ref(db, `calls`);
      const snapshot = await get(callsRef);

      if (snapshot.exists()) {
        const callsData = snapshot.val();

        // Filter calls where the caller's user ID matches the current user's ID
        const userCalls = Object.entries(callsData).filter(([callId, callData]: any) => {
          return callData.caller?.id === auth.currentUser?.uid;
        });

        if (userCalls.length > 0) {
          const [callId, callData] = userCalls[0];

          // Update the existing call room with the new recording download URL
          const updatedCallData = {
            // @ts-ignore
            ...callData,
            caller: {
              // @ts-ignore
              ...callData.caller,
              recordingUri: downloadURL, // Save the Firebase Storage download URL
            },
            status: 'completed',
            timestamp: new Date().toISOString(),
          };

          const callRef = ref(db, `calls/${callId}`);
          await update(callRef, updatedCallData);

          Alert.alert('Call data updated', 'Recording has been added to the call.');
        } else {
          Alert.alert('Error', 'No matching call found for this user.');
        }
      } else {
        Alert.alert('Error', 'No calls found in the database.');
      }
    } catch (error) {
      console.error('Error inserting recording into call room:', error);
      Alert.alert('Error', 'Could not update call data. Please try again.');
    }
  };

  const playReceiverRecording = async (uri: string) => {
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
    } finally {
      setSound(null);
      setIsPlaying(false);
    }
  };

  // useEffect(() => {
  //   if (isCallStarted) {
  //     startRecordingAutomatically();
  //   }

  //   return () => {
  //     // Clean up any ongoing recordings
  //     if (recording) {
  //       recording.stopAndUnloadAsync();
  //     }
  //   };
  // }, [isCallStarted]);
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // const stopRecording = async () => {
  //   try {
  //     if (recording) {
  //       // Stop the current recording
  //       await recording.stopAndUnloadAsync();
  //       const uri = recording.getURI();

  //       if (uri) {
  //         console.log('Recording saved at:', uri);
  //         const downloadURL = await uploadRecordingToStorage(uri);

  //         if (downloadURL) {
  //           await updateCallWithRecording(downloadURL);
  //         }
  //       }

  //       // Reset recording state
  //       setRecording(null);
  //       setIsRecording(false);
  //       console.log('Recording stopped and unloaded.');
  //     }
  //   } catch (error) {
  //     console.error('Error stopping recording:', error);
  //   }
  // };

  const endCall = async () => {
    try {
      // Stop the recording
      await stopRecording();

      // Disable further recordings
      setIsRecordingAllowed(false);
      setIsCallStarted(false);

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
        <Image source={require('@/assets/images/profile-logo.png')} style={styles.contactImage} />
        <Text style={styles.title}>{receiverName || 'Calling'} </Text>
      </View>
      {callDetails?.receiver?.recordingUri && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.upperButton, { backgroundColor: '#2CFF62' }]}
            onPress={() => playReceiverRecording(callDetails.caller.recordingUri)}
            disabled={!callDetails?.receiver?.recordingUri || isPlaying}
          >
            <Ionicons name="play" size={50} color="white" />
            <Text style={styles.callButtonText}>{isPlaying ? 'Playing...' : "Play Caller's Recording"}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    width: wp(90),
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(5),
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
    height: hp(15),
    width: wp(25),
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endcallButton: {
    backgroundColor: '#2CFF62',
    height: hp(15),
    width: wp(25),
    padding: 15,
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
  upperButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    width: wp(70),
    borderRadius: 30,
    textAlign: 'center',
  },
});

export default TestRecordingScreen;
