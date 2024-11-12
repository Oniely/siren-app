import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const Options = ({ path, text }) => (
  <TouchableOpacity style={styles.option}>
    <Image source={path} style={styles.optionIcon} />
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  optionText: {
    fontSize: 11,
  },
});
