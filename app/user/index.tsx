import React, { useRef } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '@/components/Header';
import StyledContainer from '@/components/StyledContainer';
import { Link, useRouter } from 'expo-router';
import { scale, ScaledSheet } from 'react-native-size-matters';
import { getAuth } from 'firebase/auth';
import NewsAlertCard from '@/components/NewsAlertCard';
import Loading from '@/components/app/Loading';

MCI.loadFont();

const itemWidth = Dimensions.get('screen').width * 0.9;

const Dashboard = () => {
  const user = getAuth().currentUser;
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!user) return <Loading />;

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
    <StyledContainer>
      <Header user={user!} />
      <View style={styles.indexTopBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/profile.png')}
            style={styles.topBarImage}
          />
          <View>
            <Text style={styles.topBarName}>{user?.displayName || ''}</Text>
            <Link href={'/user/profile'}>
              <Text style={styles.topBarLink}>See profile</Text>
            </Link>
          </View>
        </View>
        <View>
          <View>
            <View style={styles.location}>
              <Text style={[styles.topBarName, { width: 85 }]} numberOfLines={1}>
                User's Location goes here
              </Text>
              <Image source={require('@/assets/images/location.png')} style={styles.locationIcon} />
            </View>
            <Link href={'/user/map'}>
              <Text style={styles.topBarLink}>Show your location</Text>
            </Link>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.wrapper}>
            <Text style={styles.indexText}>Emergency help needed?</Text>
            <View style={styles.bigCircleContainer}>
              <TouchableOpacity onPress={() => router.push('/user/emergency_call')}>
                <Image source={require('@/assets/images/index_logo.png')} style={styles.panicButton} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/user/report_emergency')}>
              <Text style={styles.button}>Report Emergency</Text>
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
    </StyledContainer>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: '28@ms',
    textAlign: 'center',
    color: '#343434',
    fontFamily: 'BeVietnamProBold',
    flexWrap: 'wrap',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: '500@s',
    aspectRatio: 1,
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  indexTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@s',
    paddingBottom: '10@vs',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5@s',
  },
  topBarImage: {
    width: '40@s',
    height: '40@s',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 999,
  },
  topBarName: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: '12@ms',
    color: '#999898',
  },
  topBarLink: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: '12@ms',
    color: '#3998ff',
  },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationIcon: {
    resizeMode: 'center',
    width: '10@s',
    height: '12@s',
  },
  button: {
    borderRadius: '10@s',
    backgroundColor: '#1c85e8',
    color: '#FFF',
    padding: '10@s',
    fontFamily: 'BeVietnamProMedium',
  },
  newsAlertWrapper: {
    flex: 1,
    paddingVertical: '40@vs',
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
  nearbyAccidents: {
    flex: 1,
    marginTop: '10@s',
  },
});

export default Dashboard;
