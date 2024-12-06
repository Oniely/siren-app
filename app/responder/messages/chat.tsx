import Container from '@/components/Container';
import MessageHeader from '@/components/MessageHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

// components
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { equalTo, get, onValue, orderByChild, push, query, ref } from 'firebase/database';
// import Container from '../components/Container';
// import Footer from '../components/Footer';
// import MessageHeader from '../components/MessageHeader';
// import { db } from '../firebase';

interface Receiver {
  username: string;
  email: string;
}

const MessagingItem = () => {
  const router = useRouter();
  const queryParams = useLocalSearchParams();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [currentUserId, setCurrentUserId] = useState('');
  const [receiver, setReceiver] = useState<Receiver | null>(null);

  console.log(queryParams);

  // useEffect(() => {
  //   async function getUserId() {
  //     const userId = await AsyncStorage.getItem('userId');
  //     console.log(userId);
  //     setCurrentUserId(userId);
  //     return userId;
  //   }
  //   const id = getUserId();
  //   const userRef = ref(db, `users/${selectedId}`);
  //   const docRef = ref(db, `rooms/${roomId}`);
  //   const q = query(docRef);

  //   get(userRef)
  //     .then((snapshot) => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         console.log('Matching documents:', data);
  //         setReceiver(data);
  //       } else {
  //         console.log('No matching documents found.');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error retrieving documents:', error);
  //     });

  //   // Get the documents that match the query
  //   get(q)
  //     .then((snapshot) => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         console.log('Matching documents:', data);
  //         if (data.messages) {
  //           const map = new Map(Object.entries(data.messages));
  //           let messageList = [];
  //           for (let [key, value] of map) {
  //             console.log(`${key}: ${value}`);
  //             messageList.push({ id: key, ...value });
  //           }
  //           setMessages(messageList);
  //           console.log(data.messages);
  //         } else {
  //           setMessages([]);
  //         }
  //       } else {
  //         console.log('No matching documents found.');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error retrieving documents:', error);
  //     });

  //   async function updatedMessages(snapshot) {
  //     if (snapshot.exists()) {
  //       const data = snapshot.val();
  //       console.log('Matching documents:', data);
  //       if (data.messages) {
  //         const map = new Map(Object.entries(data.messages));
  //         let messageList = [];
  //         for (let [key, value] of map) {
  //           console.log(`${key}: ${value}`);
  //           messageList.push({ id: key, ...value });
  //         }
  //         setMessages(messageList);
  //         console.log(data.messages);
  //       } else {
  //         setMessages([]);
  //       }
  //     }
  //   }

  //   onValue(
  //     q,
  //     (snapshot) => {
  //       updatedMessages(snapshot);
  //     },
  //     (error) => {
  //       console.error('Error fetching data: ', error);
  //     }
  //   );
  // }, []);

  // async function createMessage(message) {
  //   if (message !== '') {
  //     const messagesRef = ref(db, `rooms/${roomId}/messages`);
  //     const userId = await AsyncStorage.getItem('userId');
  //     push(messagesRef, {
  //       senderId: userId,
  //       message: message,
  //       createdAt: Date.now(),
  //     })
  //       .then(() => {
  //         setMessage(''); // Clear the input field
  //       })
  //       .catch((error) => {
  //         Alert.alert('Error sending message:', error.message);
  //       });
  //   }
  // }

  return (
    <Container bg="#F0F1F2">
      <MessageHeader username={receiver?.username!} email={receiver?.email!} />
      <View style={styles.container}>
        <GestureHandlerRootView style={styles.messagesContent}>
          <FlatList
            data={messages}
            renderItem={({ item }: any) => {
              return item.senderId === currentUserId ? (
                <View style={styles.userMessage}>
                  <Text style={styles.replyText}>{item.message}</Text>
                </View>
              ) : (
                <View style={styles.replyMessage}>
                  <Image
                    source={require('@/assets/images/woman.png')}
                    style={{
                      resizeMode: 'stretch',
                      width: 40,
                      height: 40,
                    }}
                  />
                  <View style={styles.replyBox}>
                    <Text style={styles.replyText}>{item.message}</Text>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item: any) => item.id}
          />
        </GestureHandlerRootView>

        <View style={styles.chatButtons}>
          <View style={styles.actions}>
            <Pressable>
              <MCI name="camera-outline" size={30} color={'#b6b6b7'} />
            </Pressable>
            <Pressable>
              <Feather name="mic" size={30} color="#b6b6b7" />
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={'#F0F1F2'}
            onChangeText={setMessage}
            value={message}
          />
          <Pressable>
            <MCI name="image-outline" size={30} color={'#b6b6b7'} />
          </Pressable>
          <Pressable>
            <Entypo name="emoji-happy" size={30} color="#b6b6b7" />
          </Pressable>
          <TouchableOpacity
            style={{
              width: 40,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            // onPress={() => createMessage(message)}
          >
            <MCI name="send" size={30} color={'#b6b6b7'} />
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default MessagingItem;

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
});
