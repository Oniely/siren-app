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
import { orderByChild, get, update, set, equalTo, limitToFirst, ref, push } from 'firebase/database';
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

    // Filter contacts for "siren" category
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

  // FOR ADDING SIREN CONTACT
  const handleAddSirenContact = async () => {
    if (!selectedUser || !selectedUser.id) {
      Alert.alert('Validation Error', 'Please select a valid user with an ID to add as a Siren contact.');
      return;
    }

    console.log('Selected user for Siren contact:', selectedUser);

    const sirenContact: ContactType = {
      id: selectedUser.id, // This should now have a valid `id`
      username: selectedUser.username,
      firstname: selectedUser.firstname,
      lastname: selectedUser.lastname,
      email: selectedUser.email,
      number: selectedUser.number || '', // Use empty string or null if missing
      category: 'siren',
    };

    await createSirenContactandRoom(sirenContact);
    setModalVisible(false);
    setSelectedUser(null);
    setSearchUsername('');
  };

  async function createSirenContactandRoom(addedContact: ContactType) {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('UserId not found in AsyncStorage');
      return;
    }

    console.log('UserId:', userId);
    console.log('Added Contact:', addedContact);

    // Check that the contact ID is not undefined
    if (!addedContact.id) {
      console.error('Contact ID is missing:', addedContact);
      return;
    }

    // Reference to users' contacts in Firebase Realtime Database
    const usersRef = ref(db, `users/${userId}/contacts/${addedContact.category}/`);
    const newUserRef = push(usersRef); // Creates a new unique ID under the 'contacts/siren' node

    // Reference to the rooms in Firebase
    const messagesRef = ref(db, 'rooms/');
    const newMessagesRef = push(messagesRef); // Creates a new room

    try {
      // Save the contact to Firebase database
      await set(newUserRef, {
        contactId: addedContact.id, // Ensure this is set
        username: addedContact.username,
        email: addedContact.email,
        number: addedContact.number || '', // Ensure it's not undefined
        roomId: newMessagesRef.key, // The new room ID
        category: addedContact.category,
      });

      console.log('Contact saved successfully under category:', addedContact.category);

      // Create the room for the contact
      await set(newMessagesRef, {
        user1: userId,
        user2: addedContact.id,
      });

      console.log('Room created successfully for contact!');
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }
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
  const fetchSirenContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const snapshot = await get(ref(db, `users/${userId}/contacts/siren/`));
        if (snapshot.exists()) {
          // Explicitly typing the sirenContacts as an array of ContactType
          const sirenContacts: ContactType[] = Object.values(snapshot.val() || []);

          setFilteredData((prevData) => {
            // Ensure the return value is correctly typed
            return [...prevData, ...sirenContacts];
          });
        } else {
          console.log('No Siren contacts found');
        }
      } else {
        console.error('User ID is missing');
      }
    } catch (error) {
      console.error('Error fetching Siren contacts:', error);
    }
  };

  //FETCHING USERS
  const fetchUsers = async () => {
    try {
      const snapshot = await get(ref(db, 'users/'));
      if (snapshot.exists()) {
        const usersData = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val(); // Get user data
          const userId = childSnapshot.key; // Get the unique user ID (key in Firebase)
          usersData.push({ id: userId, ...user }); // Add the id to the user object
        });

        setMatchingUsers(usersData); // Set the matching users with the `id` included
      } else {
        console.log('No users found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
    fetchSirenContacts();
    fetchUsers();
  }, []);

  //FETCHING CONTACTS
  useEffect(() => {
    const fetchContacts = async () => {
      // Get the userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');

      // If there's no userId, handle the error
      if (!userId) {
        console.error('UserId not found in AsyncStorage');
        return;
      }

      // Log the userId for debugging
      console.log(userId);

      // Create a reference to the contacts under this userId
      const contactsRef = ref(db, `contacts/${userId}`);

      try {
        // Fetch the data from Firebase
        const snapshot = await get(contactsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          // Format and include placeholders for missing data
          const formattedContacts: ContactType[] = Object.entries(data).map(
            ([contactId, contact]: [string, any]) => ({
              id: contactId, // Use the contact ID as the unique identifier
              firstname: contact.name?.split(' ')[0] || '', // Extract first name
              lastname: contact.name?.split(' ')[1] || '', // Extract last name
              username: contact.name || `${contact.firstname} ${contact.lastname}`,
              email: contact.email || '',
              number: contact.number || '',
              category: contact.category || 'personal', // Default to "personal"
            })
          );

          // Set the formatted contacts to state
          setContacts(formattedContacts);
        } else {
          console.log('No contacts found for the current user');
          setContacts([]); // If no contacts are found, set the contacts state to empty
        }
      } catch (error) {
        console.error('Error fetching contacts: ', error);
      }
    };

    // Call the fetchContacts function when the component mounts
    fetchContacts();
  }, []);

  //FETCH SELECTED USER
  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      console.log('Selected user:', selectedUser); // Ensure the user is selected properly
    }
  }, [selectedUser]); // This will trigger every time selectedUser changes

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
            placeholder="Enter username"
            value={searchUsername}
            onChangeText={(text) => {
              setSearchUsername(text); // Properly updating the state
              handleSearchUsername(); // Trigger search
            }}
          />
          {matchingUsers.length > 0 ? (
            matchingUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={{ padding: 10, marginBottom: 5 }}
                onPress={() => {
                  console.log('User selected:', user); // Ensure that `user` has an id field
                  if (user.id) {
                    setSelectedUser(user);
                  } else {
                    console.error('User ID is missing:', user); // Handle case where id is missing
                  }
                }}
              >
                <View style={styles.usernameContainer}>
                  <Text>{user.username}</Text>
                  <Pressable onPress={handleAddSirenContact}>
                    <FS name="plus-circle" size={24} color="#0b0c63" />
                  </Pressable>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No matching users found</Text>
          )}

          <Pressable onPress={handleSearchUsername} style={styles.addContact}>
            <Text style={styles.addContactText}>Search</Text>
          </Pressable>
          <Pressable style={styles.addContact} onPress={handleAddSirenContact}>
            <Text style={styles.addContactText}>Add Siren Contact</Text>
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

    return filteredContacts.map((contact) => (
      <View key={contact.id} style={styles.contacts}>
        <Pressable style={styles.contactsInfo}>
          <Image
            source={
              contact.category === 'siren' // Check for 'siren' category
                ? require('@/assets/images/call-logo.png') // Add your siren logo
                : contact.category === 'emergency'
                ? require('@/assets/images/call-logo.png')
                : require('@/assets/images/personal-logo.png')
            }
            style={styles.iconLogo}
          />
          <Text style={styles.contactName}>{contact.username}</Text>
          <Pressable onPress={() => sendMessage(contact.number)}>
            <Ionicons name="chatbox-ellipses" size={45} color="#0b0c63" />
          </Pressable>
          <Pressable onPress={() => callNumber(contact.number)}>
            <Ionicons name="call" size={45} color="#0b0c63" />
          </Pressable>
        </Pressable>
      </View>
    ));
  };

  // ADD CONTACT FUNCTION
  const handleAddContact = () => {
    if (!firstname || !lastname || !email || !number) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    const addedContact: ContactType = {
      id: Date.now().toString(),
      username: `${firstname} ${lastname}`,
      firstname: firstname,
      lastname: lastname,
      email: email,
      number: number,
      category,
    };

    createContact(addedContact);
    setModalVisible(false);
  };
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredData(filtered);
    }
  };
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
    bottom: '10%',
    right: '10%',
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
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '60%',
  },
});
