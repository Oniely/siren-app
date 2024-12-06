import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import MapContent from '@/components/map/MapContent';
import { mapStyle } from '@/constants/Map';
import Loading from '@/components/app/Loading';
import { establishments } from '@/constants/Data';

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
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
        />
        {/* Establishment Markers */}
        {establishments.map((establishment) => {
          let markerIcon = require('@/assets/images/map/m-relief.png');

          if (establishment.category === 'Hospital') {
            markerIcon = require('@/assets/images/map/m-medical.png');
          } else if (establishment.category === 'Police Station') {
            markerIcon = require('@/assets/images/map/m-police.png');
          } else if (establishment.category === 'Fire Station') {
            markerIcon = require('@/assets/images/map/m-firefighter.png');
          }

          return (
            <Marker
              icon={markerIcon}
              key={establishment.id}
              coordinate={establishment.coordinates}
              title={establishment.name}
              description={establishment.type}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Callout tooltip={false}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text>{establishment.name}</Text>
                  <Text>{establishment.type}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
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
});
