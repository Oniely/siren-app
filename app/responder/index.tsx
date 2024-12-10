import React, { useRef } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, Dimensions, Animated } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { Link, useRouter } from 'expo-router';
import NewsAlertCard from '@/components/NewsAlertCard';
import ResponderStyledContainer from '@/components/responder/responderStyledContainer';
import ResponderHeader from '@/components/responder/responderHeader';
import { scale, ScaledSheet } from 'react-native-size-matters';
import { getAuth } from 'firebase/auth';

MCI.loadFont();

const itemWidth = Dimensions.get('screen').width * 0.9;

const ResponderDashboard = () => {
  const user = getAuth().currentUser;
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;

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

  // if (loading) return <Loading />;

  return (
    <ResponderStyledContainer>
      <ResponderHeader user={user!} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.textWrapper}>
            <Text style={styles.indexText}>Hi, {user?.displayName || 'Elizabeth'}</Text>
            <Text style={styles.indexDesc}>Welcome to Siren Responder</Text>
          </View>
          <View style={styles.bigCircleContainer}>
            <TouchableOpacity onPress={() => router.push('/responder/responderAlert')}>
              <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity onPress={() => router.push('/responder/contacts')}>
              <Image source={require('@/assets/images/call-logo-admin.png')} style={styles.buttonAdmin} />
              <Text style={styles.buttonText}>Emergency Call</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/responder/responderMap')}>
              <Image source={require('@/assets/images/view-logo.png')} style={styles.buttonAdmin} />
              <Text style={styles.buttonText}>View Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/responder/messages')}>
              <Image source={require('@/assets/images/message-logo.png')} style={styles.buttonAdmin} />
              <Text style={styles.buttonText}>Emergency Text</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.newsAlertWrapper}>
            <View style={styles.titleWrapper}>
              <Text style={styles.newsAlertTitle}>News Alert</Text>
              <Link href={'/news'}>
                <Text style={styles.viewAll}>View All</Text>
              </Link>
            </View>
            <View style={styles.newsAlertContainer}>
              <Animated.FlatList
                horizontal
                snapToAlignment="center"
                snapToInterval={itemWidth}
                data={nearbyAccidents}
                contentContainerStyle={{ paddingHorizontal: scale(20) }}
                getItemLayout={(data, index) => ({
                  length: itemWidth,
                  offset: itemWidth * index,
                  index,
                })}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                  useNativeDriver: true,
                })}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => {
                  const inputRange = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1, 0.9],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View style={{ transform: [{ scale }] }}>
                      <NewsAlertCard
                        title={item.title}
                        dateString={item.dateString}
                        timeAgo={item.timeAgo}
                        viewString={item.viewsString}
                        detailsString={item.detailsString}
                      />
                    </Animated.View>
                  );
                }}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingVertical: '30@vs',
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  newsAlertTitle: {
    fontSize: '24@ms',
    color: '#aaacb0',
    fontFamily: 'BeVietnamProSemiBold',
  },
  viewAll: {
    color: '#a4a2a0',
    fontSize: '14@ms',
    fontFamily: 'BeVietnamProRegular',
    textDecorationLine: 'underline',
  },
  newsAlertContainer: {
    marginTop: '10@s',
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
