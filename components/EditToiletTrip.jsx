import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDropdown from './CustomDropdown.jsx';

const EditToiletTrip = ({ isVisible, onClose, onSave, trip }) => {
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (trip) {
      setType(trip.type);
      setLocation(trip.location);
      setTimestamp(new Date(trip.timestamp));
    }
  }, [trip]);

  const handleSave = () => {
    if (trip) {
      onSave({ ...trip, type, location, timestamp: timestamp.toISOString() });
    }
    onClose();
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

  if (!trip) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Toilet Trip</Text>

          <CustomDropdown
            options={typeOptions}
            selectedValue={type}
            onSelect={setType}
            label="Type of toilet"
          />

          <CustomDropdown
            options={locationOptions}
            selectedValue={location}
            onSelect={setLocation}
            label="Location"
          />

          <Text style={styles.label}>Time:</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text>{timestamp.toLocaleTimeString()}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timestamp}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeTime}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
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
  },
  label: {
    marginBottom: 5,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
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
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#FF9C01',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditToiletTrip;