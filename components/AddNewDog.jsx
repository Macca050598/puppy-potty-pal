import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDog, getCurrentUser } from '../lib/appwrite'; // Adjust the import path as needed

const AddNewDog = ({ isVisible, onClose, onDogAdded, colors }) => {
  const [newDogName, setNewDogName] = useState('');
  const [newDogBreed, setNewDogBreed] = useState('');
  const [newDogDOB, setNewDogDOB] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobError, setDobError] = useState('');

  const handleAddDog = async () => {
    try {
      const formattedDate = newDogDOB.toISOString();
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.$id) {
        const userId = currentUser.$id;
        const newDog = await addDog(userId, newDogName, newDogBreed, formattedDate);
        onDogAdded(newDog);
        onClose();
        setNewDogName('');
        setNewDogBreed('');
        setNewDogDOB(new Date());
        setDobError('');
      } else {
        throw new Error('No current user found');
      }
    } catch (error) {
      console.error('Failed to add dog:', error);
      Alert.alert('Error', 'Failed to add dog. Please try again.');
    }
  };

  const onChangeDOB = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDogDOB(selectedDate);
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
    errorText: {
      color: 'red',
      marginBottom: 15,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      borderRadius: 5,
      padding: 10,
      width: '45%',
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    addButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButtonText: {
      color: colors.text,
    },
    addButtonText: {
      color: colors.accent,
    },
  });

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add New Dog</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Dog Name"
            value={newDogName}
            onChangeText={setNewDogName}
          />

          <TextInput
            style={styles.input}
            placeholder="Dog Breed"
            value={newDogBreed}
            onChangeText={setNewDogBreed}
          />

          <Text style={[styles.datePickerText, { marginBottom: 5 }]}>Date of Birth:</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{newDogDOB.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={newDogDOB}
              mode="date"
              display="default"
              onChange={onChangeDOB}
              textColor={colors.text}
            />
          )}

          {dobError ? (
            <Text style={styles.errorText}>{dobError}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.addButton]}
              onPress={handleAddDog}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>Add Dog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewDog;