import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import FS from 'react-native-vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref, onValue } from 'firebase/database';
import { db } from '@/firebaseConfig';
import Container from '@/components/Container';
import Footer from '@/components/responder/responderFooter';

interface Message {
  id: string;
  receiverId: string;
  user: {
    username: string;
    email: string; 
  };
  lastMessage: {
    message: string;
    createdAt: number;
  };
}

// Define the structure of the rooms data
interface Room {
  user1: string;
  user2: string;
  messages?: Record<string, { senderId: string; message: string; createdAt: number }>;
}

const Messaging = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Set up live listener for room updates
    const roomsRef = ref(db, 'rooms');
    
    // Use the onValue listener to fetch real-time data
    onValue(roomsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const rooms: Record<string, Room> = snapshot.val();  // Type the rooms data

        const roomList: Message[] = [];

        // Loop through rooms and get the necessary information
        const userId = await AsyncStorage.getItem('userId');
        for (const [key, value] of Object.entries(rooms)) {
          if (value.user1 === userId || value.user2 === userId) {
            const receiverId = value.user1 === userId ? value.user2 : value.user1;

            // Fetch receiver data
            const receiverRef = ref(db, `users/${receiverId}`);
            const receiverData = await get(receiverRef);

            if (receiverData.exists()) {
              const allMessages = Object.entries(value.messages || {}).map(([key, msg]) => ({
                id: key,
                ...msg,
              }));

              const lastMessage =
                allMessages.length > 0
                  ? allMessages.sort((a, b) => b.createdAt - a.createdAt)[0]  // Sort in descending order
                  : { message: 'No messages yet', createdAt: Date.now() };

              roomList.push({
                id: key,
                receiverId,
                user: receiverData.val(),
                lastMessage,
              });
            }
          }
        }

        setMessages(roomList);  // Update the state with the new room list
      }
    });

    // Cleanup function to remove the listener if the component unmounts
    return () => {
      // You can add a listener removal here if needed, e.g., off()
    };
  }, []);  // Empty dependency array ensures this effect runs only once

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
                    pathname: '/user/messages/chat',
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
