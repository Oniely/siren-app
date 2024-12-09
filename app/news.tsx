import HeaderText from '@/components/app/HeaderText';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const newsData = [
  {
    source: 'CNN-NEWS',
    title: "Biden's approval rating hits new low",
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image_url: 'https://picsum.photos/id/0/367/267',
    url: 'https://picsum.photos/id/0/367/267',
    categories: ['general'],
  },
  {
    source: 'ABS-CBN',
    title: "Biden's approval rating hits new low2",
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image_url: 'https://picsum.photos/id/2/367/267',
    url: 'https://picsum.photos/id/2/367/267',
    categories: ['general'],
  },
  {
    source: 'GMA',
    title: "Biden's approval rating hits new low3",
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna.',
    image_url: 'https://picsum.photos/id/7/367/267',
    url: 'https://picsum.photos/id/7/367/267',
    categories: ['general'],
  },
];

const itemWidth = Dimensions.get('screen').width * 0.9;

var requestOptions = {
  method: 'GET',
};

var params = {
  api_token: 'ddDiL34ChLUzeQMakkLdkmr2iIOU2dkfXsTUOEy5', // Replace with your valid API token
  categories: 'health,travel,general',
  limit: '3',
  language: 'en',
};

var esc = encodeURIComponent;
var query = Object.keys(params)
  .map(function (k) {
    // @ts-ignore
    return esc(k) + '=' + esc(params[k]);
  })
  .join('&');

export default function News() {
  const [news, setNews] = useState<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    fetch('https://api.thenewsapi.com/v1/news/all?' + query, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => setNews(result.data))
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderText text="News Alert" />
      <View style={styles.list}>
        <Animated.FlatList
          horizontal
          snapToAlignment={'start'}
          snapToInterval={itemWidth}
          data={news || newsData}
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
                <TouchableOpacity onPress={() => router.push(item.url)} activeOpacity={0.9}>
                  <ImageBackground
                    source={{ uri: item?.image_url || 'https://picsum.photos/id/7/367/267' }}
                    style={styles.imageBackground}
                  >
                    <View style={styles.textContainer}>
                      <Text style={styles.newsOutlet}>{item.source}</Text>
                      <Text style={styles.newsDesc} numberOfLines={2}>
                        {item.source}
                      </Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          keyExtractor={(item) => item.title}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      <View style={styles.recommendations}>
        <Text style={styles.headerText}>Recommendations</Text>
        <View style={styles.cardContainer}>
          <FlatList
            data={news || newsData}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(item.url)} activeOpacity={0.9}>
                <View style={styles.recomCard}>
                  <Image
                    source={{ uri: item?.image_url || 'https://picsum.photos/id/7/367/267' }}
                    style={styles.recomImage}
                  />
                  <View style={styles.recomTexts}>
                    <Text style={styles.recomTop}>{item.categories[0]}</Text>
                    <Text style={styles.recomName}>{item.source}</Text>
                    <Text style={styles.recomDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
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
    resizeMode: 'center',
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
    flex: 1,
  },
  headerText: {
    fontSize: '18@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#231f20',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
  },
  cardContainer: {
    paddingVertical: '10@vs',
    paddingHorizontal: '20@s',
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
    height: '80@vs',
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
    fontSize: '14@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#016ea6',
  },
  recomDesc: {
    fontSize: '12@ms',
    fontFamily: 'BeVietnamProMedium',
    color: '#b0adad',
  },
});
