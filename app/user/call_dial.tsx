import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking, FlatList } from 'react-native';
import { ref, get, set } from 'firebase/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db, auth } from '@/firebaseConfig'; // Assuming this is your firebase config file
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Audio } from 'expo-av'; // Importing expo-av
import { useRouter } from 'expo-router';
// Define the type for users fetched from Firebase
type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  number: string;
  role: string;
};

const PhoneDialer = () => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [recentNumber, setRecentNumber] = useState('');
  const [users, setUsers] = useState<User[]>([]); // To store users from Firebase
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // To store the selected user
  const [sound, setSound] = useState();
  const router = useRouter();

  // Fetch users from Firebase on component mount
  const fetchUsers = async () => {
    try {
      const usersRef = ref(db, `users`);
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data: Record<string, User> = snapshot.val(); // Type the data correctly
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

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  // Handle number press
  const handlePress = (num: string) => {
    setDialedNumber(dialedNumber + num);
  };

  // Handle delete
  const handleDelete = () => {
    setDialedNumber(dialedNumber.slice(0, -1));
  };

  // Handle calling logic
  const handleCall = () => {
    const url = `tel:${dialedNumber}`;
    if (dialedNumber.length > 0 || dialedNumber.length <= 11) {
      setRecentNumber(dialedNumber);
      Alert.alert(`Calling ${dialedNumber}...`);
      Linking.canOpenURL(url)
        .then((supported) => {
          if (!supported) {
            Alert.alert('Error', 'Your device does not support this feature');
          } else {
            return Linking.openURL(url);
          }
        })
        .catch((err) => console.error('Error opening phone dialer:', err));
    } else {
      Alert.alert('Please enter a number to call.');
    }
  };

  const startAudioCall = async () => {
    if (selectedUser) {
      try {
        // Generate a unique room ID
        const roomId = `room_${Date.now()}_${auth.currentUser?.uid}_${selectedUser.id}`;

        // Reference to the "calls" collection
        const callRef = ref(db, `calls/${roomId}`);

        // Set call data
        await set(callRef, {
          status: 'initiated',
          caller: {
            id: auth.currentUser?.uid,
            name: auth.currentUser?.displayName || 'Unknown Caller',
          },
          receiver: {
            id: selectedUser.id,
            name: selectedUser.username,
          },
          timestamp: new Date().toISOString(),
        });

        Alert.alert(`Audio call started with ${selectedUser.username}`);

        router.push({
          pathname: '/user/CallScreen',
          params: {
            name: selectedUser.username,
          },
        });
      } catch (error) {
        console.error('Error starting audio call: ', error);
        Alert.alert('Error', 'Could not initiate the call. Please try again.');
      }
    } else {
      Alert.alert('Please select a user for the audio call.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recents</Text>
        <Text style={styles.recentContent}>{recentNumber || 'No recent calls'}</Text>
      </View>

      {/* User Selection */}
      <View style={styles.userContainer}>
        <Text style={styles.userTitle}>Select a User</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                setSelectedUser(item); // Update selectedUser
                startAudioCall(); // Now call startAudioCall
              }}
            >
              <Text style={styles.userName}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.inputNumber}>
        <Text style={styles.display}>{dialedNumber || ''}</Text>
        <TouchableOpacity style={styles.deleteIcon}>
          <FontAwesome6 name="delete-left" size={50} color="#A1A1A1" onPress={handleDelete} />
        </TouchableOpacity>
      </View>

      <View style={styles.keypad}>
        {[...Array(9)].map((_, i) => (
          <TouchableOpacity key={i + 1} style={styles.key} onPress={() => handlePress((i + 1).toString())}>
            <Text style={styles.keyText}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={() => handlePress('*')}>
          <Text style={styles.keyText}>*</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handlePress('#')}>
          <Text style={styles.keyText}>#</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.callIcon}>
        <TouchableOpacity style={styles.callkey} onPress={handleCall}>
          <Ionicons name="call" size={50} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.callIcon}>
        <TouchableOpacity style={styles.callkey} onPress={startAudioCall}>
          <Ionicons name="mic" size={50} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height: hp(100),
  },
  recentContainer: {
    height: hp(25),
  },
  recentTitle: {
    fontSize: 45,
    width: wp(90),
    textAlign: 'right',
    marginRight: wp(10),
    fontWeight: 'bold',
    height: hp(5),
  },
  recentContent: {
    fontSize: 24,
    textAlign: 'right',
    marginRight: wp(10),
    fontWeight: 'semibold',
    height: hp(10),
  },
  userContainer: {
    height: hp(25),
    width: wp(90),
    marginBottom: 20,
  },
  userTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
  },
  inputNumber: {
    flexDirection: 'row',
    width: wp(80),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  display: {
    fontSize: 32,
    padding: 10,
    width: wp(60),
    textAlign: 'center',
    borderRadius: 5,
    color: '#A1A1A1',
  },
  deleteIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypad: {
    width: wp(80),
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    width: '30%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 75,
  },
  keyText: {
    padding: 10,
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  callIcon: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(7),
    width: wp(30),
    borderRadius: 50,
    backgroundColor: '#2CFF62',
  },
  callkey: {},
});

export default PhoneDialer;
