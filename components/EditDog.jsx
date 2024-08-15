import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateDog, deleteDog, getDog } from '../lib/appwrite';

const EditDog = ({ isVisible, onClose, onDogUpdated, onDogDeleted, dogId, colors, isOwnedByUser }) => {
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogDOB, setDogDOB] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible && dogId) {
      fetchDogData();
    }
  }, [isVisible, dogId]);

  const fetchDogData = async () => {
    setIsLoading(true);
    try {
      const dogData = await getDog(dogId);
      setDogName(dogData.name || '');
      setDogBreed(dogData.breed || '');
      setDogDOB(dogData.birthdate ? new Date(dogData.birthdate) : new Date());
    } catch (error) {
      console.error('Failed to fetch dog data:', error);
      Alert.alert('Error', 'Failed to load dog information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDog = async () => {
    if (!isOwnedByUser) return;
    try {
      const updatedDog = await updateDog(dogId, dogName, dogBreed, dogDOB.toISOString());
      onDogUpdated(updatedDog);
      onClose();
    } catch (error) {
      console.error('Failed to update dog:', error);
      Alert.alert('Error', 'Failed to update dog. Please try again.');
    }
  };

  const handleDeleteDog = async () => {
    if (!isOwnedByUser) return;
    Alert.alert(
      "Delete Dog",
      "Are you sure you want to delete this dog? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDog(dogId);
              onDogDeleted(dogId);
              onClose();
            } catch (error) {
              console.error('Failed to delete dog:', error);
              Alert.alert('Error', 'Failed to delete dog. Please try again.');
            }
          }
        }
      ]
    );
  };

  const onChangeDOB = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && isOwnedByUser) {
      setDogDOB(selectedDate);
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: '80%',
      maxWidth: 300,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: colors.text,
    },
    datePickerButton: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    datePickerText: {
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      borderRadius: 5,
      padding: 10,
      width: '30%',
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    updateButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: 'red',
    },
    buttonText: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButtonText: {
      color: colors.text,
    },
    actionButtonText: {
      color: colors.accent,
    },disabledInput: {
      opacity: 0.5,
    },
    ownershipNote: {
      color: colors.tint,
      fontStyle: 'italic',
      marginBottom: 10,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <Modal visible={isVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{isOwnedByUser ? "Edit Dog" : "Dog Details"}</Text>
          
          {!isOwnedByUser && (
            <Text style={styles.ownershipNote}>This is a family dog. You cannot edit its details.</Text>
          )}

          <TextInput
            style={[styles.input, !isOwnedByUser && styles.disabledInput]}
            placeholder="Dog Name"
            value={dogName}
            onChangeText={setDogName}
            editable={isOwnedByUser}
          />

          <TextInput
            style={[styles.input, !isOwnedByUser && styles.disabledInput]}
            placeholder="Dog Breed"
            value={dogBreed}
            onChangeText={setDogBreed}
            editable={isOwnedByUser}
          />

          <Text style={[styles.datePickerText, { marginBottom: 5 }]}>Date of Birth:</Text>
          <TouchableOpacity 
            style={[styles.datePickerButton, !isOwnedByUser && styles.disabledInput]}
            onPress={() => isOwnedByUser && setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{dogDOB.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && isOwnedByUser && (
            <DateTimePicker
              value={dogDOB}
              mode="date"
              display="default"
              onChange={onChangeDOB}
              textColor={colors.text}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Close</Text>
            </TouchableOpacity>
            {isOwnedByUser && (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.updateButton]}
                  onPress={handleUpdateDog}
                >
                  <Text style={[styles.buttonText, styles.actionButtonText]}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteDog}
                >
                  <Text style={[styles.buttonText, styles.actionButtonText]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditDog;