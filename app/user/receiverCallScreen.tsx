import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/firebaseConfig'; // Your Firebase config
import { getAuth } from 'firebase/auth'; // To get the current user

const ReceiverCallScreen = () => {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Get the receiverId (current user's UID)
  const receiverId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!receiverId) {
      console.log('No receiver ID provided');
      return;
    }

    console.log('Fetching call data for receiverId:', receiverId);
    fetchCallData(receiverId);
  }, [receiverId]); // Re-fetch data when receiverId changes

  // Function to fetch call data based on receiverId
  const fetchCallData = async (receiverId: string) => {
    try {
      console.log('Running query for receiverId:', receiverId);
      const callRef = query(ref(db, 'calls'), orderByChild('receiver/id'), equalTo(receiverId));
      const snapshot = await get(callRef);

      if (snapshot.exists()) {
        console.log('Snapshot data:', snapshot.val());
        snapshot.forEach((call) => {
          const callRoomId = call.key;
          const recordingUri = call.val().caller.recordingUri;

          console.log('Found call:', callRoomId);
          console.log('Recording URI:', recordingUri);

          if (recordingUri) {
            setRecordingUri(recordingUri);
          } else {
            Alert.alert('No recording available', 'The caller has not yet recorded a message.');
          }
        });
      } else {
        console.log('No calls found.');
        Alert.alert('No calls found', 'There are no calls for this receiver.');
      }
    } catch (error) {
      console.error('Error fetching call data:', error);
      Alert.alert('Error', 'Could not fetch the call data. Please try again.');
    }
  };

  // Function to play the recording when URI is available
  const playRecording = async () => {
    if (!recordingUri) {
      console.log('No recording URI available to play');
      Alert.alert('No recording available', 'There is no recording to play.');
      return;
    }

    try {
      console.log('Attempting to play recording:', recordingUri);
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          console.log('Recording finished');
        }
      });
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Could not play the recording. Please try again.');
    }
  };

  // Automatically start playing the recording once the URI is available
  useEffect(() => {
    console.log('Recording URI updated:', recordingUri);
    if (recordingUri && !isPlaying) {
      playRecording(); // Start playing as soon as URI is available
    }
  }, [recordingUri]); // Trigger when recordingUri is set

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receiver Call Screen</Text>
      <Text style={styles.infoText}>Receiver ID: {receiverId}</Text>
      <Text style={styles.infoText}>
        {recordingUri
          ? 'Recording available and will play automatically.'
          : 'Waiting for the caller to record...'}
      </Text>

      {isPlaying && <Text style={styles.infoText}>Playing the recording...</Text>}
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
});

export default ReceiverCallScreen;
