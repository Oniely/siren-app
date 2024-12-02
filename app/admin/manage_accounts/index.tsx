import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { ScaledSheet } from 'react-native-size-matters';
import { scale } from 'react-native-size-matters';
import { Link } from 'expo-router';

export default function ManageAccounts() {
  return (
    <AdminStyledContainer>
      <AdminHeader bg="#e6e6e6" />
      <View style={styles.container}>
        <View>
          <Text style={styles.headerText}>Manage Accounts</Text>
          <Text style={styles.headerDesc} numberOfLines={1}>
            Lorem ipsum dolor sit amet...
          </Text>
        </View>
        <View style={styles.overviewContainer}>
          <View style={styles.overviewBox}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <Text style={styles.overviewNumber}>200</Text>
            <View style={styles.overviewTitleContainer}>
              <Image
                source={require('@/assets/images/profile_placeholder.png')}
                style={styles.overviewIcon}
              />
              <Text style={styles.overviewLabel}>Total Active Users</Text>
            </View>
          </View>
          <View style={styles.dataBoxContainer}>
            <View style={styles.dataBox}>
              <Text style={styles.dataBoxNumber}>180</Text>
              <View style={styles.overviewTitleContainer}>
                <Image
                  source={require('@/assets/images/profile_placeholder.png')}
                  style={styles.overviewIcon}
                />
                <Text style={styles.dataBoxLabel}>Users Account</Text>
              </View>
            </View>
            <View style={styles.dataBox}>
              <Text style={styles.dataBoxNumber}>20</Text>
              <View style={styles.overviewTitleContainer}>
                <Image
                  source={require('@/assets/images/profile_placeholder.png')}
                  style={styles.overviewIcon}
                />
                <Text style={styles.dataBoxLabel}>Responders Account</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ marginTop: scale(30) }}>
          <Text style={styles.accountText}>Accounts</Text>
          <View style={styles.accountContainer}>
            {/* use this view to iterate accounts using FlatList or sumn */}
            <View style={styles.account}>
              <View style={styles.accountDetail}>
                <Image
                  source={require('@/assets/images/profile_placeholder.png')}
                  style={styles.accoutImage}
                />
                <Text style={styles.accountName}>Elizabeth Bracken</Text>
              </View>
              <View style={styles.accountPressables}>
                <Pressable>
                  <Text style={styles.disable}>Disable</Text>
                </Pressable>
                <Pressable>
                  <Text style={{ fontWeight: 'bold' }}>...</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </AdminStyledContainer>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '20@s',
    paddingVertical: '10@s',
    backgroundColor: '#e6e6e6',
  },
  headerText: {
    fontSize: '24@s',
    fontFamily: 'BeVietnamProBold',
  },
  headerDesc: {
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#343434',
  },
  overviewContainer: {
    flexDirection: 'row',
    marginTop: '30@s',
    gap: '10@s',
  },
  overviewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5@s',
  },
  overviewTitle: {
    color: '#FFF',
    fontSize: '16@s',
    fontFamily: 'BeVietnamProBold',
    lineHeight: '18@s',
  },
  overviewBox: {
    width: '50%',
    height: '200@s',
    padding: '10@s',
    backgroundColor: '#016ea6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15@s',
  },
  overviewNumber: {
    fontSize: '60@s',
    fontFamily: 'BeVietnamProBold',
    color: '#FFF',
    lineHeight: '75@s',
  },
  overviewIcon: {
    width: '12@s',
    height: '12@s',
  },
  overviewLabel: {
    fontSize: '10@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#FFF',
  },
  dataBoxContainer: {
    gap: '10@s',
  },
  dataBox: {
    height: '95@s',
    padding: '10@s',
    borderWidth: '3@s',
    borderColor: '#016ea6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15@s',
  },
  dataBoxNumber: {
    fontSize: '48@s',
    fontFamily: 'BeVietnamProBold',
    color: '#343434',
    lineHeight: '58@s',
  },
  dataBoxLabel: {
    fontSize: '10@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#7c8f9c',
  },
  accountText: {
    fontSize: '18@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#343434',
  },
  accountContainer: {
    marginTop: '10@s',
    backgroundColor: '#FFF',
    borderRadius: '15@s',
    height: '240@s',
    padding: '15@s',
  },
  account: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '14@s',
  },
  accoutImage: {
    resizeMode: 'center',
    width: '30@s',
    height: '30@s',
    borderWidth: 1,
    borderColor: '#343434',
    borderRadius: 999,
  },
  accountName: {
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#343434',
  },
  accountPressables: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8@s',
  },
  disable: {
    fontSize: '14@s',
    fontFamily: 'BeVietnamProMedium',
    color: '#f00',
  },
});
