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
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import FS from 'react-native-vector-icons/FontAwesome';
import MI from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Footer from '@/components/Footer';
import Ionicons from '@expo/vector-icons/Ionicons';
import useUser from '@/hooks/useUser';
import Loading from '@/components/app/Loading';
import { getAuth } from 'firebase/auth';
import { db, auth } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { orderByChild, get, update, set, equalTo, limitToFirst, ref, push, remove } from 'firebase/database';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Contact = () => {
  const user = getAuth().currentUser;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'Emergency' | 'Personal' | 'Siren'>('Emergency');
  const [selectedContactId, setSelectedContactId] = useState<string | number>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactExists, setContactExists] = useState(false);
  const [addedContact, setAddedContact] = useState();
  const [username, setUsername] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState<string>('personal'); // Default category
  const [searchUsername, setSearchUsername] = useState('');
  const [matchingUsers, setMatchingUsers] = useState<ContactType[]>([]);
  const [selectedUser, setSelectedUser] = useState<ContactType | null>(null);

  const [contacts, setContacts] = useState<
    { id: string; username: string; email: string; number: number; roomId: string }[]
  >([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<
    { id: string; username: string; email: string; roomId: string }[]
  >([]);

  type ContactType = {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    number: string;
    category: 'personal' | 'emergency' | 'siren';
  };
  // FOR SIREN SEARCH USERNAME
  const handleSearchUsername = () => {
    if (!searchUsername?.trim()) {
      setMatchingUsers([]);
      return;
    }

    const matches = matchingUsers.filter((user) =>
      user.username.toLowerCase().includes(searchUsername.toLowerCase())
    );
    setMatchingUsers(matches);
  };

  // FOR SIREN SEARCH USERNAME
  const handleSearchSiren = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredData(contacts.filter((contact) => contact.category === 'siren'));
    } else {
      setFilteredData(
        contacts.filter(
          (contact) =>
            contact.category === 'siren' && contact.username.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const handleAddSirenContact = async (user: ContactType) => {
    if (!user || !user.id) {
      Alert.alert('Validation Error', 'Invalid user selected. Please try again.');
      return;
    }

    const sirenContact: ContactType = {
      id: user.id,
      username: user.username,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      number: user.number || '',
      category: 'siren',
    };

    try {
      await createSirenContactandRoom(sirenContact);
      setContacts((prevContacts) => [...prevContacts, sirenContact]);

      if (activeTab.toLowerCase() === 'siren') {
        setFilteredData((prevFilteredData) => [...prevFilteredData, sirenContact]);
      }
      setModalVisible(false);
      setSelectedUser(null);
      setSearchUsername('');
    } catch (error) {
      console.error('Error adding Siren contact:', error);
    }
  };
  async function createSirenContactandRoom(addedContact: ContactType) {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('UserId not found in AsyncStorage');
      return;
    }
    console.log('UserId:', userId);
    console.log('Added Contact:', addedContact);

    if (!addedContact.id) {
      console.error('Contact ID is missing:', addedContact);
      return;
    }

    const usersRef = ref(db, `users/${userId}/contacts/${addedContact.category}/`);
    const newUserRef = push(usersRef);

    const messagesRef = ref(db, 'rooms/');
    const newMessagesRef = push(messagesRef);

    const sirenContactRef = ref(db, `contacts/${userId}`);
    const newsirenContactRef = push(sirenContactRef);

    try {
      await set(newUserRef, {
        contactId: addedContact.id,
        username: addedContact.username,
        email: addedContact.email,
        number: addedContact.number || '',
        roomId: newMessagesRef.key,
        category: addedContact.category,
      });
      await set(newsirenContactRef, {
        name: addedContact.firstname + ' ' + addedContact.lastname,
        email: addedContact.email,
        number: addedContact.number,
        category: addedContact.category,
        userId: userId,
      });
      console.log('Contact saved successfully under category:', addedContact.category);

      await set(newMessagesRef, {
        user1: userId,
        user2: addedContact.id,
      });

      console.log('Room created successfully for contact!');
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  const handleDeleteContact = async (contactId: string, category: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('UserId not found in AsyncStorage');
        return;
      }

      const contactRef = ref(db, `contacts/${userId}/${contactId}`);
      await remove(contactRef);

      setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));

      setFilteredData((prevData) => prevData.filter((contact) => contact.id !== contactId));

      Alert.alert('Success', 'Contact deleted successfully.');
    } catch (error) {
      console.error('Error deleting contact:', error);
      Alert.alert('Error', 'Failed to delete the contact.');
    }
  };
  // PHONE LINKING
  const callNumber = (number: string) => {
    const url = `tel:${number}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Your device does not support this feature');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Error opening phone dialer:', err));
  };
  // MESSAGE LINKING
  const sendMessage = (phoneNumber: string, message: string = '') => {
    const url = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Your device does not support this feature');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Error opening SMS app:', err));
  };

  // INSERTING DATA FOR CONTACTS
  async function createContact(addedContact: ContactType) {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('UserId not found in AsyncStorage');
      return;
    }

    console.log('UserId:', userId);
    console.log('Added Contact:', addedContact);

    const contactRef = ref(db, `contacts/${userId}`);
    const newContactRef = push(contactRef);

    try {
      await set(newContactRef, {
        name: addedContact.firstname + ' ' + addedContact.lastname,
        email: addedContact.email,
        number: addedContact.number,
        category: addedContact.category,
        userId: userId,
      });
      console.log('Contact saved successfully under category:', addedContact.category);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  // FETCHING SIREN CONTACTS
  // useEffect(() => {
  //   const fetchSirenContacts = async () => {
  //     try {
  //       const userId = await AsyncStorage.getItem('userId');
  //       if (userId) {
  //         const snapshot = await get(ref(db, `users/${userId}/contacts/siren/`));
  //         if (snapshot.exists()) {
  //           const sirenContacts: ContactType[] = Object.values(snapshot.val() || []);

  //           setFilteredData((prevData) => {
  //             return [...prevData, ...sirenContacts];
  //           });
  //         } else {
  //           console.log('No Siren contacts found');
  //         }
  //       } else {
  //         console.error('User ID is missing');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching Siren contacts:', error);
  //     }
  //   };
  //   fetchSirenContacts();
  // }, []);
  //FETCHING USERS
  const fetchUsers = async () => {
    try {
      const snapshot = await get(ref(db, 'users/'));
      if (snapshot.exists()) {
        const usersData = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          const userId = childSnapshot.key;
          usersData.push({ id: userId, ...user });
        });

        setMatchingUsers(usersData);
      } else {
        console.log('No users found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  //FETCHING CONTACTS
  useEffect(() => {
    const fetchContacts = async () => {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        console.error('UserId not found in AsyncStorage');
        return;
      }
      const contactsRef = ref(db, `contacts/${userId}`);

      try {
        const snapshot = await get(contactsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          const formattedContacts: ContactType[] = Object.entries(data).map(
            ([contactId, contact]: [string, any]) => ({
              id: contactId,
              firstname: contact.name?.split(' ')[0] || '',
              lastname: contact.name?.split(' ')[1] || '',
              username: contact.name || `${contact.firstname} ${contact.lastname}`,
              email: contact.email || '',
              number: contact.number || '',
              category: contact.category || 'personal',
            })
          );

          // Set the formatted contacts to state
          setContacts(formattedContacts);
        } else {
          console.log('No contacts found for the current user');
          setContacts([]);
        }
      } catch (error) {
        console.error('Error fetching contacts: ', error);
      }
    };
    fetchContacts();
  }, []);

  //FETCH SELECTED USER
  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      console.log('Selected user:', selectedUser);
    }
  }, [selectedUser]);

  // SEARCH FILTER
  useEffect(() => {
    if (searchText) {
      setFilteredData(
        contacts.filter((contact) => contact.username.toLowerCase().includes(searchText.toLowerCase()))
      );
    } else {
      setFilteredData(contacts);
    }
  }, [contacts, searchText]);

  // MODAL CONTENT
  const renderModalContent = () => {
    if (category === 'siren') {
      return (
        <>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 5 }}>Search Username</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Username"
            value={searchUsername}
            onChangeText={(text) => {
              setSearchUsername(text);
              handleSearchUsername();
            }}
          />
          {matchingUsers.length > 0 ? (
            <ScrollView style={[styles.scrollContainer]}>
              {matchingUsers.map((user) => (
                <View key={user.id} style={styles.userItem}>
                  <View style={styles.usernameContainer}>
                    <Text>{user.username}</Text>
                    <Pressable onPress={() => handleAddSirenContact(user)}>
                      <FS name="plus-circle" size={24} color="#0b0c63" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text>No matching users found</Text>
          )}
          <Pressable onPress={handleSearchUsername} style={styles.addContact}>
            <Text style={styles.addContactText}>Search</Text>
          </Pressable>
        </>
      );
    } else {
      return (
        <>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 5 }}>Add Contact</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="First name"
            value={firstname}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Last name"
            value={lastname}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Number"
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
          />

          <Pressable style={styles.addContact} onPress={handleAddContact}>
            <Text style={styles.addContactText}>Add Contact</Text>
          </Pressable>
        </>
      );
    }
  };

  // DISPLAY CONTACT INFORMATION
  const renderContent = () => {
    const filteredContacts = filteredData.filter(
      (contact) => contact.category.toLowerCase() === activeTab.toLowerCase()
    );

    if (!filteredContacts.length) {
      return <Text style={{ textAlign: 'center', marginTop: 20 }}>No contacts available</Text>;
    }

    return (
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contactList}
        renderItem={({ item }) => (
          <View style={styles.contacts}>
            <Pressable style={styles.contactsInfo}>
              <Image
                source={
                  item.category === 'siren'
                    ? require('@/assets/images/logo.png')
                    : item.category === 'emergency'
                    ? require('@/assets/images/call-logo.png')
                    : require('@/assets/images/personal-logo.png')
                }
                style={styles.iconLogo}
              />
              <Text style={styles.contactName}>{item.username}</Text>
              <View style={styles.contactIcons}>
                <Pressable onPress={() => sendMessage(item.number)}>
                  <Ionicons name="chatbox-ellipses" size={30} color="#0b0c63" />
                </Pressable>
                <Pressable onPress={() => callNumber(item.number)}>
                  <Ionicons name="call" size={30} color="#0b0c63" />
                </Pressable>
                <Pressable onPress={() => handleDeleteContact(item.id, item.category)}>
                  <Ionicons name="trash" size={30} color="red" />
                </Pressable>
              </View>
            </Pressable>
          </View>
        )}
      />
    );
  };
  // ADD CONTACT FUNCTION
  const handleAddContact = async () => {
    if (!firstname || !lastname || !email || !number) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const addedContact: ContactType = {
      id: Date.now().toString(),
      username: `${firstname} ${lastname}`,
      firstname,
      lastname,
      email,
      number,
      category,
    };

    try {
      await createContact(addedContact);

      setContacts((prevContacts) => [...prevContacts, addedContact]);

      if (activeTab.toLowerCase() === category) {
        setFilteredData((prevFilteredData) => [...prevFilteredData, addedContact]);
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  // const handleSearch = (text: string) => {
  //   setSearchText(text);

  //   if (text.trim() === '') {
  //     setFilteredData(data);
  //   } else {
  //     const filtered = data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
  //     setFilteredData(filtered);
  //   }
  // };
  return (
    <Container bg="#e6e6e6" style={{ paddingTop: 10 }}>
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <FS name="plus-circle" size={50} color="#0b0c63" />
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue: string) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Personal" value="personal" />
              <Picker.Item label="Emergency" value="emergency" />
              <Picker.Item label="Siren" value="siren" />
            </Picker>

            {renderModalContent()}
          </View>
        </View>
      </Modal>
      <View style={styles.back}>
        <Text style={styles.backText}>My Contacts</Text>
        <Pressable onPress={() => router.push('/user/profile')}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile-logo.png')}
            style={styles.police}
          />
        </Pressable>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={30} color="#888" style={styles.icon} />
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
          {/* Siren */}
          <Pressable onPress={() => setActiveTab('Siren')}>
            <Text style={[styles.header, activeTab === 'Siren' && styles.activeHeader]}>Siren</Text>
          </Pressable>
        </View>
        <View style={styles.contactContainer}>{renderContent()}</View>
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
    width: wp('100%'),
    flexWrap: 'wrap',
    overflow: 'scroll',
  },
  header: {
    paddingVertical: 10,
    marginHorizontal: 'auto',
    color: '#414753',
    fontWeight: 'bold',
    fontSize: 25,
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
    justifyContent: 'space-between',
    flex: 1,
    width: wp('100%'),
    flexWrap: 'wrap',
  },
  contactName: {
    fontSize: 24,
    flexWrap: 'wrap',
    width: '33%',
  },
  contactIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconLogo: {
    resizeMode: 'center',
    height: 50,
    width: '20%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: '80%',

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
    width: '80%',
    paddingHorizontal: 10,
  },
  addButton: {
    zIndex: 10,
    bottom: hp('10%'),
    right: wp('10%'),
    position: 'absolute',
  },
  addContact: {
    backgroundColor: '#0B0C63',
    width: '40%',
    padding: 15,
    textAlign: 'center',
    marginTop: '5%',
    borderRadius: 10,
    alignItems: 'center',
  },
  addContactText: {
    color: '#fff',
  },
  picker: {
    height: 50,
    width: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  contactListItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  contactListItemText: {
    fontSize: 18,
  },
  scrollContainer: {
    maxHeight: 300, // Set your desired height
    marginVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
  },
  userItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactList: {},
});
