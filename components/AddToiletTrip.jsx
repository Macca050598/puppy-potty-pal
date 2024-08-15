import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserDogs, getDogToiletEvents } from '../lib/appwrite'; // Adjust path as needed
import CustomDropdown from './CustomDropdown.jsx';
import { predictNextTrip } from '../utils/tripPrediction.jsx';

const AddToiletTrip = ({ isVisible, onClose, onAddTrip = [], colors }) => {
  const [selectedDog, setSelectedDog] = useState(null);
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [associatedDog, setDogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setTimestamp(new Date());
    }
  }, [isVisible]);

  const loadDogs = async () => {
    try {
      const userDogs = await getUserDogs();
      setDogs(userDogs);
      if (userDogs.length > 0) {
        setSelectedDog(userDogs[0]);
        loadEvents(userDogs[0].$id);
      }
    } catch (error) {
      console.error('Failed to load dogs:', error);
    }
  };

  const loadEvents = async (dogId) => {
    try {
      const dogEvents = await getDogToiletEvents(dogId);
      setEvents(dogEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleSubmit = async () => {
    if (selectedDog) {
      try {
        await onAddTrip(selectedDog.$id, type, location, timestamp);
        await predictNextTrip(selectedDog.$id);
        onClose();
      } catch (error) {
        console.error('Failed to add trip or predict next trip:', error);
        alert('Failed to add trip. Please try again.');
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
    { label: 'Wee', value: 'wee' },
    { label: 'Poo', value: 'poo' },
  ];

  const locationOptions = [
    { label: 'Outside', value: 'outside' },
    { label: 'Inside (Accident)', value: 'inside' },
  ];

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
          <Text style={styles.title}>Add Toilet Trip</Text>
          
          {associatedDog.length > 0 ? (
            <CustomDropdown
              options={associatedDog.map(dog => ({ label: dog.name, value: dog.$id }))}
              selectedValue={selectedDog ? selectedDog.$id : ''}
              onSelect={(value) => {
                const selected = associatedDog.find(dog => dog.$id === value);
                setSelectedDog(selected);
                loadEvents(value);
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
            label="Type of toilet"
            colors={colors}
          />

          <CustomDropdown
            options={locationOptions}
            selectedValue={location}
            onSelect={setLocation}
            label="Location"
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
              <Text style={[styles.buttonText, styles.addButtonText]}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddToiletTrip;