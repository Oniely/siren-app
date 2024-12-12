import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';

const ReceiverCallScreen = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);

  const receiverId = getAuth().currentUser?.uid;

  const fetchCallData = async (receiverId: string) => {
    try {
      const callRef = query(ref(db, 'calls'), orderByChild('receiver/id'), equalTo(receiverId));
      const snapshot = await get(callRef);

      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([roomId, callData]: any) => {
          const callerRecordingUri = callData.caller?.recordingUri;

          if (callerRecordingUri && callerRecordingUri.startsWith('https://')) {
            setCallRoomId(roomId);
            setCallDetails(callData);
            return;
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

        if (uri && callRoomId) {
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
      if (!callRoomId) {
        Alert.alert('Error', 'No call room found.');
        return;
      }

      const callRef = ref(db, `calls/${callRoomId}`);

      // Update the existing call room with the new recording download URL
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

  // Updated playRecording method to play the receiver's recording
  const playRecording = async () => {
    try {
      if (recordingUri) {
        const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        Alert.alert('No recording found', 'Please record audio first.');
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Could not play the recording.');
    }
  };

  // Method to play the caller's recording
  const playCallerRecording = async () => {
    try {
      if (callDetails.caller?.recordingUri) {
        const { sound } = await Audio.Sound.createAsync({ uri: callDetails.caller?.recordingUri });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        Alert.alert('No caller recording found', 'Caller has not recorded anything yet.');
      }
    } catch (error) {
      console.error('Error playing caller recording:', error);
      Alert.alert('Error', "Could not play the caller's recording.");
    }
  };

  useEffect(() => {
    if (receiverId) {
      fetchCallData(receiverId);
    }
  }, [receiverId]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receiver Call Screen</Text>
      <Text style={styles.infoText}>Receiver ID: {receiverId}</Text>

      {/* Caller's Recording Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Caller's Recording</Text>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#2CFF62' }]}
          onPress={playCallerRecording}
          disabled={!callDetails?.caller?.recordingUri || isPlaying}
        >
          <Ionicons name="play" size={50} color="white" />
          <Text style={styles.callButtonText}>{isPlaying ? 'Playing...' : "Play Caller's Recording"}</Text>
        </TouchableOpacity>
      </View>

      {/* Receiver's Recording Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Recording</Text>
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

        {recordingUri && (
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: '#4287f5', marginTop: 20 }]}
            onPress={playRecording}
            disabled={isPlaying}
          >
            <Ionicons name="play" size={50} color="white" />
            <Text style={styles.callButtonText}>{isPlaying ? 'Playing...' : 'Play Your Recording'}</Text>
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
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
  callButton: {
    backgroundColor: '#2CFF62',
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  callButtonText: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
});

export default ReceiverCallScreen;
