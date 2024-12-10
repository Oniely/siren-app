import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import MI from 'react-native-vector-icons/MaterialIcons';

interface Props {
  username: string;
  email: string;
}

const MessageHeader = ({ username, email }: Props) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {/* <Pressable>
				<MCI size={40} name="menu" color={"#08B6D9"} />
			</Pressable> */}
      <TouchableOpacity onPress={() => router.back()}>
        <MI name="arrow-back-ios" size={40} color={'#0c0c63'} />
      </TouchableOpacity>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.number}>{email}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable>
          <MCI name="information" size={30} color={'#b6b6b7'} />
        </Pressable>
      </View>
    </View>
  );
};

export default MessageHeader;

const styles = StyleSheet.create({
  header: {
    height: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 15,
    paddingTop: 20,
  },

  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#0c0c63',
    fontSize: 25,
    fontWeight: 'bold',
  },
  number: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'semibold',
  },
});
