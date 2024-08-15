import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList, Modal } from 'react-native';
import { useTheme } from '../config/theme';
import { updateFamily, removeUserFromFamily, deleteFamily } from '../lib/appwrite';

const FamilyManagementModal = ({ visible, family, onClose, onUpdate }) => {
  const { colors } = useTheme();
  const [editedFamilyName, setEditedFamilyName] = useState(family?.name || '');

  useEffect(() => {
    setEditedFamilyName(family?.name || '');
  }, [family]);

  const handleUpdateFamily = async () => {
    try {
      await updateFamily(family.$id, editedFamilyName);
      Alert.alert('Success', 'Family updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update family: ' + error.message);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUserFromFamily(family.$id, userId);
      Alert.alert('Success', 'User removed from family successfully!');
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove user: ' + error.message);
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

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={[styles.memberName, { color: colors.text }]}>{item.username}</Text>
      {family.admin_id !== item.$id && (
        <TouchableOpacity onPress={() => handleRemoveUser(item.$id)}>
          <Text style={[styles.removeButton, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0)',
    },
    modalContent: {
      backgroundColor: colors.primary,
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.accent  ,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      color: colors.accent,
    },
    memberItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
    },
    memberName: {
      fontSize: 16,
      color: colors.accent,
    },
    removeButton: {
      fontSize: 14,
    },
    button: {
      backgroundColor: colors.accent,
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
      backgroundColor: colors.accent,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Manage Family</Text>
          <TextInput
            style={styles.input}
            value={editedFamilyName}
            onChangeText={setEditedFamilyName}
            placeholder="Family Name"
            placeholderTextColor={colors.placeholder}
          />
          <FlatList
            data={family?.members || []}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.$id} // Ensure this is a string
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateFamily}>
            <Text style={styles.buttonText}>Update Family</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFamily}>
            <Text style={styles.buttonText}>Delete Family</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FamilyManagementModal;