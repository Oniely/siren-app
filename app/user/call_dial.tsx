import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { ref, get } from 'firebase/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db, auth } from '@/firebaseConfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const PhoneDialer = () => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [recentNumber, setRecentNumber] = useState('');
  const handlePress = (num) => {
    setDialedNumber(dialedNumber + num);
  };

  const handleDelete = () => {
    setDialedNumber(dialedNumber.slice(0, -1));
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recents</Text>
        <Text style={styles.recentContent}>{recentNumber || 'No recent calls'}</Text>
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
