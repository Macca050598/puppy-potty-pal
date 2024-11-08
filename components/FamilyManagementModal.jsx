import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList, Modal } from 'react-native';
import { useTheme } from '../config/theme';
import { updateFamily, leaveFamily, deleteFamily, getFamilyDogs, updateFamilyDogs, getAllUsers, updateFamilyMembers, getAllUserDogs } from '../lib/appwrite';
import AuthenticatedLayout from './AuthenticatedLayout';
import { StatusBar } from 'expo-status-bar';

const FamilyManagementModal = ({ visible, family, onClose, onUpdate, currentUserId }) => {
  const { colors } = useTheme();
  const [editedFamilyName, setEditedFamilyName] = useState(family?.name || '');
  const [familyDogs, setFamilyDogs] = useState([]);
  const [selectedDogs, setSelectedDogs] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [allDogs, setAllDogs] = useState([]);
  
  const isAdmin = family && family.admin_id === currentUserId;

  useEffect(() => {
    if (family) {
      setEditedFamilyName(family.name);
      fetchFamilyDogs();
      fetchAllUsers();
    }
  }, [family]);

  const fetchFamilyDogs = async () => {
    try {
      const familyDogsResponse = await getFamilyDogs(family.$id);
      setFamilyDogs(familyDogsResponse);
      
      if (currentUserId) {
        const userDogsResponse = await getAllUserDogs(currentUserId);
        setAllDogs(Array.isArray(userDogsResponse) ? userDogsResponse : []);
      }
      
      const dogsObj = {};
      familyDogsResponse.forEach(dog => {
        dogsObj[dog.$id] = true;
      });
      setSelectedDogs(dogsObj);
    } catch (error) {
      setFamilyDogs([]);
      setAllDogs([]);
      setSelectedDogs({});
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      const membersObj = {};
      family.members.forEach(memberId => {
        membersObj[memberId] = true;
      });
      setSelectedMembers(membersObj);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const handleUpdateFamily = async () => {
    try {
      await updateFamily(family.$id, editedFamilyName);
      if (isAdmin) {
        await updateFamilyDogs(family.$id, selectedDogs);
        await updateFamilyMembers(family.$id, selectedMembers);
      }
      Alert.alert('Success', 'Family updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update family: ' + error.message);
    }
  };

  const handleDeleteFamily = async () => {
    Alert.alert(
      'Delete Family',
      'Are you sure you want to delete this family? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamily(family.$id);
              Alert.alert('Success', 'Family deleted successfully!');
              onUpdate();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete family: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const handleLeaveFamily = async () => {
    Alert.alert(
      'Leave Family',
      'Are you sure you want to leave this family?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveFamily(currentUserId, family.$id);
              Alert.alert('Success', 'You have left the family successfully');
              onUpdate();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave family: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderDogItem = ({ item }) => (
    <View style={styles.dogItem}>
      <Text style={styles.dogName}>{item.name}</Text>
      {isAdmin && (
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleDogSelection(item.$id)}
        >
          {selectedDogs[item.$id] && <View style={styles.checked} />}
        </TouchableOpacity>
      )}
    </View>
  );

  const toggleDogSelection = (dogId) => {
    if (isAdmin) {
      setSelectedDogs(prev => ({...prev, [dogId]: !prev[dogId]}));
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.username}</Text>
      {isAdmin && family.admin_id !== item.$id && (
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleMemberSelection(item.$id)}
        >
          {selectedMembers[item.$id] && <View style={styles.checked} />}
        </TouchableOpacity>
      )}
    </View>
  );

  const toggleMemberSelection = (memberId) => {
    if (isAdmin && family.admin_id !== memberId) {
      setSelectedMembers(prev => ({...prev, [memberId]: !prev[memberId]}));
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      padding: 20,
      borderRadius: 10,
      width: '80%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.secondary,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.secondary,
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      color: colors.secondary,
    },
    memberItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    memberName: {
      fontSize: 16,
      color: colors.secondary,
    },
    button: {
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: colors.background,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    dogItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    dogName: {
      fontSize: 16,
      color: colors.secondary,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checked: {
      width: 12,
      height: 12,
      backgroundColor: colors.secondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondary,
      marginTop: 10,
      marginBottom: 5,
    },
    dogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
      },
      dogName: {
        fontSize: 16,
        color: colors.text,
      },
    list: {
      maxHeight: 200,
      marginBottom: 10,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text,
      fontStyle: 'italic',
      padding: 10,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <AuthenticatedLayout>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Family</Text>
            <TextInput
              style={styles.input}
              value={editedFamilyName}
              onChangeText={setEditedFamilyName}
              placeholder="Family Name"
              placeholderTextColor={colors.placeholder}
              editable={isAdmin}
            />
            {isAdmin && (
              <>
                <Text style={styles.sectionTitle}>Available Dogs</Text>
                <FlatList
                  data={allDogs}
                  renderItem={renderDogItem}
                  keyExtractor={(item) => item.$id}
                  style={styles.list}
                  ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No available dogs</Text>
                  )}
                />
              </>
            )}
            <Text style={styles.sectionTitle}>Family Dogs</Text>
            <FlatList
              data={familyDogs}
              renderItem={renderDogItem}
              keyExtractor={(item) => item.$id}
              style={styles.list}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>No family dogs</Text>
              )}
            />
            <Text style={styles.sectionTitle}>Family Members</Text>
            <FlatList
              data={allUsers.filter(user => selectedMembers[user.$id])}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.$id}
            />
            {isAdmin ? (
              <>
                <TouchableOpacity style={styles.button} onPress={handleUpdateFamily}>
                  <Text style={styles.buttonText}>Update Family</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFamily}>
                  <Text style={styles.buttonText}>Delete Family</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.deleteButton} onPress={handleLeaveFamily}>
                <Text style={styles.buttonText}>Leave Family</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default FamilyManagementModal;