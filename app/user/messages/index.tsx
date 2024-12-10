import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import FS from 'react-native-vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, ref, onValue, push, set } from 'firebase/database';
import { db } from '@/firebaseConfig';
import Container from '@/components/Container';
import Footer from '@/components/Footer';

const Messaging = () => {
  const [matchingUsers, setMatchingUsers] = useState<ContactType[]>([]);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<ContactType[]>([]);

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

  interface Room {
    user1: string;
    user2: string;
    messages?: Record<string, { senderId: string; message: string; createdAt: number }>;
  }
  type ContactType = {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    number: string;
    role: string;
  };

  useEffect(() => {
    const roomsRef = ref(db, 'rooms');

    onValue(roomsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const rooms: Record<string, Room> = snapshot.val();

        const roomList: Message[] = [];

        const userId = await AsyncStorage.getItem('userId');
        for (const [key, value] of Object.entries(rooms)) {
          if (value.user1 === userId || value.user2 === userId) {
            const receiverId = value.user1 === userId ? value.user2 : value.user1;

            const receiverRef = ref(db, `users/${receiverId}`);
            const receiverData = await get(receiverRef);

            if (receiverData.exists()) {
              const allMessages = Object.entries(value.messages || {}).map(([key, msg]) => ({
                id: key,
                ...msg,
              }));

              const lastMessage =
                allMessages.length > 0
                  ? allMessages.sort((a, b) => b.createdAt - a.createdAt)[0]
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
        setMessages(roomList);
      }
    });

    return () => {};
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = ref(db, `users`);
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data: Record<string, ContactType> = snapshot.val();
        const filteredUsers = Object.entries(data)
          .filter(([, user]) => user.role === 'user' || user.role === 'responder')
          .map(([userId, user]) => ({
            id: userId,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username || `${user.firstname} ${user.lastname}`,
            email: user.email,
            number: user.number,
            role: user.role,
          }));
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleModal = async () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      await fetchUsers();
    }
  };

  const createRoom = async (selectedUser: ContactType) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in AsyncStorage');
        return;
      }

      const newRoomRef = ref(db, 'rooms');
      const newRoom = {
        user1: userId,
        user2: selectedUser.id,
      };

      const newRoomKey = push(newRoomRef).key;
      await set(ref(db, `rooms/${newRoomKey}`), newRoom);

      setModalVisible(false);
      router.push({
        pathname: '/user/messages/chat',
        params: { selectedId: selectedUser.id, roomId: newRoomKey },
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };
  return (
    <Container bg="#e6e6e6" style={{ paddingTop: 10 }}>
      <View style={styles.lightBg} />
      <View style={styles.back}>
        <Text style={styles.backText}>Messages</Text>
        <TouchableOpacity onPress={toggleModal}>
          <Feather name="edit" size={35} color="#646b79" />
        </TouchableOpacity>
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
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create message</Text>
            {users.length > 0 ? (
              <FlatList
                style={styles.contactContainer}
                data={users}
                renderItem={({ item }) => (
                  <View key={item.id} style={styles.userItem}>
                    <Text>{item.username}</Text>
                    <Pressable onPress={() => createRoom(item)}>
                      <FS name="plus-circle" size={24} color="#0b0c63" />
                    </Pressable>
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text>No users available</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    height: '30%',
  },
  userItem: {
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    width: '100%',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0b0c63',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
