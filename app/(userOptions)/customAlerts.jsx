import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../config/theme';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import EditAlertModal from '../../components/EditAlertModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotification, cancelNotification, requestNotificationPermissions } from '../../utils/notificationService';
import { createAlerts, updateAlert, deleteAlert, getAlerts } from '../../lib/appwrite';

const AlertItem = ({ alert, onToggle, onDelete }) => {
  const { colors } = useTheme();
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.alertItem, { backgroundColor: colors.background }]}>
      <View style={styles.alertInfo}>
        <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
        <Text style={[styles.alertTime, { color: colors.text }]}>{formatTime(alert.time)}</Text>
      </View>
      <Switch
        value={alert.isEnabled}
        onValueChange={() => onToggle(alert.id)}
        trackColor={{ false: colors.accent, true: colors.primary }}
      />
      <TouchableOpacity onPress={() => onDelete(alert.$id)}>
        <Feather name="trash-2" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const CustomAlerts = () => {
  const { colors } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [weePredictionEnabled, setWeePredictionEnabled] = useState(true);
  const [pooPredictionEnabled, setPooPredictionEnabled] = useState(true);
  const [alertData, setAlertData] = useState({
    title: '',
    date: new Date(),
    time: new Date(),
  });

  useEffect(() => {
    loadAlerts();
    loadPredictionSettings();
    requestNotificationPermissions();
  }, []);

  const loadAlerts = async () => {
    try {
      const alerts = await getAlerts();
      setAlerts(alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const addNewAlerts = async () => {
  
      try {
        const newAlert = await createAlerts(
          alertData.title,
          alertData.date,
          alertData.time
        )
        return newAlert;
      } catch (error) {
        console.log("Adding new alert error:", error)
      }

 
    return newAlert;
  }

  // const saveAlerts = async (newAlerts) => {
  //   try {
  //     await AsyncStorage.setItem('customAlerts', JSON.stringify(newAlerts));
  //   } catch (error) {
  //     console.error('Error saving alerts:', error);
  //   }
  // };

  const loadPredictionSettings = async () => {
    try {
      const weeEnabled = await AsyncStorage.getItem('weePredictionEnabled');
      const pooEnabled = await AsyncStorage.getItem('pooPredictionEnabled');
      setWeePredictionEnabled(weeEnabled !== 'false');
      setPooPredictionEnabled(pooEnabled !== 'false');
    } catch (error) {
      console.error('Error loading prediction settings:', error);
    }
  };

  const savePredictionSettings = async (weeEnabled, pooEnabled) => {
    try {
      await AsyncStorage.setItem('weePredictionEnabled', weeEnabled.toString());
      await AsyncStorage.setItem('pooPredictionEnabled', pooEnabled.toString());
      console.log('Prediction settings saved:', { weeEnabled, pooEnabled }); // Add this log
    } catch (error) {
      console.error('Error saving prediction settings:', error);
    }
  };

  const handleToggle = async (id) => {
    const newAlerts = alerts.map(alert => {
      if (alert.id === id) {
        const updatedAlert = { ...alert, isEnabled: !alert.isEnabled };
        if (updatedAlert.isEnabled) {
          scheduleNotification(updatedAlert);
        } else {
          cancelNotification(`custom-${alert.id}`);  // Use a unique identifier for custom alerts
        }
        return updatedAlert;
      }
      return alert;
    });
    setAlerts(newAlerts);
    await addNewAlerts();
  };
  
  const handleSaveAlert = async (alert) => {
    try {
      console.log('Alert being saved:', alert);
      const dateTime = new Date(alert.time);
      
      if (dateTime <= new Date()) {
        Alert.alert('Invalid Time', 'Please select a future time for the alert');
        return;
      }

      if (selectedAlert) {
        await handleUpdateAlert({
          ...alert,
          $id: selectedAlert.$id
        });
      } else {
        const newAlert = await createAlerts(
          alert.title,
          dateTime,
          dateTime
        );
        setAlerts(prev => [...prev, newAlert]);
      }

      if (alert.isEnabled) {
        await scheduleNotification(alert);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving alert:', error);
      Alert.alert('Error', 'Failed to save alert');
    }
  };
  
  const handleDeleteAlert = async (alertId) => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteAlert(alertId);
              setAlerts(prev => prev.filter(alert => alert.$id !== alertId));
              await cancelNotification(`custom-${alertId}`);
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Error', 'Failed to delete alert');
            }
          }
        }
      ]
    );
  };
  

  const handleAddAlert = () => {
    setSelectedAlert(null);
    setIsModalVisible(true);
  };

  const toggleWeePrediction = () => {
    const newValue = !weePredictionEnabled;
    setWeePredictionEnabled(newValue);
    savePredictionSettings(newValue, pooPredictionEnabled);
  };

  const togglePooPrediction = () => {
    const newValue = !pooPredictionEnabled;
    setPooPredictionEnabled(newValue);
    savePredictionSettings(weePredictionEnabled, newValue);
  };

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={alerts}
          renderItem={({ item }) => (
            <AlertItem
              alert={item}
              onToggle={handleToggle}
              onDelete={handleDeleteAlert}
            />
          )}
          keyExtractor={item => item.$id || item.id}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={[styles.headerText, { color: colors.text }]}>Custom Alerts</Text>
                <TouchableOpacity 
                  onPress={handleAddAlert} 
                  style={styles.addButton}
                >
                  <Feather name="plus" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.predictionSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Prediction Alerts</Text>
                <View style={styles.predictionItem}>
                  <Text style={[styles.predictionText, { color: colors.text }]}>Wee Prediction Alerts</Text>
                  <Switch
                    value={weePredictionEnabled}
                    onValueChange={toggleWeePrediction}
                    trackColor={{ false: colors.accent, true: colors.primary }}
                  />
                </View>
                <View style={styles.predictionItem}>
                  <Text style={[styles.predictionText, { color: colors.text }]}>Poo Prediction Alerts</Text>
                  <Switch
                    value={pooPredictionEnabled}
                    onValueChange={togglePooPrediction}
                    trackColor={{ false: colors.accent, true: colors.primary }}
                  />
                </View>
              </View>
            </>
          }
        />
        
        {isModalVisible && (
          <EditAlertModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSave={handleSaveAlert}
            initialAlert={selectedAlert}
          />
        )}
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 10,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: 14,
  },
  predictionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  predictionText: {
    fontSize: 16,
  },
});

export default CustomAlerts;