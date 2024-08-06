import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDogs, getDogToiletEvents, addToiletEvent } from '../../lib/appwrite'; // Adjust path as needed
import AddNewDog from '../../components/AddNewDog';
import AddToiletTrip from '../../components/AddToiletTrip';
import { useNavigation } from 'expo-router';
import CustomButton from '../../components/CustomButton';
import NextTripPrediction from '../../utils/NextTripPrediction';
import { ScrollView } from 'react-native';
const Home = () => {
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAddDogModalVisible, setIsAddDogModalVisible] = useState(false);
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDogs();
      if (selectedDog) {
        await loadEvents(selectedDog.$id);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDog]);

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (selectedDog) {
      loadEvents(selectedDog.$id);
    }
  }, [selectedDog]);

  const loadDogs = async () => {
    try {
      const userDogs = await getUserDogs();
      setDogs(userDogs);
      if (userDogs.length > 0) {
        setSelectedDog(userDogs[0]);
      }
    } catch (error) {
      console.error('Failed to load dogs:', error);
    }
  };

  const loadEvents = async (dogId) => {
    try {
      const dogEvents = await getDogToiletEvents(dogId);
      if (Array.isArray(dogEvents) && dogEvents.length > 0) {
        
      } else {
        console.log('No events found or events is not an array');
      }
      setEvents(dogEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleAddTrip = async (dogId, type, location, timestamp) => {
    try {
      const newEvent = await addToiletEvent(dogId, type, location, timestamp);
      setEvents(prevEvents => [newEvent, ...prevEvents].slice(0, 20));
      onRefresh(); // Refresh the page after adding a trip
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDogAdded = (newDog) => {
    setDogs(prevDogs => [...prevDogs, newDog]);
    setSelectedDog(newDog);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.companyName}>MJWeb Ltd.</Text>
          </View>
          <TouchableOpacity onPress={() => setIsAddDogModalVisible(true)} style={styles.addDogButton}>
            <Text style={styles.addDogButtonText}>Add Dog</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => setIsAddTripModalVisible(true)} style={styles.addTripButton}>
          <Text style={styles.addTripButtonText}>Add Trip</Text>
        </TouchableOpacity>
        
        <FlatList
          horizontal
          data={dogs}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDog(item)}
              style={[
                styles.dogItem,
                selectedDog && selectedDog.$id === item.$id ? styles.selectedDogItem : null
              ]}
            >
              <Text style={styles.dogName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dogList}
        />

        <FlatList
          data={events}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventText}>{`${item.type} - ${item.location}`}</Text>
              <Text style={styles.eventText}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No toilet trips recorded yet.</Text>}
        />
      </ScrollView>

      <View style={styles.predictionContainer}>
        <NextTripPrediction selectedDog={selectedDog} />
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
        dogs={dogs}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Adjust to match your primary background color
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Add extra padding at the bottom for the prediction
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addDogButton: {
    padding: 10,
    backgroundColor: '#FF9C01',
    borderRadius: 5,
  },
  addDogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addTripButton: {
    backgroundColor: '#FF9C01',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addTripButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dogList: {
    marginBottom: 20,
  },
  dogItem: {
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedDogItem: {
    backgroundColor: '#FF9C01',
  },
  dogName: {
    color: 'white',
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  eventText: {
    color: 'white',
  },
  emptyText: {
    color: '#CCCCCC',
    textAlign: 'center',
  },
  predictionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.9)', // Semi-transparent background
    padding: 10,
  },
});

export default Home;