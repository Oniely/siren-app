import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { onChildAdded, onValue, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, Pressable, TouchableOpacity, Vibration } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LoadingOverlay from './app/LoadingOverlay';

interface Props {
  currentUserId: string;
}

interface CallType {
  caller: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
  toResponder?: boolean;
  notify: boolean;
  status: string;
  timestamp: string;
}

const CallNotification = () => {
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  console.log('Call Notification CurrentUser: ', currentUserId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [callData, setCallData] = useState<({ roomId: string } & CallType) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const callsRef = ref(db, 'calls');

    // Listen for any changes in the calls collection
    const unsubscribe = onValue(callsRef, (snapshot) => {
      const calls = snapshot.val();
      if (calls) {
        // Loop through the calls to check if there's a new call for the current user
        for (let roomId in calls) {
          const call = calls[roomId];

          console.log('CallNotification Data: ', call);

          // TODO
          // can improve logic of notif to only appear when status is initiated or when notify is true

          // Check if the current user is the receiver
          if (call.receiver.id === currentUserId && call.notify) {
            console.log('CALLING!');
            setCallData({ ...call, roomId });
            setIsModalVisible(true);
            Vibration.vibrate(2000);
            return;
          }
        }
      } else {
        // Hide modal if no calls exist
        setIsModalVisible(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const handleDecline = async () => {
    setLoading(true);
    setIsModalVisible(false);
    setCallData(null);

    Vibration.cancel();

    try {
      const callRef = ref(db, `calls/${callData?.roomId}`);
      await remove(callRef);
    } catch (error) {
      console.error('Handle Decline Error: ', error);
    } finally {
      setLoading(true);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    setIsModalVisible(false);

    Vibration.cancel();

    try {
      let updates: any = {};
      updates[`calls/${callData?.roomId}/status`] = 'ongoing';
      updates[`calls/${callData?.roomId}/notify`] = false;

      await update(ref(db), updates);

      console.log(callData);

      router.push({
        pathname: '/user/call/Receiver',
        params: {
          roomId: callData?.roomId,
          currentUserId,
          callerId: callData?.caller.id,
          callerName: callData?.caller.name,
          isResponder: callData?.toResponder ? 'true' : 'false', // used string because boolean don't work
        },
      });
    } catch (error) {
      console.error('Error accepting call:', error);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} message="Redirecting to call..." />
      <Modal visible={isModalVisible} transparent>
        <View style={styles.container}>
          <View style={styles.callForm}>
            <View style={styles.upperForm}>
              <Text style={styles.textCaller}>{callData?.caller?.name || 'Unknown'}</Text>
              <Text style={styles.textInfo}>Incoming Call</Text>
            </View>
            <View style={styles.lowerForm}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleAccept}
                  style={styles.acceptButton}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <MaterialIcons name="call" size={70} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDecline}
                  style={styles.declineButton}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <MaterialIcons name="call-end" size={70} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CallNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  callForm: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
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
  acceptButton: {
    backgroundColor: '#007C01',
    padding: 20,
    borderRadius: 50,
  },
  declineButton: {
    backgroundColor: '#E80001',
    padding: 20,
    borderRadius: 50,
  },
});
