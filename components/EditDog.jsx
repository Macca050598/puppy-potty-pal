import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateDog, deleteDog, getDog } from '../lib/appwrite'; // You'll need to implement getDog

const EditDog = ({ isVisible, onClose, onDogUpdated, onDogDeleted, dogId }) => {
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

  if (isLoading) {
    return (
      <Modal visible={isVisible} animationType="fade" transparent={true}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <Text style={{ color: 'white' }}>Loading...</Text>
        </View>
      </Modal>
    );
  }

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
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Edit Dog</Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Dog Name"
            value={dogName}
            onChangeText={setDogName}
          />

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Dog Breed"
            value={dogBreed}
            onChangeText={setDogBreed}
          />

          <Text style={{ marginBottom: 5 }}>Date of Birth:</Text>
          <TouchableOpacity 
            style={{ 
              borderWidth: 1, 
              borderColor: '#ccc', 
              borderRadius: 5, 
              padding: 10, 
              marginBottom: 15 
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{dogDOB.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dogDOB}
              mode="date"
              display="default"
              onChange={onChangeDOB}
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
                width: '30%',
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
                width: '30%',
              }} 
              onPress={handleUpdateDog}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                borderRadius: 5,
                padding: 10,
                backgroundColor: 'red',
                width: '30%',
              }} 
              onPress={handleDeleteDog}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditDog;