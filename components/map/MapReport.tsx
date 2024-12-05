import { mapStyle } from '@/constants/Map';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface LocationProp {
  coords: {
    longitude: any;
    latitude: any;
  };
}

interface MapReportProps {
  location: LocationProp;
  handleLocation: (location: LocationProp) => void;
}

const MapReport: React.FC<MapReportProps> = ({ location, handleLocation }) => {
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * (Dimensions.get('window').width / Dimensions.get('window').height);

  return (
    <View style={styles.map}>
      <MapView
        style={styles.mapView}
        mapType="standard"
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onPress={(e: MapPressEvent) => handleLocation({ coords: e.nativeEvent.coordinate })}
      >
        <Marker
          draggable
          onDragEnd={(e) => handleLocation({ coords: e.nativeEvent.coordinate })}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
        />
      </MapView>
    </View>
  );
};

export default MapReport;

const styles = StyleSheet.create({
  map: {
    height: 250,
    width: '86%',
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 'auto',
    marginTop: 10,
    zIndex: -1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapView: {
    flex: 1,
  },
});
