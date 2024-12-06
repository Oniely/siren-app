import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '@/firebaseConfig';
import { ref, onValue, update, onDisconnect } from 'firebase/database'; // Correctly import update function
import * as Location from 'expo-location';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ResponderMap = () => {
  const [responderLocation, setResponderLocation] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [responderId, setResponderId] = useState<string | null>(null);
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);

        // Fetch responder data from the users collection
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role === 'responder') {
            setResponderId(user.uid); // Save the UID for future updates
          } else {
            console.error('Logged-in user is not a responder.');
          }
        });
      } else {
        console.error('No user is logged in.');
      }
    });

    return () => unsubscribe();
  }, []);
  const confirmStatus = () => {
    if (selectedReport && selectedReport.location && responderLocation && responderId) {
      const reportRef = ref(db, `reports/${selectedReport.reportId}`);

      update(reportRef, { status: 'Accepted' })
        .then(() => {
          console.log('Report accepted');

          updateResponderLocation(responderId, responderLocation);
          setSelectedReport(null); // Reset selected report
        })
        .catch((error: Error) => {
          console.error('Error updating status:', error.message);
        });
    } else {
      console.error('Selected report or location/responder ID is undefined');
    }
  };
  // Function to handle Decline button press
  const declineStatus = () => {
    if (selectedReport && selectedReport.location) {
      const reportRef = ref(db, `reports/${selectedReport.reportId}`);
      update(reportRef, {
        status: 'Declined', // Update status to 'declined'
      })
        .then(() => {
          console.log('Report declined');
          setSelectedReport(null); // Reset selected report after declining
        })
        .catch((error: Error) => {
          // Explicitly type the error
          console.error('Error updating status:', error.message);
        });
    }
  };
  type LocationCoords = {
    latitude: number;
    longitude: number;
  };
  async function updateResponderLocation(responderId: string, location: LocationCoords) {
    try {
      const responderRef = ref(db, `responders/${responderId}`);
      await update(responderRef, {
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'Active',
      });

      // Handle disconnection to mark responder as inactive
      onDisconnect(responderRef).update({ status: 'Inactive' });
      console.log('Responder location and status updated successfully');
    } catch (error) {
      console.error('Error updating responder location:');
    }
  }

  useEffect(() => {
    const startResponderLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location denied');
        return;
      }

      const responderId = auth.currentUser?.uid;
      if (!responderId) {
        console.error('Responder ID is undefined. User might not be logged in.');
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
          const locationCoords = { latitude, longitude };
          setResponderLocation(locationCoords);

          updateResponderLocation(responderId, locationCoords); // Guaranteed to have a valid responderId here
        }
      );

      return () => locationSubscription?.remove();
    };

    startResponderLocationTracking();

    // Fetch all reports
    const fetchReportsWithSenderNames = async () => {
      const reportsRef = ref(db, 'reports');
      const usersRef = ref(db, 'users');

      onValue(reportsRef, (snapshot) => {
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportPromises = Object.values(reportsData).map(async (report: any) => {
            return new Promise((resolve) => {
              onValue(ref(db, `users/${report.senderId}`), (userSnapshot) => {
                const userData = userSnapshot.exists() ? userSnapshot.val() : { name: 'Unknown' };
                resolve({
                  ...report,
                  senderName: userData.firstname + ' ' + userData.lastname,
                });
              });
            });
          });
          Promise.all(reportPromises).then((fetchedReports) => {
            setReports(fetchedReports);
          });
        }
      });
    };

    fetchReportsWithSenderNames();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: responderLocation?.latitude || 12.8797,
          longitude: responderLocation?.longitude || 121.774,
          latitudeDelta: 0.1,
          longitudeDelta: 0.00001,
        }}
      >
        {/* Responder Marker */}
        {responderLocation && (
          <Marker
            coordinate={{
              latitude: responderLocation.latitude,
              longitude: responderLocation.longitude,
            }}
            title="Responder"
            pinColor="blue"
          />
        )}
        {/* Markers for All Reports with Categories */}
        {reports.map(
          (report, idx) =>
            report.location &&
            typeof report.location.latitude === 'number' &&
            typeof report.location.longitude === 'number' && (
              <Marker
                key={idx}
                coordinate={report.location}
                title={`Report ${report.id}`}
                description={`Category: ${report.category}, Lat: ${report.location.latitude}, Lng: ${report.location.longitude}`}
                pinColor="red"
                onPress={() => setSelectedReport(report)}
              />
            )
        )}
      </MapView>

      {/* Bottom Details Container */}
      {selectedReport && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedReport(null)}>
            <AntDesign name="close" size={35} color="black" />
          </TouchableOpacity>
          <View style={styles.upperContainer}>
            <View style={styles.upperImage}>
              <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
            </View>
            <View style={styles.upperText}>
              <Text style={styles.reportName}>{` ${selectedReport.reportId}`}</Text>
              <Text style={styles.reportName}>{` ${selectedReport.senderName}`}</Text>
              <Text style={styles.reportCategory}>{`Category: ${selectedReport.category}`}</Text>
              <Text style={styles.reportDescription}>{`Details: ${selectedReport.details}`}</Text>
            </View>
          </View>
          <View style={styles.centerContent}>
            <Entypo name="location-pin" size={60} color="#343434" />
            <Text style={styles.reportLocation}>
              {`Lat: ${selectedReport.location.latitude}, Lng: ${selectedReport.location.longitude}`}
            </Text>
          </View>
          <View style={styles.bottomContent}>
            <TouchableOpacity style={styles.declineButton} onPress={declineStatus}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={confirmStatus}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  bottomContainer: {
    justifyContent: 'center',
    textAlign: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: '10%',
    paddingVertical: '5%',
    borderBottomWidth: 1,
    borderColor: '#343434',
  },
  upperImage: {
    width: 100,
    height: 100,
    marginRight: '5%',
  },
  upperText: {
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  reportName: {
    fontSize: 24,
    color: '#000',
    marginBottom: 5,
  },
  reportCategory: {
    fontSize: 18,
    color: '#b0adad',
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 18,
    color: '#b0adad',
    flexWrap: 'wrap',
    flex: 1,
    width: '75%',
  },
  reportLocation: {
    fontSize: 18,
    color: '#087bb8',
    flexWrap: 'wrap',
    flex: 1,
  },
  acceptButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#0c0c63',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: '30%',
  },
  declineButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#f0f1f2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: '30%',
  },
  centerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: '15%',
    paddingVertical: '5%',
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  ButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  acceptButtonText: {
    color: '#f0f1f2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  declineButtonText: {
    color: '#0c0c63',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  police: {
    resizeMode: 'stretch',
    height: 100,
    width: 100,
    borderRadius: 20,
  },
});

export default ResponderMap;
