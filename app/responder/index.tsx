import React from 'react';
import { Image, Text, TouchableOpacity, View, FlatList } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import NewsAlertCard from '@/components/NewsAlertCard';
import ResponderStyledContainer from '@/components/responder/responderStyledContainer';
import ResponderHeader from '@/components/responder/responderHeader';
import { ScaledSheet } from 'react-native-size-matters';

MCI.loadFont();

const ResponderDashboard = () => {
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
    <ResponderStyledContainer>
      <ResponderHeader />
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          <Text style={styles.indexText}>Hi, Elizabeth</Text>
          <Text style={styles.indexDesc}>Welcome to Siren Responder</Text>
        </View>
        <View style={styles.bigCircleContainer}>
          <TouchableOpacity onPress={() => router.push('/responder/responderAlert')}>
            <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/responder')}>
            <Image source={require('@/assets/images/call-logo-admin.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/responder/responderMap')}>
            <Image source={require('@/assets/images/view-logo.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/responder')}>
            <Image source={require('@/assets/images/message-logo.png')} style={styles.buttonAdmin} />
            <Text style={styles.buttonText}>Emergency Text</Text>
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
    </ResponderStyledContainer>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    paddingLeft: '5@s',
    alignSelf: 'flex-start',
    marginLeft: '20@s',
  },
  indexText: {
    fontSize: '36@ms',
    textAlign: 'left',
    color: '#000',
    fontFamily: 'BeVietnamProBold',
  },
  indexDesc: {
    fontSize: '16@ms',
    textAlign: 'center',
    color: '#343434',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: '500@s',
    aspectRatio: 2,
    marginVertical: '20@vs',
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  buttonWrapper: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    textAlign: 'center',
  },
  buttonAdmin: {
    resizeMode: 'center',
    width: '100@s',
    height: '100@s',
    paddingHorizontal: '10@s',
    // backgroundColor: '#087bb8',
    borderRadius: '20@s',
  },
  buttonText: {
    paddingHorizontal: '10@s',
    fontSize: '14@s',
    width: '100@s',
    textAlign: 'center',
    flexWrap: 'wrap',
    flex: 1,
    fontFamily: 'BeVietnamProMedium',
    color: '#016ea6',
  },
  newsAlertWrapper: {
    flex: 1,
    width: '100%',
    marginVertical: '10@s',
  },
  newsAlertTitle: {
    fontSize: '30@s',
    marginLeft: '30@s',
    color: '#aaacb0',
    fontFamily: 'BeVietnamProSemiBold',
  },
  newsAlertContainer: {
    flex: 1,
    marginTop: '10@s',
    paddingHorizontal: '5%',
  },
  textInfo: {
    fontSize: '40@s',
    color: '#0c0c63',
    fontWeight: 'bold',
    marginBottom: '10@s',
    padding: '3@s',
  },
  nearbyAccidents: {
    flex: 1,
    marginTop: '10@s',
  },
});

export default ResponderDashboard;
