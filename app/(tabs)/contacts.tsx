import ContactCard from '@/components/ContactCard';
import Container from '@/components/Container';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FS from 'react-native-vector-icons/FontAwesome';
import MI from 'react-native-vector-icons/MaterialIcons';

const Contact = () => {
  const router = useRouter();

  const [selectedContactId, setSelectedContactId] = useState<string | number>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactExists, setContactExists] = useState(false);
  const [addedContact, setAddedContact] = useState();
  const [username, setUsername] = useState('');
  const [contacts, setContacts] = useState([]);

  const handleSelectContact = (id: string | number) => {
    setSelectedContactId(id);
  };

  // useEffect(() => {
  //   getContacts();
  // }, []);
  //
  // async function getContacts() {
  //   const userId = await AsyncStorage.getItem('userId');
  //   const userRef = ref(db, 'users/' + userId + '/contacts');
  //   get(userRef)
  //     .then(snapshot => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         console.log('All documents:', data);
  //         const map = new Map(Object.entries(data));
  //         let contactList = [];
  //         for (let [key, value] of map) {
  //           console.log(`${key}: ${value}`);
  //           contactList.push({id: key, ...value});
  //         }
  //         console.log(contactList);
  //         setContacts(contactList);
  //       } else {
  //         console.log('No data available.');
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error retrieving documents:', error);
  //     });

  //   onValue(
  //     userRef,
  //     snapshot => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         console.log('All documents:', data);
  //         const map = new Map(Object.entries(data));
  //         let contactList = [];
  //         for (let [key, value] of map) {
  //           console.log(`${key}: ${value}`);
  //           contactList.push({id: key, ...value});
  //         }
  //         console.log(contactList);
  //         setContacts(contactList);
  //       } else {
  //         console.log('No data available.');
  //       }
  //     },
  //     error => {
  //       console.error('Error fetching data: ', error);
  //     },
  //   );
  // }

  // async function createContact(addedContact) {
  //   const userId = await AsyncStorage.getItem('userId');
  //   const user = await AsyncStorage.getItem('user');
  //   const role = await AsyncStorage.getItem('role');
  //   const usersRef = ref(db, 'users/' + userId + '/contacts/');
  //   const newUserRef = push(usersRef);
  //   const messagesRef = ref(db, 'rooms/');
  //   const newMessagesRef = push(messagesRef);

  //   set(newUserRef, {
  //     contactId: addedContact.id,
  //     username: addedContact.username,
  //     email: addedContact.email,
  //     roomId: newMessagesRef.key,
  //   })
  //     .then(() => {
  //       console.log('Data saved successfully with auto ID!');
  //     })
  //     .catch(error => {
  //       console.error('Error writing document: ', error);
  //     });

  //   set(newMessagesRef, {
  //     user1: userId,
  //     user2: addedContact.id,
  //   })
  //     .then(() => {
  //       console.log('Data saved successfully with auto ID!');
  //     })
  //     .catch(error => {
  //       console.error('Error writing document: ', error);
  //     });
  // }

  // async function searchContact(username) {
  //   setContactExists(false);
  //   const dbRef = ref(db, 'users');
  //   const userQuery = query(
  //     dbRef,
  //     orderByChild('username'), // Field to filter by
  //     equalTo(username), // Value to match
  //     limitToFirst(1), // Limit the result to only the first match
  //   );

  //   get(userQuery)
  //     .then(snapshot => {
  //       if (snapshot.exists()) {
  //         console.log(snapshot.val());
  //         console.log(Object.keys(snapshot.val()));
  //         const map = new Map(Object.entries(snapshot.val()));
  //         let contactList = [];
  //         for (let [key, value] of map) {
  //           console.log(`${key}: ${value}`);
  //           contactList.push({id: key, ...value});
  //         }
  //         const alreadyAdded = contacts.find(
  //           contact => contact.contactId === contactList[0].id,
  //         );
  //         if (alreadyAdded !== undefined) {
  //           setContactExists(false);
  //         } else {
  //           setAddedContact(contactList[0]);
  //           setContactExists(true);
  //         }
  //       } else {
  //         console.log('No matching data found');
  //         setContactExists(false);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data: ', error);
  //     });

  return (
    <Container
      bg="#0B0C63"
      style={{
        paddingVertical: 10,
      }}
    >
      <Pressable
        style={{ position: 'absolute', bottom: 15, right: 25, zIndex: 10 }}
        onPress={() => setModalVisible(true)}
      >
        <FS name="plus-circle" size={50} color="#D6F0F6" />
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 5 }}>Add Contact</Text>
            <TextInput style={styles.searchInput} placeholder="Search username" />

            {contactExists && (
              <Pressable style={[styles.button, styles.buttonClose]}>
                <Text style={styles.textStyle}>Add Contact</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.lightBg} />
      <View style={styles.back}>
        <TouchableOpacity onPress={() => router.back()}>
          <MI name="arrow-back-ios" size={40} color={'#D6F0F6'} />
        </TouchableOpacity>
        <FS name="user-circle" size={40} color="#D6F0F6" style={{ marginLeft: '10%' }} />
        <Text style={styles.backText}>Contacts</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.contactContainer}>
          <Text style={styles.header}>Personal Contacts</Text>

          <View style={styles.contacts}>
            <FlatList
              data={contacts}
              renderItem={({ item }: any) => (
                <ContactCard
                  id={item.contactId}
                  name={item.username}
                  // source={item.profile}
                  roomId={item.roomId}
                  email={item.email}
                  event={handleSelectContact}
                  selectedId={selectedContactId}
                />
              )}
              keyExtractor={(item: any) => item.id}
            />
          </View>
        </View>

        {/* <View style={styles.contactContainer}>
          <Text style={styles.header}>Emergency Contacts</Text>
          <View style={styles.contacts}>
            <FlatList
              data={emergencyContact}
              renderItem={({item}) => (
                <ContactCard
                  id={item.id}
                  name={item.name}
                  source={item.profile}
                  event={handleSelectContact}
                  selectedId={selectedContactId}
                  navigation={navigation}
                />
              )}
              keyExtractor={item => item.id}
            />
          </View>
        </View> */}
      </View>
    </Container>
  );
};

export default Contact;

const styles = StyleSheet.create({
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
    paddingLeft: 20,
    gap: 10,
    marginTop: 10,
  },
  backText: {
    fontSize: 30,
    color: '#D6F0F6',
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    marginTop: '15%',
    width: '91%',
    marginHorizontal: 'auto',
    backgroundColor: '#08B6D9',
    borderRadius: 30,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    borderColor: 'black',
    borderWidth: 1,
    height: 40,
    marginVertical: 5,
    borderRadius: 10,
    width: 150,
    paddingHorizontal: 10,
  },
});
