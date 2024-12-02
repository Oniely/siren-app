import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import MapContent from '@/components/map/MapContent';
// import Geolocation from '@react-native-community/geolocation';

interface LocationProp {
  coords: {
    longitude: any;
    latitude: any;
  };
}

const Map = () => {
  const LATITUDE_DELTA = 0.0922; // Example latitude delta
  const LONGITUDE_DELTA = LATITUDE_DELTA * (Dimensions.get('window').width / Dimensions.get('window').height);

  const [location, setLocation] = useState<LocationProp | null>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  let text = 'Waiting..';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <MapView
            style={[StyleSheet.absoluteFillObject, styles.map]}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
            />
          </MapView>
          <MapContent />
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{text}</Text>
        </View>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  map: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
