import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import React from 'react';

import MI from 'react-native-vector-icons/MaterialIcons';

interface Props {
  title: string;
  dateString: string;
  timeAgo: string;
  viewString: string;
  imageSource: ImageSourcePropType;
  address: string;
  distanceFromUser: string;
}

const AlertCard = ({
  title,
  dateString,
  timeAgo,
  viewString,
  imageSource,
  address,
  distanceFromUser,
}: Props) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardMoreInfo}>
        <Text style={styles.accidentName}>{title}</Text>
        <Text style={styles.accidentDate}>{dateString}</Text>
        <Text style={styles.accidentDate}>{timeAgo}</Text>
        <View style={styles.accidentViews}>
          <MI name="group" size={15} color={'#0B0C63'} />
          <Text>{viewString}</Text>
        </View>
      </View>
      <View style={styles.accidentMainInfo}>
        <View style={styles.accidentImage}>
          <Image source={imageSource} style={styles.accidentProof} />
        </View>
        <View style={styles.accidentInfo}>
          <View style={styles.addressContainer}>
            <MI name="location-on" size={15} color={'#0B0C63'} />
            <Text style={styles.address}>{address}</Text>
          </View>
          <Text style={styles.address}>{distanceFromUser}</Text>
          <View style={styles.buttons}>
            <Pressable>
              <MI name="chat-bubble" size={30} color={'#0B0C63'} />
            </Pressable>
            <Pressable style={styles.button}>
              <Text style={styles.seeMore}>See More</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AlertCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    margin: 5,
    marginHorizontal: 0,
  },
  cardMoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  accidentName: {
    color: '#0B0C63',
    fontSize: 22,
    padding: 5,
    fontWeight: 'bold',
  },
  accidentDate: {
    color: '#0B0C63',
    fontSize: 14,
  },
  accidentViews: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  accidentMainInfo: {
    overflow: 'hidden',
    padding: 5,
    flexDirection: 'row',
    gap: 10,
  },
  accidentImage: {
    maxHeight: 100,
    flex: 1,
    overflow: 'hidden',
  },
  accidentProof: {
    resizeMode: 'stretch',
    width: '50%',
    aspectRatio: 1,
  },
  accidentInfo: {
    width: '50%',
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 16,
    color: '#0B0C63',
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 15,
  },
  button: {
    backgroundColor: '#0B0C63',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  seeMore: {
    color: '#ffffff',
    fontSize: 12,
  },
});
