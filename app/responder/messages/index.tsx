import React, { useEffect } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '@/components/Footer';
import FS from 'react-native-vector-icons/FontAwesome';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import MI from 'react-native-vector-icons/MaterialIcons';
// components
import Container from '@/components/Container';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import ResponderFooter from '@/components/responder/ResponderFooter';

// import { equalTo, get, onValue, orderByChild, query, ref } from 'firebase/database';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Footer from '../components/Footer';
// import MessageHeader from '../components/MessageHeader';
// import { db } from '../firebase';

const Messaging = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);

  // useEffect(() => {
  //   init();
  // }, []);

  // async function init() {
  //   const userId = await AsyncStorage.getItem('userId');
  //   const roomsRef = ref(db, 'rooms');

  //   try {
  //     // Step 1: Get all rooms
  //     const roomsSnapshot = await get(roomsRef);

  //     if (roomsSnapshot.exists()) {
  //       const rooms = roomsSnapshot.val();
  //       console.log('ROOMS: ', rooms);
  //       const map = new Map(Object.entries(rooms));
  //       let roomList = [];
  //       for (let [key, value] of map) {
  //         console.log(`${key}: ${value}`);
  //         roomList.push({ id: key, ...value });
  //       }

  //       console.log(roomList);

  //       const filteredData = roomList.filter((room) => room.user1 === userId || room.user2 === userId);
  //       let messagesList = [];
  //       for (let index = 0; index < filteredData.length; index++) {
  //         const element = filteredData[index];
  //         console.log('ELMENET: ', element);
  //         const receiver = () => {
  //           if (element.user1 === userId) {
  //             console.log('TRUE');
  //             return element.user2;
  //           } else {
  //             console.log('FALSE');
  //             return element.user1;
  //           }
  //         };
  //         const receiverId = receiver();
  //         const receiverRef = ref(db, `users/${receiverId}`);
  //         const receiverData = await get(receiverRef);
  //         console.log('HEY', element.messages);
  //         const map = new Map(Object.entries(element.messages));
  //         let allMessages = [];
  //         for (let [key, value] of map) {
  //           console.log(`${key}: ${value}`);
  //           allMessages.push({ id: key, ...value });
  //         }
  //         let list = [];
  //         list.push(element.messages);
  //         messagesList.push({
  //           id: element.id,
  //           receiverId: receiverId,
  //           user: receiverData.val(),
  //           lastMessage: allMessages.sort((a, b) => a.createdAt - b.createdAt)[0],
  //         });
  //         console.log('HI', allMessages);
  //       }
  //       console.log(messagesList);
  //       setMessages(messagesList);
  //     } else {
  //       console.log('No rooms found');
  //     }
  //   } catch (error) {
  //     console.error('Error querying messages:', error);
  //   }
  // }

  return (
    <Container bg="#e6e6e6" style={{ paddingTop: 10 }}>
      <View style={styles.lightBg} />
      <View style={styles.back}>
        <Text style={styles.backText}>Messages</Text>
        <Feather name="edit" size={35} color="#646b79" />
      </View>

      <View style={styles.container}>
        <View style={styles.contactContainer}>
          <View style={styles.messaging}>
            <View style={[styles.messaging]}>
              <Pressable
                style={styles.contactInfo}
                onPress={() =>
                  router.push({
                    pathname: '/user/messages/chat',
                    params: {
                      selectedId: 1,
                      roomId: 1,
                    },
                  })
                }
              >
                <FS name="user-circle" size={40} color="#000" style={{ marginLeft: '10%' }} />
                <View style={styles.messageText}>
                  <View style={styles.leftSideMessage}>
                    <Text style={styles.contactName}>{'Test'}</Text>
                    <Text style={styles.email}>{'Hello, World!'}</Text>
                  </View>
                  <View style={styles.rightSideMessage}>
                    <Text style={styles.time}>{'12:49AM'}</Text>
                    <Text style={styles.number}>{'3'}</Text>
                  </View>
                </View>
              </Pressable>
            </View>
            <FlatList
              data={messages}
              renderItem={({ item }: any) => (
                <View style={[styles.messaging]}>
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
              keyExtractor={(item: any) => item.id}
            />
          </View>
        </View>
      </View>
      <ResponderFooter />
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
  headerMessageIndex: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
  },
  messagesContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  chatButtons: {
    backgroundColor: '#0B0C63',
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
    color: '#F0F1F2',
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

  messaging: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
    width: '100%',
    marginHorizontal: 'auto',
    overflow: 'hidden',
  },
  call: {
    backgroundColor: '#0B0C63',
    padding: 10,
    borderRadius: 10,
    position: 'relative',
    left: -20,
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
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Push content to opposite sides
    alignItems: 'center', // Align items vertically in the center
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
  leftSideMessage: {
    flexShrink: 1,
    paddingRight: 10,
  },
  contactNumber: {
    fontSize: 14,
    color: '#0B0C63',
  },
  rightSideMessage: {
    alignItems: 'flex-end', // Align items to the right
  },
  time: {
    fontSize: 14,
  },
  number: {
    backgroundColor: 'red',
    fontSize: 14,
    width: 15,
    textAlign: 'center',
    borderRadius: 50,
    marginTop: 5, // Add spacing between time and number
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  header: {
    marginVertical: 15,
    textAlign: 'center',
    width: '50%',
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#D6F0F6',
    marginHorizontal: 'auto',
    color: '#0B0C63',
    fontWeight: 'bold',
  },
  contactContainer: {
    flex: 1,
  },
  contacts: {
    flex: 1,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#0B0C63',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
