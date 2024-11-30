import ContactCard from '@/components/ContactCard';
import Container from '@/components/Container';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation } from 'expo-router';
import FS from 'react-native-vector-icons/FontAwesome';
import MI from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Footer from '@/components/Footer';
import Ionicons from '@expo/vector-icons/Ionicons';

const Contact = () => {
  const router = useRouter();

  const data = [
    { id: '1', name: 'Apple' },
    { id: '2', name: 'Banana' },
    { id: '3', name: 'Cherry' },
    { id: '4', name: 'Date' },
    { id: '5', name: 'Elderberry' },
  ];

  const [activeTab, setActiveTab] = useState<'Emergency' | 'Personal'>('Emergency');
  const [selectedContactId, setSelectedContactId] = useState<string | number>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactExists, setContactExists] = useState(false);
  const [addedContact, setAddedContact] = useState();
  const [username, setUsername] = useState('');
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const renderContent = () => {
    if (activeTab === 'Emergency') {
      return (
        <View>
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <View key={index} style={styles.contacts}>
                <Pressable style={styles.contactsInfo}>
                  <Image source={require('@/assets/images/call-logo.png')} style={styles.iconLogo} />
                  <Text style={styles.contactName}>Police</Text>
                  <Ionicons name="chatbox-ellipses" size={45} color="#0b0c63" />
                  <Ionicons name="call" size={45} color="#0b0c63" />
                </Pressable>
              </View>
            ))}
        </View>
      );
    }

    if (activeTab === 'Personal') {
      return (
        <View>
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <View key={index} style={styles.contacts}>
                <Pressable style={styles.contactsInfo}>
                  <Image source={require('@/assets/images/personal-logo.png')} style={styles.iconLogo} />
                  <Text style={styles.contactName}>Lorem Ipsum</Text>
                  <Ionicons name="chatbox-ellipses" size={45} color="#0b0c63" />
                  <Ionicons name="call" size={45} color="#0b0c63" />
                </Pressable>
              </View>
            ))}
        </View>
      );
    }
  };

  // Handle Search
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredData(filtered);
    }
  };
  // const handleSelectContact = (id: string | number) => {
  //   setSelectedContactId(id);
  // };

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
    <Container bg="#e6e6e6" style={{ paddingTop: 10 }}>
      {/* <Pressable
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
      </Modal> */}
      <View style={styles.lightBg} />
      <View style={styles.back}>
        <Text style={styles.backText}>My Contacts</Text>
        <Pressable>
          <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
        </Pressable>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          {/* Search Icon */}
          <Icon name="search" size={30} color="#888" style={styles.icon} />

          {/* Text Input */}
          <TextInput
            style={styles.input}
            placeholder="type to search"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.headerTitle}>
          {/* Emergency Tab */}
          <Pressable onPress={() => setActiveTab('Emergency')}>
            <Text style={[styles.header, activeTab === 'Emergency' && styles.activeHeader]}>Emergency</Text>
          </Pressable>

          {/* Personal Tab */}
          <Pressable onPress={() => setActiveTab('Personal')}>
            <Text style={[styles.header, activeTab === 'Personal' && styles.activeHeader]}>Personal</Text>
          </Pressable>
        </View>

        <View style={styles.contactContainer}>
          {renderContent()}

          <View style={styles.contacts}>
            {/* <FlatList
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
            /> */}
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
      <Footer />
    </Container>
  );
};

export default Contact;

const styles = StyleSheet.create({
  police: {
    resizeMode: 'stretch',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 40,
    top: 50,
  },
  searchBar: {
    height: 50,
    borderWidth: 2,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
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
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    gap: 10,
    marginTop: 40,
  },
  backText: {
    fontSize: 30,
    color: '#0c0c63',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    marginTop: '20%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  headerTitle: {
    flexDirection: 'row',
    marginLeft: 40,
    height: 50,
    marginBottom: 10,
  },
  header: {
    paddingVertical: 10,
    marginHorizontal: 'auto',
    color: '#414753',
    fontWeight: 'bold',
    fontSize: 30,
    flex: 1,
    paddingHorizontal: 10,
  },
  activeHeader: {
    color: '#0b0c63',
    borderBottomWidth: 4,
    borderBottomColor: '#0b0c63',
  },
  contactContainer: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  contacts: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 20,
    marginBottom: 10,
  },
  contactsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  contactName: {
    fontSize: 24,
  },
  iconLogo: {
    resizeMode: 'center',
    height: 50,
    width: '25%',
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
