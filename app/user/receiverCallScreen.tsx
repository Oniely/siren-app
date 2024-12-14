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
const ReceiverCallScreen = () => {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);
  const [isReceiverRecordingPlayed, setIsReceiverRecordingPlayed] = useState(false); // New flag
  const receiverId = getAuth().currentUser?.uid;
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For storing interval ID
  const [isCallStarted, setIsCallStarted] = useState(false);

  useEffect(() => {
    if (!receiverId) return;

    const callRef = ref(db, `calls`);
    const unsubscribe = onValue(callRef, async (snapshot) => {
      if (!snapshot.exists()) {
        handleCallRoomNotFound();
        return;
      }

      const calls = snapshot.val();
      const matchingCall = Object.entries(calls).find(
        ([_, callData]: any) => callData.receiver?.id === receiverId
      );

      if (matchingCall) {
        const [roomId, callData]: any = matchingCall;
        setCallRoomId(roomId);
        setCallDetails(callData);

        const callerRecordingUri = callData.caller?.recordingUri;
        if (callerRecordingUri && callerRecordingUri.startsWith('https://') && !isCallStarted) {
          try {
            await playCallerRecording(callerRecordingUri);
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
  }, [receiverId]);

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

      // @ts-ignore
      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      Alert.alert('Recording started.');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not start recording. Please try again.');
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

        if (uri && callRoomId) {
          console.log('Recording saved at:', uri);

          const downloadURL = await uploadRecordingToStorage(uri);

          if (downloadURL) {
            await insertRecordingToCallRoom(downloadURL);
          }
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Could not stop recording. Please try again.');
    }
  };

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
      const callsRef = ref(db, `calls`);
      const snapshot = await get(callsRef);

      if (snapshot.exists()) {
        const callsData = snapshot.val();

        // Filter calls where the caller's user ID matches the current user's ID
        const userCalls = Object.entries(callsData).filter(([callId, callData]: any) => {
          return callData.receiver?.id === auth.currentUser?.uid;
        });

        if (userCalls.length > 0) {
          const [callId, callData] = userCalls[0];

          // Update the existing call room with the new recording download URL
          const updatedCallData = {
            // @ts-ignore
            ...callData,
            receiver: {
              // @ts-ignore
              ...callData.receiver,
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
    } finally {
      setSound(null);
      setIsPlaying(false);
    }
  };
  // Updated playRecording method to play the receiver's recording
  // const playRecording = async () => {
  //   try {
  //     if (recordingUri) {
  //       const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
  //       setSound(sound);
  //       await sound.playAsync();
  //       setIsPlaying(true);

  //       sound.setOnPlaybackStatusUpdate((status: any) => {
  //         if (status.isLoaded && status.didJustFinish) {
  //           setIsPlaying(false);
  //         }
  //       });
  //     } else {
  //       Alert.alert('No recording found', 'Please record audio first.');
  //     }
  //   } catch (error) {
  //     console.error('Error playing recording:', error);
  //     Alert.alert('Error', 'Could not play the recording.');
  //   }
  // };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);
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
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.upperButton, { backgroundColor: '#2CFF62' }]}
            onPress={() => playCallerRecording(callDetails.receiver.recordingUri)}
            disabled={!callDetails?.caller?.recordingUri || isPlaying}
          >
            <Ionicons name="play" size={50} color="white" />
            <Text style={styles.callButtonText}>{isPlaying ? 'Playing...' : "Play Caller's Recording"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.callButton} onPress={startRecording} disabled={isRecording}>
          <Ionicons name="mic" size={50} color="white" />
          <Text style={styles.callButtonText}>{isRecording ? 'Recording...' : 'Start Recording'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#FF6347' }]}
          onPress={stopRecording}
          disabled={!isRecording}
        >
          <FontAwesome name="send" size={50} color="white" />
          <Text style={styles.callButtonText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.callButton, { backgroundColor: '#FF4500' }]} onPress={endCall}>
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
