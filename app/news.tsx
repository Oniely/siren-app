import HeaderText from '@/components/app/HeaderText';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import { View, Text, FlatList, ImageBackground, Dimensions, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const newsData = [
  {
    newsOutlet: 'CNN-NEWS',
    newsDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image: 'https://picsum.photos/id/0/367/267',
  },
  {
    newsOutlet: 'BBC',
    newsDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image: 'https://picsum.photos/id/0/367/267',
  },
  {
    newsOutlet: 'ABS-CBN',
    newsDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image: 'https://picsum.photos/id/2/367/267',
  },
  {
    newsOutlet: 'GMA',
    newsDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image: 'https://picsum.photos/id/7/367/267',
  },
];

const itemWidth = Dimensions.get('screen').width * 0.9;

export default function News() {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderText text="News Alert" />
      <View style={styles.list}>
        <Animated.FlatList
          horizontal
          snapToAlignment={'start'}
          snapToInterval={itemWidth}
          data={newsData}
          initialScrollIndex={0}
          contentContainerStyle={styles.contentContainer}
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
                <ImageBackground source={{ uri: item.image }} style={styles.imageBackground}>
                  <View style={styles.textContainer}>
                    <Text style={styles.newsOutlet}>{item.newsOutlet}</Text>
                    <Text style={styles.newsDesc} numberOfLines={2}>
                      {item.newsDesc}
                    </Text>
                  </View>
                </ImageBackground>
              </Animated.View>
            );
          }}
          keyExtractor={(item) => item.newsOutlet}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      <View style={styles.recommendations}>
        <Text style={styles.headerText}>Recommendations</Text>
        <View style={styles.cardContainer}>
          <Link href={'/'} asChild>
            <View style={styles.recomCard}>
              <Image source={{ uri: newsData[0].image }} style={styles.recomImage} />
              <View style={styles.recomTexts}>
                <Text style={styles.recomTop}>Travel</Text>
                <Text style={styles.recomName}>Lorem Ipsum</Text>
                <Text style={styles.recomDesc} numberOfLines={1}>
                  Lorem ipsum dolor sit amet, consec...
                </Text>
              </View>
            </View>
          </Link>
        </View>
        <View style={styles.cardContainer}>
          <Link href={'/'} asChild>
            <View style={styles.recomCard}>
              <Image source={{ uri: newsData[0].image }} style={styles.recomImage} />
              <View style={styles.recomTexts}>
                <Text style={styles.recomTop}>Travel</Text>
                <Text style={styles.recomName}>Lorem Ipsum</Text>
                <Text style={styles.recomDesc} numberOfLines={1}>
                  Lorem ipsum dolor sit amet, consec...
                </Text>
              </View>
            </View>
          </Link>
          <Link href={'/'} asChild>
            <View style={styles.recomCard}>
              <Image source={{ uri: newsData[0].image }} style={styles.recomImage} />
              <View style={styles.recomTexts}>
                <Text style={styles.recomTop}>Travel</Text>
                <Text style={styles.recomName}>Lorem Ipsum</Text>
                <Text style={styles.recomDesc} numberOfLines={1}>
                  Lorem ipsum dolor sit amet, consec...
                </Text>
              </View>
            </View>
          </Link>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  list: {
    paddingTop: '20@vs',
  },
  contentContainer: {
    paddingHorizontal: '20@s',
  },
  imageBackground: {
    width: itemWidth,
    height: '200@vs',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: '10@s',
    backgroundColor: '#000',
    borderRadius: '10@ms',
    overflow: 'hidden',
  },
  textContainer: {
    padding: '10@s',
  },
  newsOutlet: {
    color: '#fff',
    fontFamily: 'BeVietnamProSemiBold',
  },
  newsDesc: {
    color: '#fff',
    fontFamily: 'BeVietnamProRegular',
  },
  separator: {
    width: 10,
  },
  recommendations: {
    padding: '20@s',
    flex: 1,
  },
  headerText: {
    fontSize: '18@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#231f20',
  },
  cardContainer: {
    paddingVertical: '10@vs',
    gap: '15@vs',
  },
  recomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: '10@s',
    padding: '5@s',
    paddingBottom: '10@vs',
    borderBottomWidth: 1,
    borderColor: '#ecebe8',
  },
  recomImage: {
    width: '80@s',
    height: '80@s',
    borderRadius: '10@ms',
  },
  recomTexts: {
    gap: '2@vs',
  },
  recomTop: {
    fontSize: '12@ms',
    fontFamily: 'BeVietnamProRegular',
    color: '#c9cacd',
  },
  recomName: {
    fontSize: '15@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#016ea6',
  },
  recomDesc: {
    fontSize: '12@ms',
    fontFamily: 'BeVietnamProMedium',
    color: '#b0adad',
  },
});
