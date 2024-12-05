import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import MapContent from '@/components/map/MapContent';
import { useRouter } from 'expo-router';
import Loading from '@/components/app/Loading';
import { mapStyle } from '@/constants/Map';
import { establishments } from '@/constants/Data';

interface LocationProp {
  coords: {
    longitude: any;
    latitude: any;
  };
}

const Map = () => {
  const router = useRouter();

  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * (Dimensions.get('window').width / Dimensions.get('window').height);

  const [location, setLocation] = useState<LocationProp | null>(null);
  const [errorMsg, setErrorMsg] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        router.back();
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
      setLocation(location);
    })();
  }, []);

  if (!location) return <Loading />;
  if (errorMsg) Alert.alert('Error', errorMsg);

  return (
    <View style={styles.container}>
      <MapView
        style={[StyleSheet.absoluteFillObject, styles.map]}
        mapType="standard"
        mapPadding={{ top: 0, right: 0, bottom: 90, left: 5 }}
        customMapStyle={mapStyle}
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
        showsMyLocationButton
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
            icon={require('@/assets/images/medical_marker.png')}
            key={establishment.id}
            coordinate={establishment.coordinates}
            title={establishment.name}
            description={establishment.type}
            pinColor={establishment.type === 'Medical' ? 'green' : 'red'}
          >
            {/* <View
              style={[
                styles.customMarker,
                establishment.type === 'Medical' ? styles.medicalMarker : styles.disasterMarker,
              ]}
            >
              <Text style={styles.markerText}>{establishment.name}</Text>
            </View> */}
          </Marker>
        ))}
      </MapView>
      <MapContent />
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
