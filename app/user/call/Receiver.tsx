import LoadingOverlay from '@/components/app/LoadingOverlay';
import { db, storage } from '@/firebaseConfig';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onValue, ref, remove, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Receiver = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { roomId, currentUserId, callerId, callerName, isResponder } = params;

  // your states
  const [recording, setRecording] = useState<any>(null);
  const [recordedUri, setRecordedUri] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string>('');

  // caller states
  const [callerAudio, setCallerAudio] = useState<any>(null);

  interface LocationProp {
    coords: {
      longitude: any;
      latitude: any;
    };
  }

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
    try {
      const callRef = ref(db, `calls/${roomId}`);
      await remove(callRef);

      callerDataSend();
      setCallStatus('completed');
    } catch (error) {
      console.error('Failed to end the call:', error);
      Alert.alert('Error', 'Could not end the call. Please try again.');
    }
  };

  // redirect responder ONLY!
  const callerDataSend = async () => {
    if (isResponder === 'true') {
      router.push({
        pathname: '/responder/validation',
        params: {
          callerId: callerId,
          name: callerName || 'Unknown',
        },
      });
    }
  };

  const handleCallRoomNotFound = () => {
    Alert.alert('Call Ended', 'The call room has been closed or does not exist.', [
      {
        text: 'OK',
        onPress: () => {
          if (roomId) {
            const currentCallRef = ref(db, `calls/${roomId}`);
            remove(currentCallRef)
              .then(() => callerDataSend())
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

  useEffect(() => {
    const callRef = ref(db, `calls/${roomId}`);
    const unsubscribe = onValue(callRef, (snapshot) => {
      if (!snapshot.exists()) {
        const room = snapshot.val();

        if (!room) {
          handleCallRoomNotFound();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // if callStatus is not ongoing then we'll add a loading indicating we are waiting for the other side to answer
  if (!callStatus || callStatus !== 'ongoing') {
    if (callStatus === 'completed') {
      return router.back();
    }
    return <LoadingOverlay message="Waiting for answer" visible />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.callForm}>
        <View style={styles.upperForm}>
          <Text style={styles.textCaller}>{callerName || 'Unknown'}</Text>
        </View>
        <View style={styles.lowerForm}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={styles.startButton}
              activeOpacity={0.8}
            >
              <MaterialIcons name="call" size={70} color="white" />
              <Text style={styles.callButtonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
            </TouchableOpacity>
            {/* <Button
            style={styles.startButton}
              title={recording ? 'Stop Recording' : 'Start Recording'}
              onPress={recording ? stopRecording : startRecording}
            /> */}
            <TouchableOpacity
              onPress={() => {
                endCall();
              }}
              style={styles.endButton}
              activeOpacity={0.8}
            >
              <MaterialIcons name="call-end" size={70} color="white" />
              <Text style={styles.endButtonText}>End Call</Text>
            </TouchableOpacity>
            {/* <Button title={'End Call'} onPress={endCall} /> */}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Receiver;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    height: hp(100),
    width: wp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  callForm: {
    padding: 20,
    height: hp(100),
    width: wp(100),
  },
  upperForm: {
    height: hp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: {
    fontSize: 24,
    marginBottom: 20,
  },
  textCaller: {
    fontWeight: 'bold',
    fontSize: 44,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  lowerForm: {
    height: hp(50),
    justifyContent: 'center',
    alignContent: 'center',
  },
  buttonContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  button: {},
  startButton: {
    backgroundColor: '#007C01',
    padding: 20,
    flexWrap: 'wrap',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  endButton: {
    backgroundColor: '#E80001',
    padding: 20,
    borderRadius: 50,
    flexWrap: 'wrap',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    width: wp(17.5),
    fontSize: 18,
    marginTop: 10,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  endButtonText: {
    width: wp(17.5),
    color: 'white',
    fontSize: 18,
    marginTop: 10,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
});
