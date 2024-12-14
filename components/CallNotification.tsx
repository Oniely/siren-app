import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { onChildAdded, onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal } from 'react-native';

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

// TODO
// remove the 'e' error thats appearing

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

          // Check if the current user is the receiver
          if (call.receiver.id === currentUserId) {
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

  const handleDecline = () => {
    setIsModalVisible(false);
    setCallData(null);

    // TODO
    // update status to decline
  };

  const handleAccept = async () => {
    setIsModalVisible(false);

    let updates: any = {};
    updates[`calls/${callData?.roomId}/status`] = 'ongoing';
    updates[`calls/${callData?.roomId}/notify`] = false;

    await update(ref(db), updates);

    router.push({
      pathname: '/user/call/Receiver',
      params: {
        roomId: callData?.roomId,
        currentUserId,
        callerId: callData?.caller.id,
        callerName: callData?.caller.name,
      },
    });
  };

  return (
    <Modal visible={isModalVisible} transparent>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          style={{
            width: 300,
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Incoming Call</Text>
          {/* <Text style={{ marginBottom: 20 }}>From: {callData?.caller?.name || 'Unknown'}</Text> */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="Decline" onPress={handleDecline} color="red" />
            <Button title="Accept" onPress={handleAccept} color="green" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CallNotification;
