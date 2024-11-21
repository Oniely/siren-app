import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MI from 'react-native-vector-icons/MaterialIcons';
import SLI from 'react-native-vector-icons/SimpleLineIcons';

import Container from '@/components/Container';
import Footer from '@/components/Footer';
import MapReport from '@/components/map/MapReport';
import FilterButton from '@/components/FilterButton';
import DateTimeInput from '@/components/DateTimeInput';
import Video, { VideoRef } from 'react-native-video';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { push, ref, set } from 'firebase/database';
import { getDownloadURL, uploadBytes, ref as reference } from 'firebase/storage';
// import { db, storage } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

interface LocationProp {
  longitude: any;
  latitude: any;
}

// Custom hook for location
const useLocation = (setLocation: (location: LocationProp) => void) => {
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location: any = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, [setLocation]);
};

const ReportEmergency = () => {
  const router = useRouter();

  const category = [
    {
      name: 'Natural Disaster',
      img: require('@/assets/images/flood.png'),
    },
    {
      name: 'Fires and Explotions',
      img: require('@/assets/images/fire.png'),
    },
    {
      name: 'Road Accidents',
      img: require('@/assets/images/road.png'),
    },
  ];

  const [showCateg, setShowCateg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCateg, setSelectedCateg] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [location, setLocation] = useState<LocationProp | any>({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [status, setStatus] = useState('Standby');

  useLocation(setLocation);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: any) => {
    console.warn('A date has been picked: ', typeof date, date);
    setSelectedDate(date);
    hideDatePicker();
  };

  const takePicture = async () => {
    const result = await launchCamera({
      mediaType: 'mixed',
      saveToPhotos: true,
      durationLimit: 60,
      includeBase64: false,
      formatAsMp4: true,
    });

    console.log(result);

    if (result.assets && result.assets.length > 0) {
      setSelectedMedia(result.assets);
    }
  };

  // const uploadMediaToStorage = async (mediaFiles: any) => {
  //   setStatus('Uploading');
  //   const uploadedUrls = [];

  //   for (const file of mediaFiles) {
  //     const { uri, fileName, type } = file; // Get file details
  //     console.log(file);
  //     const response = await fetch(uri); // Convert to blob
  //     const blob = await response.blob();
  //     console.log(storage);
  //     const storageRef = reference(storage, `reports/${fileName}`); // Firebase Storage reference
  //     console.log('REF', storageRef);

  //     try {
  //       const snapshot = await uploadBytes(storageRef, blob); // Upload file
  //       console.log('File uploaded successfully:', snapshot);
  //       const downloadURL = await getDownloadURL(snapshot.ref);
  //       uploadedUrls.push({ file: file, url: downloadURL });
  //       console.log(downloadURL);
  //       setStatus('Uploaded');
  //     } catch (error) {
  //       setStatus('Upload error');
  //       console.error('Error uploading file:', error);
  //     }
  //   }

  //   setImageUrls(uploadedUrls); // Store uploaded file URLs
  // };

  // const pickImage = async () => {
  //   const result = await launchImageLibrary({
  //     mediaType: 'mixed',
  //     selectionLimit: 3,
  //     includeBase64: false,
  //   });

  //   if (result.assets && result.assets.length > 0) {
  //     setSelectedMedia(result.assets);
  //     uploadMediaToStorage(result.assets);
  //   }
  // };

  // const submit = async (date, latitude, longitude, details, assets, category) => {
  //   setStatus('Submitting');
  //   const userId = await AsyncStorage.getItem('userId');
  //   const reportRef = ref(db, 'reports/');
  //   const newReportRef = push(reportRef);

  //   set(newReportRef, {
  //     status: 'Reported',
  //     timestamp: new Date(date).getTime(),
  //     location: { latitude: latitude, longitude: longitude },
  //     details: details,
  //     assets: assets ?? [],
  //     category: category,
  //     createdAt: Date.now(),
  //     senderId: userId,
  //   })
  //     .then(() => {
  //       console.log('Data saved successfully with auto ID!');
  //       setStatus('Submitted');
  //     })
  //     .catch((error) => {
  //       setStatus('Submitted error');
  //       console.error('Error writing document: ', error);
  //     });
  // };

  return (
    <Container bg="#e6e6e6" style={{ paddingTop: 20 }}>
      <View style={styles.back}>
        <TouchableOpacity onPress={() => router.back()}>
          <MI name="arrow-back-ios" size={30} color={'#0B0C63'} />
        </TouchableOpacity>
        <Text style={styles.backText}>Report Emergency</Text>
      </View>
      {status === 'Submitted' ? (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: '#08B6D9', fontSize: 20, fontWeight: 'bold' }}>
            Successfully submitted report
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.reportContainer}>
          <View style={styles.filterRowContainer}>
            <TouchableOpacity style={styles.filter} onPress={showDatePicker}>
              <Text>{selectedDate ? selectedDate.toLocaleString() : 'Date Time'}</Text>
              <MI name="calendar-month" size={30} color={'#0c0c63'} />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <View style={[styles.filterCategory]}>
              <TouchableOpacity
                style={[
                  styles.filter,
                  {
                    width: '100%',
                  },
                ]}
                onPress={() => setShowCateg(!showCateg)}
              >
                <Text>{selectedCateg ? selectedCateg : 'Select Category'}</Text>
                <MI name={'arrow-downward'} size={30} color={'#0c0c63'} />
              </TouchableOpacity>
              {showCateg && (
                <View style={styles.categList}>
                  {category.map((categ, index) => (
                    <TouchableOpacity
                      style={styles.category}
                      key={index}
                      onPress={() => {
                        setSelectedCateg(categ.name);
                        setShowCateg(false);
                      }}
                    >
                      <Image source={categ.img} style={styles.categoryImages} />
                      <Text style={styles.categoryNames}>{categ.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.location}>
            <Text>Location</Text>
            <MI name={'my-location'} size={30} color={'#0B0C63'} />
          </View>
          <MapReport location={location} handleLocation={setLocation} />

          <View style={styles.emergencyDetails}>
            <Text style={styles.emergencyDetailsText}>Emergency Details</Text>
            <TextInput
              placeholder="Ex. someone fell from the building, what do they need"
              style={styles.detailsInput}
              multiline={true}
              numberOfLines={7}
              value={details}
              onChangeText={setDetails}
            />
          </View>
          <View style={styles.emergencyUpload}>
            <Text style={styles.emergencyUploadText}>Photos/Videos</Text>
            {imageUrls && imageUrls.length > 0 ? (
              <View style={styles.uploadDetails}>
                {imageUrls.map((media: any, index: number) => {
                  if (media.file.type.includes('video')) {
                    return (
                      <Video
                        key={index}
                        // Can be a URL or a local file.
                        source={{ uri: media.url }}
                        // Store reference
                        // ref={videoRef}
                        // Callback when remote video is buffering
                        // onBuffer={onBuffer}
                        // // Callback when video cannot be loaded
                        // onError={onError}
                        // style={styles.backgroundVideo}
                        style={{ width: 80, height: 80 }}
                      />
                    );
                  } else {
                    return (
                      <Image key={index} source={{ uri: media.url }} style={{ width: 80, height: 80 }} />
                    );
                  }
                })}
              </View>
            ) : (
              <View style={styles.iconUpload}>
                <TouchableOpacity onPress={() => console.log('PICK IMAGE FUNCTION HERE')}>
                  <SLI name="cloud-upload" size={40} color={'#0B0C63'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePicture}>
                  <SLI name="camera" size={40} color={'#0B0C63'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Pressable
            style={styles.button}
            disabled={status === 'Submitting' || status === 'Uploading'}
            // onPress={() =>
            //   submit(selectedDate, location.latitude, location.longitude, details, imageUrls, selectedCateg)
            // }
          >
            <Text style={styles.buttonText}>Submit Report</Text>
          </Pressable>
        </ScrollView>
      )}
    </Container>
  );
};

export default ReportEmergency;

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 20,
  },
  backText: {
    fontSize: 24,
    color: '#0c0c63',
    fontWeight: 'bold',
  },
  reportContainer: {
    flex: 1,
    marginBottom: 10,
  },
  filterRowContainer: {
    flexDirection: 'row',
    width: '86%',
    marginHorizontal: 'auto',
    paddingBottom: 10,
    marginTop: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filter: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
    position: 'relative',
  },
  filterCategory: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    justifyContent: 'space-between',
    borderRadius: 10,
    position: 'relative',
  },
  location: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    width: '86%',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
    position: 'relative',
    zIndex: -1,
    marginHorizontal: 'auto',
  },

  categList: {
    position: 'absolute',
    width: '100%',
    bottom: -150,
    right: 0,
    padding: 5,
    backgroundColor: '#0C0C63',
    maxHeight: 150,
    height: 150,
    zIndex: 100,
    borderRadius: 10,
    overflow: 'scroll',
    gap: 10,
  },
  category: {
    flexDirection: 'row',
    backgroundColor: '#0C0C63',
    paddingVertical: 10,
    gap: 10,
    paddingLeft: 5,
    borderRadius: 5,
  },
  categoryNames: {
    color: '#e6e6e6',
  },
  categoryImages: {
    backgroundColor: '#e6e6e6',
  },
  emergencyDetails: {
    width: '84%',
    marginHorizontal: 'auto',
    marginTop: 20,
    height: '20%',
  },
  emergencyDetailsText: {
    fontWeight: 'bold',
    color: '#0B0C63',
  },
  emergencyUpload: {
    width: '86%',
    marginHorizontal: 'auto',
    marginTop: 20,
    height: '20%',
  },
  emergencyUploadText: {
    fontWeight: 'bold',
    color: '#0B0C63',
  },
  uploadDetails: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginVertical: 5,

    backgroundColor: '#e6e6e6',
    marginTop: 10,
  },
  detailsInput: {
    borderWidth: 1,
    textAlignVertical: 'top',
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    marginTop: 10,
    padding: 20,
  },
  iconUpload: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    gap: 20,
  },
  button: {
    backgroundColor: '#0B0C63',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '86%',
    marginHorizontal: 'auto',
    marginVertical: 100,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
