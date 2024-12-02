import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import FS from 'react-native-vector-icons/FontAwesome';
import MI from 'react-native-vector-icons/MaterialIcons';

interface Props {
  id: string | number;
  name: string;
  roomId: string | number;
  email: string;
  event: (id: string | number) => void;
  selectedId: string | number;
}

const ContactCard = ({ id, name, roomId, email, event, selectedId }: Props) => {
  const router = useRouter();

  return (
    <View
      style={[
        styles.contact,
        {
          paddingVertical: selectedId == id ? 0 : 10,
        },
      ]}
    >
      {/* <Pressable
				style={[
					styles.call,
					{
						display: id != selectedId ? "none" : "flex",
					},
				]}
			>
				<MI name="phone" color={"#D6F0F6"} size={40} />
			</Pressable> */}

      <Pressable style={styles.contactInfo} onPress={() => event(id)}>
        {/* <Image
					source={source}
					style={{
						resizeMode: "stretch",
						width: 40,
						height: 40,
					}}
				/> */}
        <FS name="user-circle" size={40} color="#D6F0F6" style={{ marginLeft: '10%' }} />
        <View>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <View style={styles.buttons}>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/user/messages', params: { selectedId: id, roomId: roomId } })
            }
          >
            <MI name="message" color={'#0B0C63'} size={25} />
          </Pressable>
          <Pressable>
            <MI name="videocam" color={'#0B0C63'} size={25} />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#D6F0F6',
    width: '90%',
    marginHorizontal: 'auto',
    borderRadius: 20,
    marginVertical: 10,
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
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B0C63',
  },
  email: {
    fontSize: 10,
    fontWeight: '400',
    color: '#0B0C63',
  },
  contactNumber: {
    fontSize: 14,
    color: '#0B0C63',
  },

  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
