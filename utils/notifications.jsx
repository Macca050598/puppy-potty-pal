import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export const scheduleNotification = async (dogId, predictedTime) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Notification permissions are required to set reminders.');
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(`dog-${dogId}`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a Toilet Trip",
      body: `${dogId} might need to go out soon!`,
    },
    trigger: predictedTime,
    identifier: `dog-${dogId}`,
  });

  console.log(`Notification scheduled for ${predictedTime}`);
};