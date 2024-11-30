import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import MI from 'react-native-vector-icons/MaterialIcons';

// components
import Container from '@/components/Container';
import Carousel from '@/components/Carousel';

const ResponderAlert = () => {
  const images = [
    require('@/assets/images/fire1.jpg'),
    require('@/assets/images/fire2.jpg'),
    require('@/assets/images/fire3.jpg'),
    require('@/assets/images/fire4.jpg'),
  ];

  return (
    <Container>
      <View style={styles.container}>
        <Text style={styles.title}>Emergency Report</Text>
        <View style={styles.basicInfo}>
          <View style={styles.basic}>
            <MCI name="calendar-month" size={30} color={'#0B0C63'} />
            <Text style={styles.basicText}>April 7, 2024 5:53 pm</Text>
          </View>
          <View style={styles.basic}>
            <MCI name="fire" size={30} color={'#0B0C63'} />
            <Text style={styles.basicText}>Fires & Explosions</Text>
          </View>
          <View style={styles.basic}>
            <MI name="location-pin" size={30} color={'#0B0C63'} />
            <Text style={styles.basicText}>Brgy Concepcion, San Pablo City</Text>
          </View>
        </View>
        <View style={[styles.basic, styles.details]}>
          <Text style={styles.detailsTitle}>Emergency Details</Text>
          <Text style={styles.detailsBody}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna vel sapien aliquam
            posuere.
          </Text>
        </View>
        <View style={styles.mapContainer}>
          <Image source={require('@/assets/images/pinned.png')} style={styles.pinned} />
        </View>
        <Carousel images={images} />
      </View>
    </Container>
  );
};

export default ResponderAlert;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
    marginHorizontal: 'auto',
    backgroundColor: '#08B6D9',
    paddingHorizontal: '3%',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#0B0C63',
    margin: 10,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  basic: {
    flexDirection: 'row',
    width: '47%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6F0F6',
    padding: 5,
    borderRadius: 10,
  },
  basicText: {
    color: '#0B0C63',
    fontSize: 13,
    flex: 1,
  },
  details: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'column',
  },
  detailsTitle: {
    color: '#0B0C63',
    fontWeight: 'bold',
  },
  detailsBody: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    color: '#0B0C63',
  },
  mapContainer: {
    maxHeight: '20%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#D6F0F6',
    borderRadius: 10,
  },
  pinned: {
    resizeMode: 'stretch',
    height: '100%',
    width: '100%',
  },
});
