import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  username: string;
  email: string;
}

const MessageHeader = ({ username, email }: Props) => {
  return (
    <View style={styles.header}>
      {/* <Pressable>
				<MCI size={40} name="menu" color={"#08B6D9"} />
			</Pressable> */}
      <Image
        source={require('@/assets/images/woman.png')}
        style={{
          resizeMode: 'stretch',
          width: 40,
          height: 40,
        }}
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.number}>{email}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable>
          <MCI name="phone" size={30} color={'#08B6D9'} />
        </Pressable>
        <Pressable>
          <MCI name="video" size={30} color={'#08B6D9'} />
        </Pressable>
        <Pressable>
          <MCI name="information" size={30} color={'#08B6D9'} />
        </Pressable>
      </View>
    </View>
  );
};

export default MessageHeader;

const styles = StyleSheet.create({
  header: {
    height: '12%',
    backgroundColor: '#0B0C63',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 15,
    paddingTop: 20,
  },

  buttons: {
    flexDirection: 'row',
    gap: 5,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: '#08B6D9',
    fontSize: 15,
    fontWeight: 'bold',
  },
  number: {
    color: '#08B6D9',
    fontSize: 14,
    fontWeight: 'semibold',
  },
});
