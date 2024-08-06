import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserDogs, getDogToiletEvents, addToiletEvent } from '../lib/appwrite'; // Adjust path as needed

import CustomDropdown from './CustomDropdown.jsx';
import { predictNextTrip } from '../utils/tripPrediction.jsx';

const AddToiletTrip = ({ isVisible, onClose, onAddTrip = [] }) => {
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

//   const handleAddTrip = async (dogId, type, location, timestamp) => {
//     try {
//       const newEvent = await addToiletEvent(dogId, type, location, timestamp);
//       setEvents([newEvent, ...events]);
//       await predictNextTrip(dogId);
//     } catch (error) {
//       console.error('Failed to save event:', error);
//     }
//   };

  const handleDogAdded = (newDog) => {
    setDogs([...associatedDog, newDog]);
  };


  const handleSubmit = async () => {
    if (selectedDog) {
      try {
        // Call onAddTrip and wait for it to complete
        await onAddTrip(selectedDog.$id, type, location, timestamp);
        
        // After successfully adding the trip, predict the next trip
        await predictNextTrip(selectedDog.$id);
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error('Failed to add trip or predict next trip:', error);
        // You might want to show an error message to the user here
        alert('Failed to add trip. Please try again.');
      }
    } else {
      // Show an error or alert that a dog must be selected
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

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          width: '80%',
          maxWidth: 300,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Add Toilet Trip</Text>
          
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
            />
            ) : (
            <Text style={{ marginBottom: 15, color: 'red' }}>No dogs available. Please add a dog first.</Text>
            )}


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

          <Text style={{ marginBottom: 5 }}>Time:</Text>
          <TouchableOpacity 
        style={{ 
          borderWidth: 1, 
          borderColor: '#ccc', 
          borderRadius: 5, 
          padding: 10, 
          marginBottom: 15 
        }}
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

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
            <TouchableOpacity 
              style={{
                borderRadius: 5,
                padding: 10,
                backgroundColor: '#ccc',
                width: '45%',
              }} 
              onPress={onClose}
            >
              <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                borderRadius: 5,
                padding: 10,
                backgroundColor: '#FF9C01',
                width: '45%',
              }} 
              onPress={handleSubmit}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export default AddToiletTrip;