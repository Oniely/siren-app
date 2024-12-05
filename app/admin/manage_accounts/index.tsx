import { View, Text, Image, Pressable, FlatList, Modal, TextInput, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { ScaledSheet } from 'react-native-size-matters';
import { scale } from 'react-native-size-matters';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/firebaseConfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import ButtonContainer from '@/components/ButtonContainer';

export default function ManageAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userAccounts, setUserAccounts] = useState(0);
  const [responderAccounts, setResponderAccounts] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // State for selected user
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [userName, setUserName] = useState(''); // State for editing name
  const [firstName, setFirstName] = useState(''); // State for editing name
  const [lastName, setLastName] = useState(''); // State for editing name
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete confirmation modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // State for user to delete

  type User = {
    id: string;
    firstname: string;
    lastname: string;
    role: 'user' | 'responder';
  };

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userList = Object.entries(data).map(([id, userData]) => ({
            ...userData, // Spread userData directly
            id, // Ensure id is explicitly added or overwritten
          }));

          setUsers(userList);

          // Count totals
          setTotalUsers(userList.length);
          setUserAccounts(userList.filter((user) => user.role === 'user').length);
          setResponderAccounts(userList.filter((user) => user.role === 'responder').length);
        } else {
          console.log('No users found.');
        }
      });
    };

    fetchUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);
      setUsers(users.filter((user) => user.id !== userId)); // Remove user from local state
      console.log('User deleted');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = () => {
    if (selectedUser) {
      const userRef = ref(db, `users/${selectedUser.id}`);
      update(userRef, {
        username: userName,
        firstname: firstName,
        lastname: lastName,
      })
        .then(() => {
          setModalVisible(false);
          setUserName('');
          setFirstName('');
          setLastName('');
          console.log('User details updated');
        })
        .catch((error) => {
          console.error('Error updating user:', error);
        });
    }
  };

  const renderAccountItem = ({ item }: { item: User }) => (
    <View style={styles.account}>
      <View style={styles.accountDetail}>
        <Image source={require('@/assets/images/profile_placeholder.png')} style={styles.accoutImage} />
        <Text style={styles.accountName}>{item.firstname + ' ' + item.lastname}</Text>
      </View>
      <View style={styles.accountPressables}>
        <Pressable
          onPress={() => {
            setUserToDelete(item); // Set the user to be deleted
            setDeleteModalVisible(true); // Show delete confirmation modal
          }}
        >
          <AntDesign name="delete" size={24} color="red" />
        </Pressable>
        <Pressable
          onPress={() => {
            setSelectedUser(item);
            setUserName(item.username); // Set the initial value for editing
            setLastName(item.lastname); // Set the initial value for editing
            setFirstName(item.firstname); // Set the initial value for editing
            setModalVisible(true); // Open the modal
          }}
        >
          <Feather name="edit" size={24} color="blue" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <AdminStyledContainer>
      <AdminHeader bg="#e6e6e6" />
      <View style={styles.container}>
        <View>
          <Text style={styles.headerText}>Manage Accounts</Text>
          <Text style={styles.headerDesc} numberOfLines={1}>
            Overview of user accounts.
          </Text>
        </View>
        <View style={styles.overviewContainer}>
          <View style={styles.overviewBox}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <Text style={styles.overviewNumber}>{totalUsers}</Text>
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
              <Text style={styles.dataBoxNumber}>{userAccounts}</Text>
              <View style={styles.overviewTitleContainer}>
                <Image
                  source={require('@/assets/images/profile_placeholder.png')}
                  style={styles.overviewIcon}
                />
                <Text style={styles.dataBoxLabel}>Users Account</Text>
              </View>
            </View>
            <View style={styles.dataBox}>
              <Text style={styles.dataBoxNumber}>{responderAccounts}</Text>
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
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderAccountItem}
              contentContainerStyle={{ gap: scale(10) }}
            />
          </View>
        </View>
      </View>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.editModalContent}>
              <Text style={styles.modalHeader}>Edit User</Text>
              <Text style={styles.placeHolderText}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
              />
              <Text style={styles.placeHolderText}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.confirmModalButtons, styles.modalButton]} onPress={handleEditUser}>
                  <Text style={styles.buttonTextYes}>Save Changes</Text>
                </Pressable>

                <Pressable
                  style={[styles.declineModalButtons, styles.modalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonTextNo}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={require('@/assets/images/warning_logo.png')} style={styles.warningImage} />
              <Text style={styles.modalHeader}>Are you sure you want to delete this user?</Text>
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.confirmModalButtons, styles.modalButton]} onPress={deleteUser}>
                  <Text style={styles.buttonTextYes}>Yes</Text>
                </Pressable>

                <Pressable
                  style={[styles.declineModalButtons, styles.modalButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.buttonTextNo}>No</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeHolderText: {
    textAlign: 'left',
    paddingBottom: 5,
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: '10@s',
    borderRadius: '5@s',
    width: '45%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: '18@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#343434',
    marginBottom: '20@s',
    textAlign: 'center',
  },
  warningImage: {
    resizeMode: 'stretch',
    height: 100,
    width: 100,
    marginBottom: 15,
    borderRadius: 20,
  },
  modalButton: {
    paddingVertical: '10@s',
    borderRadius: '5@s',
    width: '45%',
    alignItems: 'center',
  },
  confirmModalButtons: {
    backgroundColor: '#fff', // Green for Yes
    borderWidth: 1,
    borderColor: '#0c0c63',
  },
  declineModalButtons: {
    backgroundColor: '#fff', // Green for Yes
    borderWidth: 1,
    borderColor: '#F44336',
  },
  buttonTextYes: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#0c0c63',
    fontWeight: 'bold',
  },
  buttonTextNo: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#F44336',
    fontWeight: 'bold',
  },
});
