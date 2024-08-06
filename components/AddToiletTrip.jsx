import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserDogs, getDogToiletEvents, addToiletEvent } from '../lib/appwrite'; // Adjust path as needed


 

const AddToiletTrip = ({ isVisible, onClose, onAddTrip, dogs = [] }) => {
  const [selectedDog, setSelectedDog] = useState(null);
  const [type, setType] = useState('wee');
  const [location, setLocation] = useState('outside');
  const [timestamp, setTimestamp] = useState(new Date());
  const [associatedDog, setDogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadDogs();
  }, []);

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

  const handleAddTrip = async (dogId, type, location, timestamp) => {
    try {
      const newEvent = await addToiletEvent(dogId, type, location, timestamp);
      setEvents([newEvent, ...events]);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDogAdded = (newDog) => {
    setDogs([...associatedDog, newDog]);
  };


  const handleSubmit = () => {
    if (selectedDog) {
      onAddTrip(selectedDog, type, location, timestamp);
      onClose();
    } else {
      // Show an error or alert that a dog must be selected
      alert('Please select a dog');
    }
  };

  const onChangeTime = (event, selectedDate) => {
    const currentDate = selectedDate || timestamp;
    setShowTimePicker(Platform.OS === 'ios');
    setTimestamp(currentDate);
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
                backgroundColor: '#4CAF50',
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


// Custom Drop down
const CustomDropdown = ({ options, selectedValue, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <View style={{ marginBottom: 15 }}>
        <Text style={{ marginBottom: 5 }}>{label}:</Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            backgroundColor: 'white',
          }}
          onPress={() => setIsOpen(true)}
        >
          <Text>{options.find(opt => opt.value === selectedValue)?.label || 'Select'}</Text>
        </TouchableOpacity>
        <Modal visible={isOpen} transparent animationType="fade">
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 10,
              width: '80%',
              maxHeight: '50%',
            }}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                    onPress={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
  
              
            </View>
          </View>
        </Modal>
      </View>
    );
  };
export default AddToiletTrip;