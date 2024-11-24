import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';

import FS from 'react-native-vector-icons/FontAwesome';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import { useRouter } from 'expo-router';
import AlertCard from '@/components/AlertCard';
import NewsAlertCard from '@/components/NewsAlertCard';
import Container from '@/components/Container';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';

MCI.loadFont();

const Dashboard = () => {
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
        <View style={styles.wrapper}>
          {/* <TouchableOpacity style={styles.box} onPress={() => router.push('/')}>
            <Text style={styles.boxText}>Report Emergency</Text>
            <MCI size={50} name="alert-circle" color={'#D7F1F7'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => router.push('/')}>
            <Text style={styles.boxText}>View{'\n'}Alerts</Text>
            <MCI size={50} name="monitor-eye" color={'#D7F1F7'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.box,
              {
                justifyContent: 'flex-end',
              },
            ]}
          >
            <MCI size={50} name="phone-ring" color={'#D7F1F7'} />
            <Text style={styles.boxText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.box,
              {
                justifyContent: 'flex-end',
              },
            ]}
            onPress={() => router.push('/')}
          >
            <FS size={50} name="telegram" color={'#D7F1F7'} />
            <Text style={styles.boxText}>Emergency Text</Text>
          </TouchableOpacity> */}
          <View style={styles.textWrapper}>
            <Text style={styles.indexText}>Hi, Elizabeth</Text>
            <Text style={styles.indexDesc}>Welcome to Siren</Text>
          </View>

          <View style={styles.bigCircleContainer}>
            <TouchableOpacity onPress={() => router.push('/report_emergency')}>
              <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image source={require('@/assets/images/call-logo-admin.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image source={require('@/assets/images/view-logo.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image source={require('@/assets/images/message-logo.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Emergency Text</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.newsAlertWrapper}>
          <Text style={styles.newsAlertTitle}>News Alert</Text>
          <Container bg="#e6e6e6" style={{ paddingTop: 25 }}>
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
          </Container>
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
    overflow: 'scroll',
  },
  wrapper: {
    width: '90%',
    height: '50%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '48%',
    height: '50%',
    maxWidth: 400,
    borderRadius: 50,
    backgroundColor: '#087BB8',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  boxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
  },
  textWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    paddingLeft: 5,
  },
  indexText: {
    fontSize: 50,
    textAlign: 'center',
    color: '#343434',
    fontWeight: 'bold',
  },
  indexDesc: {
    fontSize: 30,
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
  },
  buttonText: {
    paddingHorizontal: 10,
    fontSize: 16,
    width: 100,
    textAlign: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  newsAlertWrapper: {
    flex: 1,
    width: '100%',
  },
  newsAlertTitle: {
    fontSize: 30,
    marginLeft: 30,
    color: '#414753',
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

export default Dashboard;
