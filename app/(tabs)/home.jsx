import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserAndFamilyDogs, getAllDogsCombinedEvents, addToiletEvent, addEatingEvent, updateToiletEvent, handleDogAdded } from '../../lib/appwrite';
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
import ChoiceModal from '../../components/AddChoiceModel';
import AddEatingTrip from '../../components/AddEatingTrip';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDogModalVisible, setIsAddDogModalVisible] = useState(false);
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [isAddEatingModalVisible, setIsAddEatingModalVisible] = useState(false);
  const [isEditDogModalVisible, setIsEditDogModalVisible] = useState(false);
  const [selectedDogForEdit, setSelectedDogForEdit] = useState();
  const [isEditTripModalVisible, setIsEditTripModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const useFetchData = () => {
    const fetchDogsAndEvents = useCallback(async () => {
      const userId = user?.$id;
      const dogId = selectedDog?.$id;
      
      if (!userId) return;
      
      try {
        const [allDogs, events] = await Promise.all([
          getUserAndFamilyDogs(userId),
          dogId ? getAllDogsCombinedEvents([dogId]) : []
        ]);

        setDogs(allDogs);
        if (allDogs.length > 0 && !selectedDog) {
          setSelectedDog(allDogs[0]);
        }
        setEvents(events);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, [user?.$id, selectedDog?.$id]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchDogsAndEvents();
      setRefreshing(false);
    }, [fetchDogsAndEvents]);

    return { fetchDogsAndEvents, onRefresh };
  };

  const { fetchDogsAndEvents, onRefresh } = useFetchData();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchDogsAndEvents();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.$id, selectedDog?.$id]);

  const handleDogSelection = async (dog) => {
    setSelectedDog(dog);
    try {
      const events = await getAllDogsCombinedEvents([dog.$id]);
      setEvents(events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleEventAction = {
    addTrip: async (dogId, type, location, timestamp) => {
      try {
        const newEvent = await addToiletEvent(dogId, type, location, timestamp);
        setEvents(prev => [...prev, newEvent].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ));
      } catch (error) {
        console.error('Failed to save toilet event:', error);
      }
    },

    addEating: async (dogId, type, timestamp) => {
      try {
        const newEvent = await addEatingEvent(dogId, type, timestamp);
        setEvents(prev => [...prev, newEvent].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ));
      } catch (error) {
        console.error('Failed to save eating event:', error);
      }
    },

    editTrip: async (updatedTrip) => {
      try {
        await updateToiletEvent(updatedTrip.$id, updatedTrip);
        fetchDogsAndEvents();
      } catch (error) {
        console.error('Failed to update event:', error);
      }
    }
  };

  const modalActions = {
    openChoiceModal: () => setIsChoiceModalVisible(true),
    closeChoiceModal: () => setIsChoiceModalVisible(false),
    openToiletModal: () => {
      setIsChoiceModalVisible(false);
      setIsAddTripModalVisible(true);
    },
    openEatingModal: () => {
      setIsChoiceModalVisible(false);
      setIsAddEatingModalVisible(true);
    }
  };

  const SummaryItem = ({ icon, label, count }) => (
    <View style={styles.summaryItem}>
      <Feather name={icon} size={24} color={colors.primary} />
      <Text style={styles.summaryText}>{count} {label}</Text>
    </View>
  );

  const EventCard = ({ event }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => {
        setSelectedTrip(event);
        const isToiletEvent = event.hasOwnProperty('location');
        setIsEditTripModalVisible(isToiletEvent);
        setIsAddEatingModalVisible(!isToiletEvent);
      }}
    >
      <Text style={styles.eventText}>
        {event.hasOwnProperty('location') 
          ? `${event.type} - ${event.location}`
          : `Eating - ${event.type}`}
      </Text>
      <Text style={styles.eventTime}>
        {new Date(event.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
      <Text style={styles.eventTime}>{user.username}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    const today = new Date().toDateString();
    const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today);

    const toiletEvents = todayEvents.filter(e => e.hasOwnProperty('location'));
    const eatingEvents = todayEvents.filter(e => !e.hasOwnProperty('location'));

    const peeCount = toiletEvents.filter(e => e.type === 'wee').length;
    const pooCount = toiletEvents.filter(e => e.type === 'poo').length;
    const accident = toiletEvents.filter(e => 
      e.type.toLowerCase() === 'inside' || 
      e.type.toLowerCase() === 'outside' || 
      (e.location && e.location.toLowerCase().includes('inside'))
    ).length;
    const mealCount = eatingEvents.filter(e => e.type === 'meal').length;
    const snackCount = eatingEvents.filter(e => e.type === 'snack').length;

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
            <SummaryItem icon="droplet" label="Pee" count={peeCount} />
            <SummaryItem icon="target" label="Poo" count={pooCount} />
            <SummaryItem icon="alert-circle" label="Accidents" count={accident} />
          </View>
        </View>

        <FlatList
          horizontal
          data={dogs}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDogSelection(item)}
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
          <EventCard key={event.$id} event={event} />
        ))}
      </View>
    );
  };

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

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <FlatList
            data={groupEventsByDay(events)}
            renderItem={renderEventGroup}
            keyExtractor={(item) => item[0]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No events recorded for this dog yet.
              </Text>
            }
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.tint}
              />
            }
          />

          <View style={styles.predictionContainer}>
            <NextTripPrediction 
              selectedDog={selectedDog} 
              colors={colors.primary}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={modalActions.openChoiceModal}
          >
            <Feather name="plus" size={30} color={colors.background} />
          </TouchableOpacity>

          <AddNewDog
            isVisible={isAddDogModalVisible}
            onClose={() => setIsAddDogModalVisible(false)}
            onDogAdded={async (newDog) => {
              try {
                await fetchDogsAndEvents();
                setIsAddDogModalVisible(false);
              } catch (error) {
                console.error('Error handling new dog:', error);
              }
            }}
            colors={colors}
          />
          
          <AddToiletTrip
            isVisible={isAddTripModalVisible}
            onClose={() => setIsAddTripModalVisible(false)}
            onAddTrip={handleEventAction.addTrip}
            dogs={dogs}
            colors={colors}
          />

          <AddEatingTrip
            isVisible={isAddEatingModalVisible}
            onClose={() => setIsAddEatingModalVisible(false)}
            onAddEatingTrip={handleEventAction.addEating}
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
            onSave={handleEventAction.editTrip}
            trip={selectedTrip}
            colors={colors}
          />

          <ChoiceModal
            isVisible={isChoiceModalVisible}
            onClose={() => setIsChoiceModalVisible(false)}
            onChooseToilet={modalActions.openToiletModal}
            onChooseEating={modalActions.openEatingModal}
            colors={colors}
          />

          <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
        </>
      )}
    </SafeAreaView>
  );
};

export default Home;
