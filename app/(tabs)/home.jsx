import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDogs, getDogToiletEvents, addToiletEvent } from '../../lib/appwrite'; // Adjust path as needed
import AddNewDog from '../../components/AddNewDog';
import AddToiletTrip from '../../components/AddToiletTrip';
import { useNavigation } from 'expo-router';

const Home = () => {
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAddDogModalVisible, setIsAddDogModalVisible] = useState(false);
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const navigation = useNavigation();

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
    setDogs([...dogs, newDog]);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-6 px-4 space-y-6">
        <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">Welcome Back</Text>
            <Text className="text-2xl font-psemibold text-white">MJWeb Ltd.</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity onPress={() => setIsAddDogModalVisible(true)} className="mt-1.5 mr-2">
              <Text className="text-white font-psemibold">Add Dog</Text>
            </TouchableOpacity>
            
          </View>
          
        </View>
        <View>
          {/* <Text className="text-3xl text-white font-bold text-center">Puppy Potty Tracker</Text> */}
          <TouchableOpacity onPress={() => setIsAddTripModalVisible(true)} className="mt-1.5 ">
              <Text className="text-3xl text-white font-bold text-center">Add Trip</Text>
            </TouchableOpacity>
       
          <FlatList
            data={events}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <Text className="text-white">{`${item.type} - ${item.location} at ${new Date(item.timestamp).toLocaleString()}`}</Text>
            )}
          />
       
        </View>
      </View>
      <AddNewDog
        isVisible={isAddDogModalVisible}
        onClose={() => setIsAddDogModalVisible(false)}
        onDogAdded={handleDogAdded}
      />
      <AddToiletTrip
        isVisible={isAddTripModalVisible}
        onClose={() => setIsAddTripModalVisible(false)}
        onAddTrip={handleAddTrip}
        dogId={selectedDog ? selectedDog.$id : null}
      />
      <AddToiletTrip
  isVisible={isAddTripModalVisible}
  onClose={() => setIsAddTripModalVisible(false)}
  onAddTrip={handleAddTrip}
  dogs={dogs}
/>
    </SafeAreaView>
  );
};

export default Home;