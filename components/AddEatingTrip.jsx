import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCurrentUserDogs } from '../lib/appwrite.js';
import CustomDropdown from './CustomDropdown.jsx';

const AddEatingTrip = ({ isVisible, onClose, onAddEatingTrip, colors }) => {
  const [selectedDog, setSelectedDog] = useState(null);
  const [type, setType] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [associatedDogs, setAssociatedDogs] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      refreshDogList();
      setTimestamp(new Date());
      setType('');
    }
  }, [isVisible]);

  const refreshDogList = async () => {
    try {
      const userDogs = await getCurrentUserDogs();
      setAssociatedDogs(userDogs);
      if (userDogs.length > 0) {
        setSelectedDog(userDogs[0]);
      }
    } catch (error) {
      console.error('Failed to load dogs:', error);
    }
  };

  const handleSubmit = async () => {
    if (selectedDog) {
      try {
        await onAddEatingTrip(selectedDog.$id, type, timestamp);
        onClose();
      } catch (error) {
        console.error('Failed to add eating event:', error);
        alert('Failed to add eating event. Please try again.');
      }
    } else {
      alert('Please select a dog');
    }
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTimestamp(selectedDate);
    }
  };

  const typeOptions = [
    { label: 'Snack', value: 'snack' },
    { label: 'Meal', value: 'meal' },
  ];


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
    errorText: {
      marginBottom: 15,
      color: 'red',
    },
    timePickerButton: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    timePickerText: {
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
          <Text style={styles.title}>Add Eating Event</Text>
          
          {associatedDogs.length > 0 ? (
            <CustomDropdown
              options={associatedDogs.map(dog => ({ label: dog.name, value: dog.$id }))}
              selectedValue={selectedDog ? selectedDog.$id : ''}
              onSelect={(value) => {
                const selected = associatedDogs.find(dog => dog.$id === value);
                setSelectedDog(selected);
              }}
              label="Select Dog"
              colors={colors}
            />
          ) : (
            <Text style={styles.errorText}>No dogs available. Please add a dog first.</Text>
          )}

          <CustomDropdown
            options={typeOptions}
            selectedValue={type}
            onSelect={setType}
            label="Type of Eating"
            colors={colors}
          />
          <Text style={{ marginBottom: 5, color: colors.text }}>Time:</Text>
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timePickerText}>{timestamp.toLocaleTimeString()}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timestamp}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeTime}
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
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddEatingTrip;