import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface MapReportProps {
  location: { latitude: number; longitude: number };
  handleLocation: (location: { latitude: number; longitude: number }) => void;
}

const MapReport: React.FC<MapReportProps> = ({ location, handleLocation }) => {
  return (
    <View style={styles.map}>
      <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e: MapPressEvent) =>
          handleLocation(e.nativeEvent.coordinate)
        } // Allows user to set a location by tapping the map
      >
        <Marker
          draggable
          onDragEnd={(e) => handleLocation(e.nativeEvent.coordinate)} // Updates location on drag
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        />
      </MapView>
    </View>
  );
};

export default MapReport;

const styles = StyleSheet.create({
  map: {
    height: 200,
    width: '86%',
    borderWidth: 1,
    borderColor: '#000',
    marginHorizontal: 'auto',
    marginTop: 10,
    zIndex: -1,
    borderRadius: 10,
    overflow: 'hidden', // Ensures the map respects the border radius
  },
  mapView: {
    flex: 1,
  },
});
