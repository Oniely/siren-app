import { View, Text, Image } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Href, Link } from 'expo-router';

interface Props {
  image: any;
  name: string;
  desc: string;
  time: string;
  href: Href;
  read?: boolean;
}

export default function NotificationCard({ image, name, desc, time, href, read = false }: Props) {
  return (
    <Link href={href} asChild>
      <View style={styles.container}>
        <View style={read ? styles.circleIndicator : styles.transparent} />
        <Image source={image} style={styles.image} />
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.desc} numberOfLines={1}>
            {desc}
          </Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Link>
  );
}

const styles = ScaledSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    gap: '10@s',
    marginBottom: '10@s',
    paddingVertical: '20@s',
    borderBottomWidth: 1,
    borderBottomColor: '#ecebe8',
  },
  circleIndicator: {
    width: '10@s',
    height: '10@s',
    backgroundColor: '#1c85e8',
    borderRadius: 999,
  },
  transparent: {
    width: '10@s',
    height: '10@s',
    borderRadius: 999,
  },
  image: {
    width: '40@s',
    height: '40@s',
    marginHorizontal: '10@s',
    borderRadius: 999,
  },
  name: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  desc: {
    fontSize: '12@s',
    color: '#b0adad',
    width: '60%',
    fontFamily: 'BeVietnamProRegular',
  },
  time: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: '12@s',
    fontFamily: 'BeVietnamProRegular',
  },
});
