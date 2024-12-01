import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Pressable, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '@/firebaseConfig'; // Replace with your Firebase config file
import { ref, update } from 'firebase/database';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

interface CallerLocationProps {
  reportId: string; // Explicitly set reportId as a string
}

const WaitingResponder: React.FC<CallerLocationProps> = ({ reportId }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location denied');
        setLoading(false);
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when user moves 10 meters
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;

          // Update state
          setLocation({ latitude, longitude });

          // Update Firebase
          const reportRef = ref(db, `reports/${reportId}`);
          update(reportRef, {
            location: { latitude, longitude },
          });
        }
      );

      setLoading(false);
    })();

    return () => {
      locationSubscription?.remove();
    };
  }, [reportId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text>Unable to fetch location. Please check permissions.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSide}>
          <Pressable>
            <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
          </Pressable>
          <View style={styles.leftText}>
            <Text style={styles.textNumber}>099938928131</Text>
            <Text style={styles.textName}>Elizabeth Olsen</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.mainText}>
        <Text style={styles.bigText}>Waiting for Responder</Text>
        <Text style={styles.smallText}>Your contact persons nearby, ambulance/police contacts will see your request for help. </Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01, // Adjust zoom level
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          description="This is your current location"
        />
      </MapView>
    </View>
  );
};

export default WaitingResponder;

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    height: 100,
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 11,
    backgroundColor: '#e6e6e6',
  },
  leftSide: {
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
  },
  closeButton: {
    top: 40,
    right: 20,
  },
  leftText: {
    flexDirection: 'column',
    top: 40,
    left: 30,
  },
  textName: {},
  textNumber: {},
  police: {
    top: 40,
    left: 20,
    resizeMode: 'stretch',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  mainText: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    height: '40%',
    display: 'flex',
    width: '100%',
    backgroundColor: '#e6e6e6',

  },
  bigText: {
    color: '#0b0c63',
    fontSize: 40,
    textAlign: 'center',
  },
  smallText: {
    textAlign: 'center',
    fontSize: 24,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
