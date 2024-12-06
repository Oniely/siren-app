import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import MI from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import Container from '@/components/Container';
import AlertCard from '@/components/AlertCard';
import HeaderText from '@/components/app/HeaderText';

const ViewAlert = () => {
  const router = useRouter();

  const nearbyAccidents = [
    {
      id: '1',
      title: 'Truck and Jeep Accident',
      dateString: '24 Feb 2024',
      timeAgo: '2m ago',
      viewsString: '560',
      address: 'Brgy. Singko Lipa, Batangas',
      imageSource: require('@/assets/images/truck_accident.jpg'),
      distanceFromUser: '10m away',
    },
    {
      id: '2',
      title: 'Fire Alert',
      dateString: '24 Feb 2024',
      timeAgo: '25m ago',
      viewsString: '568',
      address: 'Brgy. San Juan, Batangas',
      imageSource: require('@/assets/images/fire_accident.jpg'),
      distanceFromUser: '55m away',
    },
    {
      id: '3',
      title: 'Fire Alert',
      dateString: '24 Feb 2024',
      timeAgo: '25m ago',
      viewsString: '568',
      address: 'Brgy. San Juan, Batangas',
      imageSource: require('@/assets/images/fire_accident.jpg'),
      distanceFromUser: '55m away',
    },
    {
      id: '4',
      title: 'Fire Alert',
      dateString: '24 Feb 2024',
      timeAgo: '25m ago',
      viewsString: '568',
      address: 'Brgy. San Juan, Batangas',
      imageSource: require('@/assets/images/fire_accident.jpg'),
      distanceFromUser: '55m away',
    },
    {
      id: '5',
      title: 'Fire Alert',
      dateString: '24 Feb 2024',
      timeAgo: '25m ago',
      viewsString: '568',
      address: 'Brgy. San Juan, Batangas',
      imageSource: require('@/assets/images/fire_accident.jpg'),
      distanceFromUser: '55m away',
    },
  ];

  return (
    <Container bg="#e6e6e6">
      <HeaderText text="View Alerts" />

      <View style={styles.container}>
        <Text style={styles.textInfo}>RIGHT NOW</Text>
        <AlertCard
          title={'Flood Alert'}
          dateString={'24 Feb 2024'}
          timeAgo={'1s ago'}
          viewString={'1.1k'}
          address={'Brgy. Taytay Nagcarlan, Laguna '}
          imageSource={require('@/assets/images/car_accident.jpg')}
          distanceFromUser={'43km away'}
        />

        <View style={styles.nearbyAccidents}>
          <Text style={styles.textInfo}>NEARBY ACCIDENTS</Text>
          <FlatList
            data={nearbyAccidents}
            renderItem={({ item }) => (
              <AlertCard
                title={item.title}
                dateString={item.dateString}
                timeAgo={item.timeAgo}
                viewString={item.viewsString}
                address={item.address}
                imageSource={item.imageSource}
                distanceFromUser={item.distanceFromUser}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </Container>
  );
};

export default ViewAlert;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: '5%',
  },
  textInfo: {
    fontSize: 36,
    color: '#0c0c63',
    fontFamily: 'BeVietnamProBold',
    marginBottom: 10,
    padding: 3,
  },
  nearbyAccidents: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
  },
});
