import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import MapContent from '@/components/map/MapContent';

interface LocationProp {
  coords: {
    longitude: any;
    latitude: any;
  };
}
const establishments = [
  {
    id: 1,
    name: 'Philippine General Hospital',
    category: 'Hospital',
    type: 'Medical',

    coordinates: { latitude: 14.5794, longitude: 120.986 },
  },
  {
    id: 2,
    name: "St. Luke's Medical Center - Quezon City",
    category: 'Hospital',
    type: 'Medical',

    coordinates: { latitude: 14.6399, longitude: 121.0339 },
  },
  {
    id: 3,
    name: 'Makati Medical Center',
    category: 'Hospital',
    type: 'Medical',

    coordinates: { latitude: 14.5547, longitude: 121.0195 },
  },
  {
    id: 4,
    name: 'The Medical City - Ortigas',
    category: 'Hospital',
    type: 'Medical',

    coordinates: { latitude: 14.591, longitude: 121.0645 },
  },
  {
    id: 5,
    name: 'Southern Philippines Medical Center',
    category: 'Hospital',
    type: 'Medical',

    coordinates: { latitude: 7.0943, longitude: 125.6132 },
  },

  // Disaster Relief Centers
  {
    id: 6,
    name: 'Philippine Red Cross Headquarters',
    category: 'Disaster Relief Center',
    type: 'Disaster',

    coordinates: { latitude: 14.5965, longitude: 120.9884 },
  },
  {
    id: 7,
    name: 'National Disaster Risk Reduction and Management Council (NDRRMC)',
    category: 'Disaster Relief Center',
    type: 'Disaster',

    coordinates: { latitude: 14.6453, longitude: 121.048 },
  },
  {
    id: 8,
    name: 'UNICEF Philippines Office',
    category: 'Disaster Relief Center',
    type: 'Disaster',

    coordinates: { latitude: 14.5741, longitude: 121.0483 },
  },
  {
    id: 9,
    name: 'World Vision Philippines',
    category: 'Disaster Relief Center',
    type: 'Disaster',

    coordinates: { latitude: 14.5748, longitude: 121.0477 },
  },
  {
    id: 10,
    name: 'Save the Children Philippines',
    category: 'Disaster Relief Center',
    type: 'Disaster',

    coordinates: { latitude: 14.5512, longitude: 121.0537 },
  },
];
const Map = () => {
  const LATITUDE_DELTA = 0.0922;
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
            {/* Establishment Markers */}
            {establishments.map((establishment) => (
              <Marker
                key={establishment.id}
                coordinate={establishment.coordinates}
                title={establishment.name}
                description={establishment.type}
                pinColor={establishment.type === 'Medical' ? 'green' : 'red'}
              >
                {/* Custom View for Marker */}
                <View
                  style={[
                    styles.customMarker,
                    establishment.type === 'Medical' ? styles.medicalMarker : styles.disasterMarker,
                  ]}
                >
                  <Text style={styles.markerText}>{establishment.name}</Text>
                </View>
              </Marker>
            ))}
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
  customMarker: {
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalMarker: {
    backgroundColor: 'green',
  },
  disasterMarker: {
    backgroundColor: 'red',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
});
