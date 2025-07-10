import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import { useGlobalContext } from '../../context/GlobalProvider';
import { getAllDogsCombinedEvents, getUserAndFamilyDogs } from '../../lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

const ExportFile = () => {
  const { colors } = useTheme();
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const exportData = async (format) => {
    if (!user?.$id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsLoading(true);
    try {
      // Get all dogs and their events
      const dogs = await getUserAndFamilyDogs(user.$id);
      const allEvents = await getAllDogsCombinedEvents(dogs.map(dog => dog.$id));
      
      let content;
      let title;

      switch (format) {
        case 'csv':
          content = convertToCSV(dogs, allEvents);
          title = 'Dog Data CSV';
          break;
        case 'json':
          content = JSON.stringify({ dogs, events: allEvents }, null, 2);
          title = 'Dog Data JSON';
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Share the content directly
      await Share.share({
        message: content,
        title: title
      });

      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToCSV = (dogs, events) => {
    // Create headers
    const headers = [
      'Dog Name',
      'Breed',
      'Date of Birth',
      'Weight',
      'Event Type',
      'Timestamp',
      'Details',
      'Notes'
    ].join(',');

    // Convert data to rows
    const rows = events.map(event => {
      const dog = dogs.find(d => d.$id === event.dogId);
      return [
        dog?.name || 'Unknown',
        dog?.breed || 'Unknown',
        dog?.dob || 'Unknown',
        dog?.weight || 'Unknown',
        event.type,
        event.timestamp,
        event.details || '',
        event.notes || ''
      ].join(',');
    });

    // Combine headers and rows
    return [headers, ...rows].join('\n');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Export Data</Text>
        <Text style={[styles.subtitle, { color: colors.tint }]}>
          Choose a format to export your dog's data
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={() => exportData('csv')}
            disabled={isLoading}
          >
            <Ionicons name="document-text" size={24} color={colors.accent} />
            <Text style={[styles.buttonText, { color: colors.accent }]}>Export as CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={() => exportData('json')}
            disabled={isLoading}
          >
            <Ionicons name="code" size={24} color={colors.accent} />
            <Text style={[styles.buttonText, { color: colors.accent }]}>Export as JSON</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Preparing export...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ExportFile;
