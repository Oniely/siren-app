import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { db } from '@/firebaseConfig'; // Replace with your Firebase config file
import { ref, update } from 'firebase/database';

interface CallerLocationProps {
    reportId: string; // Explicitly set reportId as a string
  }
  
  const waitingResponder: React.FC<CallerLocationProps> = ({ reportId }) => {
    useEffect(() => {
    (async () => {
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

          const reportRef = ref(db, `reports/${reportId}`);
          update(reportRef, {
            location: { latitude, longitude },
          });
        }
      );

      return () => locationSubscription?.remove();
    })();
  }, []);

  return null;
};

export default waitingResponder;
