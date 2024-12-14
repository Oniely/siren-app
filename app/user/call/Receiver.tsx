import LoadingOverlay from '@/components/app/LoadingOverlay';
import { db, storage } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onValue, ref, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

const Receiver = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { roomId, currentUserId, callerId, callerName } = params;

  // your states
  const [recording, setRecording] = useState<any>(null);
  const [recordedUri, setRecordedUri] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string>('');

  // receiver states
  const [callerAudio, setCallerAudio] = useState<any>(null);

  // record audio and save it to <recording> state
  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Audio recording permissions are required.');
        return;
      }

      console.log('Starting recording..');
      // @ts-ignore
      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // stop recording and automatically updates your recording on db
  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    // setRecordedUri(uri);d

    const downloadURL = await uploadRecordingToStorage(uri);

    // update audio of receiver when stop recording
    const updates: any = {};
    updates[`calls/${roomId}/receiver/recording`] = downloadURL;
    await update(ref(db), updates);

    console.log('Uploaded new recording');
  };

  const uploadRecordingToStorage = async (localUri: string) => {
    try {
      console.log('Uploading recording from URI:', localUri);

      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageReference = storageRef(storage, `recordings/${currentUserId}/${Date.now()}.3gp`);

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

  const endCall = async () => {
    console.log('Ending call...');

    // end call will empty the roomId datas
    let updates: any = {};
    updates[`calls/${roomId}/status`] = 'completed';
    updates[`calls/${roomId}/caller`] = null;
    updates[`calls/${roomId}/receiver`] = null;

    await update(ref(db), updates);

    setCallStatus('completed');
  };

  // purpose is to actively fetch receiver area of data when its updated (mostly recording)
  useEffect(() => {
    const callRef = ref(db, `calls/${roomId}/caller/recording`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      if (snapshot.exists()) {
        const recording = snapshot.val();
        console.log('Receiver (useEffect):', recording);
        setCallerAudio(recording);
      }
    });

    return () => unsubscribe();
  }, []);

  // for status change
  useEffect(() => {
    const callRef = ref(db, `calls/${roomId}/status`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.val();
        console.log('Status(useEffect):', status);
        setCallStatus(status);
      }
    });

    return () => unsubscribe();
  }, []);

  // purpose is to only play the callerAudio when its state change
  useEffect(() => {
    async function init() {
      if (!callerAudio) return;

      try {
        console.log('Playing receiver recording (useEffect)');
        const { sound } = await Audio.Sound.createAsync({ uri: callerAudio });
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing audio: ', error);
      }
    }

    init();
  }, [callerAudio]);

  // if callStatus is not ongoing then we'll add a loading indicating we are waiting for the other side to answer
  if (!callStatus || callStatus !== 'ongoing') return <LoadingOverlay message="Waiting for answer" visible />;

  return (
    <View style={{ padding: 20 }}>
      <Text>Caller Screen</Text>
      <Text>Calling {callerName}</Text>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <Button title={'End Call'} onPress={endCall} />
    </View>
  );
};

export default Receiver;
