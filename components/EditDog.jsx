import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateDog, deleteDog, getDog } from '../lib/appwrite';

const EditDog = ({ isVisible, onClose, onDogUpdated, onDogDeleted, dogId, colors }) => {
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
    if (selectedDate) {
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
      backgroundColor: colors.accent,
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
          <Text style={styles.title}>Edit Dog</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Dog Name"
            placeholderTextColor={colors.tint}
            value={dogName}
            onChangeText={setDogName}
          />

          <TextInput
            style={styles.input}
            placeholder="Dog Breed"
            placeholderTextColor={colors.tint}
            value={dogBreed}
            onChangeText={setDogBreed}
          />

          <Text style={[styles.datePickerText, { marginBottom: 5 }]}>Date of Birth:</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{dogDOB.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
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
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
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
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditDog;