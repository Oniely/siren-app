import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView } from 'react-native';

import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import { useRouter } from 'expo-router';
import NewsAlertCard from '@/components/NewsAlertCard';
import Container from '@/components/Container';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';

MCI.loadFont();

const AdminDashboard = () => {
  const router = useRouter();
  const nearbyAccidents = [
    {
      id: '1',
      title: 'Truck and Jeep Accident',
      dateString: '24 Feb 2024',
      timeAgo: '2m ago',
      viewsString: '560',
      detailsString:
        'On November 20, 2024, severe flooding struck the Northern Province after three days of torrential rain. Rivers overflowed, submerging villages and cutting off roads, leaving over 50,000 residents stranded. Emergency services reported 15 fatalities and over 200 injuries.',
    },
    {
      id: '2',
      title: 'Fire Alert',
      dateString: '24 Feb 2024',
      timeAgo: '25m ago',
      viewsString: '568',
      detailsString:
        'On November 20, 2024, severe flooding struck the Northern Province after three days of torrential rain. Rivers overflowed, submerging villages and cutting off roads, leaving over 50,000 residents stranded. Emergency services reported 15 fatalities and over 200 injuries.',
    },
  ];

  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          <Text style={styles.indexText}>Hi, Elizabeth</Text>
          <Text style={styles.indexDesc}>Welcome to Siren Admin</Text>
        </View>
        <View style={styles.bigCircleContainer}>
          <TouchableOpacity onPress={() => router.push('/admin/emergency_report')}>
            <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/admin/emergency_report')}>
            <Image source={require('@/assets/images/reports.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/admin/manage_accounts')}>
            <Image source={require('@/assets/images/people.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Manage Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/admin/analytics')}>
            <Image source={require('@/assets/images/analytics.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.newsAlertWrapper}>
          <Text style={styles.newsAlertTitle}>News Alert</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.newsAlertContainer}>
              <View style={styles.nearbyAccidents}>
                <FlatList
                  data={nearbyAccidents}
                  renderItem={({ item }) => (
                    <NewsAlertCard
                      title={item.title}
                      dateString={item.dateString}
                      timeAgo={item.timeAgo}
                      viewString={item.viewsString}
                      detailsString={item.detailsString}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </AdminStyledContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '100%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    paddingLeft: 5,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  indexText: {
    fontSize: 40,
    textAlign: 'left',
    color: '#000',
    fontFamily: 'BeVietnamProBold',
  },
  indexDesc: {
    fontSize: 24,
    textAlign: 'center',
    color: '#343434',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: 500,
    aspectRatio: 2,
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
    top: '40%',
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginTop: 20,
    flex: 1,
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    textAlign: 'center',
  },
  buttonAdmin: {
    resizeMode: 'center',
    width: 100,
    height: 100,
    paddingHorizontal: 10,
    backgroundColor: '#087bb8',
    borderRadius: 20,
  },
  buttonText: {
    paddingHorizontal: 10,
    fontSize: 14,
    width: 100,
    textAlign: 'center',
    flexWrap: 'wrap',
    flex: 1,
    fontFamily: 'BeVietnamProMedium',
    color: '#016ea6',
  },
  newsAlertWrapper: {
    flex: 1,
    width: '100%',
    paddingVertical: 10,
  },
  newsAlertTitle: {
    fontSize: 30,
    marginLeft: 30,
    color: '#aaacb0',
    fontFamily: 'BeVietnamProSemiBold',
  },
  newsAlertContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: '5%',
  },
  textInfo: {
    fontSize: 40,
    color: '#0c0c63',
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 3,
  },
  nearbyAccidents: {
    flex: 1,
    marginTop: 10,
  },
});

export default AdminDashboard;
