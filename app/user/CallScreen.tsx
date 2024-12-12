import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, update, get } from 'firebase/database';
import { db, auth, storage } from '@/firebaseConfig';

const TestRecordingScreen = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [callRoomId, setCallRoomId] = useState<string>(
    'room_1733945490711_VVqOS5w4dsZ8Tv12B8MVbylUNla2_cBH3Ux7ANIcxFPNGm2c2Z3lmlk53'
  );

  // Function to start recording
  const startRecording = async () => {
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

      // Start recording
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

  // Function to stop recording
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

  // Function to play the recorded audio
  const playRecording = async () => {
    try {
      if (recordingUri) {
        const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
        await sound.playAsync();
        Alert.alert('Playing Recording');
      } else {
        Alert.alert('No recording found', 'Please record audio first.');
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Could not play the recording.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Audio Recording</Text>

      <TouchableOpacity style={styles.callButton} onPress={startRecording} disabled={isRecording}>
        <Ionicons name="mic" size={50} color="white" />
        <Text style={styles.callButtonText}>{isRecording ? 'Recording...' : 'Start Recording'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.callButton, { backgroundColor: '#FF6347', marginTop: 20 }]}
        onPress={stopRecording}
        disabled={!isRecording}
      >
        <Ionicons name="stop" size={50} color="white" />
        <Text style={styles.callButtonText}>Stop Recording</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.callButton, { backgroundColor: '#2CFF62', marginTop: 20 }]}
        onPress={playRecording}
        disabled={!recordingUri}
      >
        <Ionicons name="play" size={50} color="white" />
        <Text style={styles.callButtonText}>Play Recording</Text>
      </TouchableOpacity>
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
  callButtonText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
});

export default TestRecordingScreen;
