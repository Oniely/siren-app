import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Pressable, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/firebaseConfig';
import { ref, get, onValue, push, query, orderByChild } from 'firebase/database';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MessageHeader from '@/components/MessageHeader';
import Container from '@/components/Container';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Receiver {
  username: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: number;
}

const MessagingItem = () => {
  const { roomId } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [receiver, setReceiver] = useState<Receiver | null>(null);

  useEffect(() => {
    async function getUserId() {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId || '');
    }
    getUserId();

    const roomRef = ref(db, `rooms/${roomId}`);
    const roomQuery = query(roomRef, orderByChild('createdAt'));

    // Fetch receiver details and messages from Firebase
    async function fetchReceiverAndMessages() {
      const roomSnapshot = await get(roomRef);
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        const receiverId = roomData.user1 === currentUserId ? roomData.user2 : roomData.user1;
        const receiverRef = ref(db, `users/${receiverId}`);
        const receiverSnapshot = await get(receiverRef);
        if (receiverSnapshot.exists()) {
          setReceiver(receiverSnapshot.val());
        }
      }
    }

    // Fetch messages from Firebase
    async function fetchMessages() {
      onValue(roomQuery, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.entries(data.messages || {}).map(([key, msg]) => ({
            id: key,
            ...msg,
          }));
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      });
    }

    fetchReceiverAndMessages();
    fetchMessages();
  }, [roomId, currentUserId]);

  const createMessage = async () => {
    if (message.trim()) {
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      const userId = await AsyncStorage.getItem('userId');
      push(messagesRef, {
        senderId: userId,
        message,
        createdAt: Date.now(),
      })
        .then(() => setMessage(''))  // Clear the input after sending the message
        .catch((error) => Alert.alert('Error sending message:', error.message));
    }
  };

  return (
    <Container bg="#F0F1F2">
      <MessageHeader username={receiver?.username || 'Loading...'} email={receiver?.email || 'Loading...'} />
      <View style={styles.container}>
        <GestureHandlerRootView style={styles.messagesContent}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={item.senderId === currentUserId ? styles.userMessage : styles.replyMessage}
              >
                {item.senderId !== currentUserId && (
                  <Image
                    source={require('@/assets/images/woman.png')}
                    style={{ resizeMode: 'stretch', width: 40, height: 40 }}
                  />
                )}
                <View style={item.senderId === currentUserId ? styles.userMessageBox : styles.replyBox}>
                  <Text style={styles.replyText}>{item.message}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </GestureHandlerRootView>

        <View style={styles.chatButtons}>
          <View style={styles.actions}>
            <Pressable><MCI name="camera-outline" size={30} color={'#b6b6b7'} /></Pressable>
            <Pressable><Feather name="mic" size={30} color="#b6b6b7" /></Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={'#F0F1F2'}
            onChangeText={setMessage}
            value={message}
          />
          <Pressable><MCI name="image-outline" size={30} color={'#b6b6b7'} /></Pressable>
          <Pressable><FontAwesome name="smile-o" size={30} color="#b6b6b7" /></Pressable>
          <TouchableOpacity onPress={createMessage} style={styles.sendButton}>
            <MCI name="send" size={30} color={'#b6b6b7'} />
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
    marginHorizontal: 'auto',
    paddingVertical: 10,
    gap: 10,
    overflow: 'scroll',
  },
  messagesContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatButtons: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
  },
  input: {
    color: '#000',
    flex: 1,
  },
  replyMessage: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10,
  },
  replyBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#AFE8F3',
    borderRadius: 15,
  },
  replyText: {
    fontSize: 15,
  },
  userMessage: {
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginVertical: 10,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#08B6D9',
  },
  userMessageBox: {
    maxWidth: '80%',
    padding: 15,
    backgroundColor: '#08B6D9',
    borderRadius: 15,
  },
  sendButton: {
    width: 40,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagingItem;