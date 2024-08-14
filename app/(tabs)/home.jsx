import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDogs, getDogToiletEvents, addToiletEvent, updateToiletEvent } from '../../lib/appwrite';
import AddNewDog from '../../components/AddNewDog';
import AddToiletTrip from '../../components/AddToiletTrip';
import NextTripPrediction from '../../utils/NextTripPrediction';
import EditDog from '../../components/EditDog';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../context/GlobalProvider';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import EditToiletTrip from '../../components/EditToiletTrip';

const groupEventsByDay = (events) => {
  const grouped = events.reduce((acc, event) => {
    const date = new Date(event.timestamp);
    const day = date.toDateString();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {});

  return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
};

const Home = () => {
  const { user } = useGlobalContext();
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAddDogModalVisible, setIsAddDogModalVisible] = useState(false);
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditDogModalVisible, setIsEditDogModalVisible] = useState(false);
  const [selectedDogForEdit, setSelectedDogForEdit] = useState();
  const [isEditTripModalVisible, setIsEditTripModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleEditTrip = async (updatedTrip) => {
    try {
      await updateToiletEvent(updatedTrip.$id, updatedTrip);
      setEvents(prevEvents => prevEvents.map(event => 
        event.$id === updatedTrip.$id ? updatedTrip : event
      ));
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

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
      setEvents(dogEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleAddTrip = async (dogId, type, location, timestamp) => {
    try {
      const newEvent = await addToiletEvent(dogId, type, location, timestamp);
      setEvents(prevEvents => [newEvent, ...prevEvents].slice(0, 20));
      onRefresh();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDogAdded = (newDog) => {
    setDogs(prevDogs => [...prevDogs, newDog]);
    setSelectedDog(newDog);
  };

  const renderHeader = () => (
    <AuthenticatedLayout>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.companyName}>{user.username}</Text>
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
            onLongPress={() => {
              setSelectedDogForEdit(item);
              setIsEditDogModalVisible(true);
            }}
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
    </AuthenticatedLayout>
  );

  const renderEventGroup = ({ item }) => {
    const [date, dayEvents] = item;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let dayLabel;
    if (date === today) {
      dayLabel = "Today";
    } else if (date === yesterday) {
      dayLabel = "Yesterday";
    } else {
      dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    return (
      <View style={styles.dayGroup}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        {dayEvents.map((event) => (
          <TouchableOpacity 
            key={event.$id} 
            style={styles.eventItem}
            onPress={() => {
              setSelectedTrip(event);
              setIsEditTripModalVisible(true);
            }}
          >
            <Text style={styles.eventText}>{`${event.type} - ${event.location}`}</Text>
            <Text style={styles.eventTime}>
              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text stlye={styles.eventTime}>{user.username}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={groupEventsByDay(events)}
        renderItem={renderEventGroup}
        keyExtractor={(item) => item[0]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>No toilet trips recorded yet.</Text>}
        contentContainerStyle={styles.scrollContent}
      />

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

      <EditDog
        isVisible={isEditDogModalVisible}
        onClose={() => setIsEditDogModalVisible(false)}
        onDogUpdated={(updatedDog) => {
          setDogs(dogs.map(dog => dog.$id === updatedDog.$id ? updatedDog : dog));
          if (selectedDog && selectedDog.$id === updatedDog.$id) {
            setSelectedDog(updatedDog);
          }
        }}
        onDogDeleted={(deletedDogId) => {
          setDogs(dogs.filter(dog => dog.$id !== deletedDogId));
          if (selectedDog && selectedDog.$id === deletedDogId) {
            setSelectedDog(null);
          }
        }}
        dogId={selectedDogForEdit ? selectedDogForEdit.$id : null}
      />

        <EditToiletTrip
                isVisible={isEditTripModalVisible}
                onClose={() => setIsEditTripModalVisible(false)}
                onSave={handleEditTrip}
                trip={selectedTrip}
              />
      <StatusBar backgroundColor='#161622' style='light'/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#161622',
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
  username: {
    
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
  dayGroup: {
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9C01',
    marginBottom: 10,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventText: {
    color: 'white',
  },
  eventTime: {
    color: '#CCCCCC',
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
    backgroundColor: 'rgba(22, 22, 34, 0.9)',
    padding: 10,
  },
});

export default Home;