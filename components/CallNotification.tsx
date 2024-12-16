import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { onChildAdded, onValue, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  notify: boolean;
  status: string;
  timestamp: string;
}

// TODO
// UI of caller & receiver screen

const CallNotification = ({ currentUserId }: Props) => {
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [callData, setCallData] = useState<({ roomId: string } & CallType) | null>(null);

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
    setIsModalVisible(false);
    setCallData(null);

    const callRef = ref(db, `calls/${callData?.roomId}`);
    await remove(callRef);
  };

  const handleAccept = async () => {
    setIsModalVisible(false);

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
        },
      });
    } catch (error) {
      console.error('Error accepting call:', error);
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <Modal visible={isModalVisible} transparent>
      <View style={styles.container}>
        <View style={styles.callForm}>
          <View style={styles.upperForm}>
            <Text style={styles.textCaller}>{callData?.caller?.name || 'Unknown'}</Text>
            <Text style={styles.textInfo}>Incoming Call</Text>
          </View>
          <View style={styles.lowerForm}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleAccept} style={styles.acceptButton} activeOpacity={0.8}>
                <MaterialIcons name="call" size={70} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDecline} style={styles.declineButton} activeOpacity={0.8}>
                <MaterialIcons name="call-end" size={70} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
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
