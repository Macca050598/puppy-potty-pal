// notificationService.js
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
// Helper function to convert Date to a notification trigger format
const convertToNotificationTrigger = (date) => {
  const now = new Date();
  const secondsUntilTrigger = Math.max(0, Math.floor((date - now) / 1000));
  return {
    seconds: secondsUntilTrigger,
  };
};

export const scheduleNotification = async (alert) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const alertTime = new Date(alert.time);  // Custom alerts have a 'time' property
    const formattedTime = formatTime(alertTime);  // Format the time for display

    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title || "Reminder",
        body: alert.body || `${alert.title} at ${formattedTime}`,  // Use formatted time here
      },
      trigger: convertToNotificationTrigger(alertTime),  // Use the correct trigger
      identifier: `custom-${alert.id}`,  // Ensure custom alerts use a unique identifier
    });

    console.log(`Custom alert scheduled for ${alert.title} at ${formattedTime}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};


export const cancelNotification = async (alertId) => {
  await Notifications.cancelScheduledNotificationAsync(alertId);
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
