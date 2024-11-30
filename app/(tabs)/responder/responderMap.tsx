import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '@/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const responderMap = ({ reportId }) => {
  const [callerLocation, setCallerLocation] = useState(null);
  const [responderLocation, setResponderLocation] = useState(null);

  useEffect(() => {
    // Watch responder's location
    const startResponderLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location denied');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setResponderLocation({ latitude, longitude });
        }
      );

      return () => locationSubscription?.remove();
    };

    startResponderLocationTracking();

    const reportRef = ref(db, `reports/${reportId}`);
    const unsubscribe = onValue(reportRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportData = snapshot.val();
        setCallerLocation(reportData.location);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: responderLocation?.latitude || 37.78825,
          longitude: responderLocation?.longitude || -122.4324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Responder Marker */}
        {responderLocation && (
          <Marker
            coordinate={responderLocation}
            title="Responder"
            pinColor="blue"
          />
        )}

        {/* Caller Marker */}
        {callerLocation && (
          <Marker
            coordinate={callerLocation}
            title="Caller"
            pinColor="red"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default responderMap;
