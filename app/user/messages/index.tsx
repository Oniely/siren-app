import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FS from 'react-native-vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import Container from '@/components/Container';
import Footer from '@/components/Footer';

// Define the type for a message
interface Message {
  id: string;
  receiverId: string;
  user: {
    username: string;
    email: string; // or other user properties
  };
  lastMessage: {
    message: string;
    createdAt: number;
  };
}

const Messaging = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]); // Explicitly define the state type
  
  useEffect(() => {
    init();
  }, []);

  // Initialize the fetch of rooms and messages
  async function init() {
    const userId = await AsyncStorage.getItem('userId');
    const roomsRef = ref(db, 'rooms');

    try {
      // Step 1: Get all rooms
      const roomsSnapshot = await get(roomsRef);
      
      if (roomsSnapshot.exists()) {
        const rooms = roomsSnapshot.val();
        const roomList: Message[] = [];
        
        // Step 2: Filter rooms where the current user is involved
        for (const [key, value] of Object.entries(rooms)) {
          if (value.user1 === userId || value.user2 === userId) {
            const receiverId = value.user1 === userId ? value.user2 : value.user1;
            
            // Step 3: Fetch the receiver's data
            const receiverRef = ref(db, `users/${receiverId}`);
            const receiverData = await get(receiverRef);

            // Step 4: Ensure receiverData exists before accessing properties
            if (receiverData.exists()) {
              // Step 5: Prepare the message data
              const allMessages = Object.entries(value.messages || {}).map(([key, msg]) => ({
                id: key,
                ...msg,
              }));

              // Check if there are messages, if not, set a default lastMessage
              const lastMessage = allMessages.length > 0
                ? allMessages.sort((a, b) => a.createdAt - b.createdAt)[0]
                : { message: "No messages yet", createdAt: Date.now() }; // Default message if no messages exist

              roomList.push({
                id: key,
                receiverId,
                user: receiverData.val(),
                lastMessage,
              });
            } else {
              console.log(`User data for receiverId ${receiverId} not found`);
            }
          }
        }
        
        // Set messages data
        setMessages(roomList);
      } else {
        console.log('No rooms found');
      }
    } catch (error) {
      console.error('Error querying messages:', error);
    }
  }

  return (
    <Container bg="#e6e6e6" style={{ paddingTop: 10 }}>
      <View style={styles.lightBg} />
      <View style={styles.back}>
        <Text style={styles.backText}>Messages</Text>
        <Feather name="edit" size={35} color="#646b79" />
      </View>

      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={styles.messaging}>
              <Pressable
                style={styles.contactInfo}
                onPress={() =>
                  router.push({
                    pathname: '/user/messages',
                    params: {
                      selectedId: item.receiverId,
                      roomId: item.id,
                    },
                  })
                }
              >
                <FS name="user-circle" size={40} color="#D6F0F6" style={{ marginLeft: '10%' }} />
                <View>
                  <Text style={styles.contactName}>{item.user.username}</Text>
                  <Text style={styles.email}>{item.lastMessage.message}</Text>
                </View>
              </Pressable>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <Footer />
    </Container>
  );
};

export default Messaging;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginHorizontal: 'auto',
    gap: 10,
    overflow: 'scroll',
    backgroundColor: '#faf9f6',
  },
  messaging: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
    width: '100%',
    marginHorizontal: 'auto',
    overflow: 'hidden',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    borderColor: '#000',
    borderWidth: 0.5,
  },
  messageText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '75%',
  },
  contactName: {
    fontSize: 20,
    paddingLeft: 10,
    paddingBottom: 5,
    fontWeight: 'bold',
    color: '#0b0c63',
  },
  email: {
    fontSize: 15,
    fontWeight: '400',
    color: '#b0adad',
    paddingLeft: 10,
  },
  backText: {
    fontSize: 30,
    color: '#0c0c63',
    fontWeight: 'bold',
  },
  lightBg: {
    position: 'absolute',
    height: '62%',
    width: '100%',
    bottom: 0,
    left: 0,
    backgroundColor: '#D6F0F6',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    gap: 10,
    marginTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
});
