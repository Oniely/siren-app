import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';

const ReceiverCallScreen = () => {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [callDetails, setCallDetails] = useState<any>(null);

  const receiverId = getAuth().currentUser?.uid;

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

  useEffect(() => {
    if (receiverId) {
      fetchCallData(receiverId);
    }
  }, [receiverId]);

  useEffect(() => {
    if (recordingUri && !isPlaying) {
      playRecording();
    }
  }, [recordingUri]);

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
