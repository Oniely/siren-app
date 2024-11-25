import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'expo-router';

export default function ReportDetail() {
  // use router to go to view report: router.push()
  const router = useRouter();

  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.header}>
        <Text style={styles.headerText}>Emergency Reports</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.reportsContainer}>
          <View style={styles.reportDesc}>
            <Text style={styles.descName}>Lorem Ipsum</Text>
            <Text style={styles.descMessage}>Lorem ipsum dolor sit amet, consec...</Text>
            <Text style={styles.descTime}>12:01AM</Text>
          </View>
          <Image source={require('@/assets/images/profile.png')} style={styles.reportImage} />
        </View>
        <View style={styles.information}>
          <Text style={styles.infoText}>Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Date:</Text>
              <Text style={styles.infoDesc}>December 08, 2024</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Category:</Text>
              <Text style={styles.infoDesc}>Fire and Explosion</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Location:</Text>
              <Text style={styles.infoDesc}>Brgy Concepcion, San Pablo City</Text>
            </View>
            <View style={styles.mapContainer}>
                <Text>Map here</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Emergency Details</Text>
              <Text style={styles.infoDesc}>
                Hello this is a description please add the emergency details here
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Images</Text>
              <View style={styles.imageContainer}>
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminStyledContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'scroll',
    backgroundColor: '#faf9f6',
    paddingBottom: 50,
    borderTopWidth: 2,
    borderTopColor: '#dfdedd',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#e6e6e6',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'BeVietnamProBold',
  },
  reportsContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingRight: 60,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#dfdedd',
  },
  reportImage: {
    resizeMode: 'cover',
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#343434',
  },
  reportDesc: {
    flex: 1,
  },
  descTime: {
    fontSize: 18,
    fontFamily: 'BeVietnamProRegular',
  },
  descName: {
    fontSize: 36,
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  descMessage: {
    fontSize: 20,
    fontFamily: 'BeVietnamProBold',
    width: '95%',
    color: '#b0adad',
  },
  information: {
    flex: 1,
    padding: 20,
  },
  infoText: {
    fontSize: 36,
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  infoContainer: {
    flex: 1,
    gap: 5,
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  info: {
    flexDirection: 'row',
    gap: 5,
  },
  infoColumn: {
    width: "100%"
  },
  infoHeaderText: {
    fontSize: 22,
    fontFamily: 'BeVietnamProBold',
    color: '#b0adad',
  },
  infoDesc: {
    fontSize: 22,
    fontFamily: 'BeVietnamProBold',
    color: '#000',
  },
  pad: {
    paddingTop: 25,
  },
  imageContainer: {
    width: "100%",
    flexDirection: 'row',
    paddingVertical: 30,
    gap: 5,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 220
  },
  image: {
    resizeMode: "cover",
    width: 110,
    height: 110,
  },
  mapContainer: {
    width: '100%',
    height: "30%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10
  }
});
