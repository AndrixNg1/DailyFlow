import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { storage } from './storage';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotifications = async () => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Push token:', token);

  await storage.setItem('pushToken', token.data);
  return token.data;
};

export const scheduleHabitNotification = async (
  habitId: string,
  title: string,
  emoji: string,
  reminderTime: string
) => {
  if (Platform.OS === 'web') return;

  try {
    await cancelHabitNotification(habitId);

    const [hour, minute] = reminderTime.split(':').map(Number);

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR, // ✅ requis
      hour,
      minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${title}`,
        body: "C'est l'heure de pratiquer votre habitude !",
        data: { habitId },
      },
      trigger,
      identifier: `habit_${habitId}`,
    });

    console.log(`Notification scheduled for habit: ${title} at ${reminderTime}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelHabitNotification = async (habitId: string) => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(`habit_${habitId}`);
    console.log(`Notification cancelled for habit: ${habitId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};
