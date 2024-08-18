import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDogs, getDogToiletEvents, addToiletEvent, updateToiletEvent, getUserAndFamilyDogs, getAllDogsToiletEvents, setToiletEvents } from '../../lib/appwrite';
import AddNewDog from '../../components/AddNewDog';
import AddToiletTrip from '../../components/AddToiletTrip';
import NextTripPrediction from '../../utils/NextTripPrediction';
import EditDog from '../../components/EditDog';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../context/GlobalProvider';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import EditToiletTrip from '../../components/EditToiletTrip';
import { useTheme } from '../../config/theme';
import { Feather } from '@expo/vector-icons';

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
  const { colors } = useTheme();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.background,
    },
    welcomeText: {
      fontSize: 14,
      color: colors.primary,
    },
    companyName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    addDogButton: {
      padding: 10,
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    addDogButtonText: {
      color: colors.text,
      fontWeight: 'bold',
    },
    dogList: {
      marginBottom: 20,
    },
    dogItem: {
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    selectedDogItem: {
      backgroundColor: colors.primary,
    },
    dogName: {
      color: colors.text,
    },
    dayGroup: {
      marginBottom: 20,
    },
    dayLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 10,
    },
    eventItem: {
      backgroundColor: `${colors.secondary}40`,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    eventText: {
      color: colors.text,
    },
    eventTime: {
      color: colors.text,
    },
    emptyText: {
      color: colors.tint,
      textAlign: 'center',
    },
    predictionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: `${colors.background}E6`,
      padding: 10,
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: colors.primary,
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    summaryTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      alignItems: 'center',
      alignContent: 'center',
      paddingBottom: 5,

    },
    summaryTitleContainer: {
      alignItems: 'center',
      alignContent: 'center',
    },
    summaryContent: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryText: {
      color: colors.text,
      marginTop: 5,
    },
  });
 
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const allDogs = await getUserAndFamilyDogs(user.$id);
        setSelectedDog(allDogs[0]);
        setDogs(allDogs);
      } catch (error) {
      }
    };
  
    fetchDogs();
  }, [user.$id]);

  useEffect(() => {
    const fetchToiletEvents = async () => {
      try {
        const dogIds = dogs.map(dog => dog.$id);
        const events = await getAllDogsToiletEvents(dogIds);
        setEvents(events);
      } catch (error) {
        console.error("Error fetching toilet events:", error);
      }
    };
  
    if (dogs.length > 0) {
      fetchToiletEvents();
    }
  }, [dogs]);
  
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

const renderHeader = () => {
  const today = new Date().toDateString();
  const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today);
  const peeCount = todayEvents.filter(e => e.type === 'wee').length;
  const pooCount = todayEvents.filter(e => e.type === 'poo').length;
  const accident = todayEvents.filter(e => 
    e.type.toLowerCase() === 'inside' || 
    e.type.toLowerCase() === 'outside' || 
    e.location.toLowerCase().includes('inside')
  ).length;

  
  return (
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
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryTitleContainer}>
        <Text style={styles.summaryTitle}>
          {selectedDog ? `${selectedDog.name}'s Summary Today` : "Today's Summary"}
        </Text>
        </View>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Feather name="droplet" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>{peeCount} Pee</Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="target" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>{pooCount} Poo</Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="alert-circle" size={24} color={colors.primary} />
            <Text style={styles.summaryText}>{accident} Accidents</Text>
          </View>
        </View>
      </View>

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
};

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
            <Text style={styles.eventTime}>{user.username}</Text>
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
        <NextTripPrediction selectedDog={selectedDog} colors={colors.primary}/>
      </View>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setIsAddTripModalVisible(true)}
      >
        <Feather name="plus" size={30} color={colors.background} />
      </TouchableOpacity>

      <AddNewDog
        isVisible={isAddDogModalVisible}
        onClose={() => setIsAddDogModalVisible(false)}
        onDogAdded={handleDogAdded}
        colors={colors}
      />
      <AddToiletTrip
        isVisible={isAddTripModalVisible}
        onClose={() => setIsAddTripModalVisible(false)}
        onAddTrip={handleAddTrip}
        dogs={dogs}
        colors={colors}
      />

      <EditDog
        isVisible={isEditDogModalVisible}
        onClose={() => setIsEditDogModalVisible(false)}
        onDogUpdated={(updatedDog) => {
          setDogs(dogs.map(dog => dog.$id === updatedDog.$id ? { ...updatedDog, isOwnedByUser: true } : dog));
          if (selectedDog && selectedDog.$id === updatedDog.$id) {
            setSelectedDog({ ...updatedDog, isOwnedByUser: true });
          }
        }}
        onDogDeleted={(deletedDogId) => {
          setDogs(dogs.filter(dog => dog.$id !== deletedDogId));
          if (selectedDog && selectedDog.$id === deletedDogId) {
            setSelectedDog(null);
          }
        }}
        dogId={selectedDogForEdit ? selectedDogForEdit.$id : null}
        isOwnedByUser={selectedDogForEdit ? selectedDogForEdit.isOwnedByUser : true}
        colors={colors}
      />

      <EditToiletTrip
        isVisible={isEditTripModalVisible}
        onClose={() => setIsEditTripModalVisible(false)}
        onSave={handleEditTrip}
        trip={selectedTrip}
        colors={colors}
      />

      <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
    </SafeAreaView>
  );
};

export default Home;