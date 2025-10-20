import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// --- iOS Permission Request ---
async function requestIOSPermissions() {
  try {
    const authStatus = await PushNotificationIOS.requestPermissions();
    console.log('iOS Notification permission:', authStatus);
  } catch (error) {
    console.warn('iOS permission request failed:', error);
  }
}

// --- Initialize Channels (Android only) ---
export function initializeNotificationService() {
  // Configure once at app start
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'check-reminders', // Must match the one in localNotificationSchedule
        channelName: 'Check Reminders',
        channelDescription: 'Reminders for upcoming checks',
        importance: 4, // High importance for heads-up notifications
        vibrate: true,
      },
      created => console.log(`Notification channel created: ${created}`),
    );
  }

  // Configure callbacks and behavior
  PushNotification.configure({
    onRegister: function (token) {
      console.log('Notification Token:', token);
    },
    onNotification: function (notification) {
      console.log('Notification Received:', notification);
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    requestPermissions: Platform.OS === 'ios',
  });
}

// --- Schedule Check Reminders ---
export async function scheduleCheckReminders(
  checkId: string,
  dueDate: string,
  title: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
): Promise<string | null> {
  if (Platform.OS === 'ios') {
    await requestIOSPermissions();
  }

  const due = new Date(dueDate);
  const now = new Date(new Date().toDateString());

  const reminders: Array<{ days: number; time: string; message: string }> = [];

  if (priority === 'high') {
    reminders.push(
      { days: 7, time: '09:00', message: 'is due in 7 days' },
      { days: 3, time: '09:00', message: 'is due in 3 days' },
      { days: 1, time: '09:00', message: 'is due tomorrow' },
      { days: 0, time: '08:00', message: 'is due today' },
    );
  } else if (priority === 'medium') {
    reminders.push(
      { days: 3, time: '09:00', message: 'is due in 3 days' },
      { days: 1, time: '09:00', message: 'is due tomorrow' },
      { days: 0, time: '08:00', message: 'is due today' },
    );
  } else {
    reminders.push(
      { days: 1, time: '09:00', message: 'is due tomorrow' },
      { days: 0, time: '08:00', message: 'is due today' },
    );
  }

  const scheduledIds: string[] = [];

  for (const reminder of reminders) {
    const reminderDate = new Date(due.toDateString());
    reminderDate.setDate(reminderDate.getDate() - reminder.days);
    const [hours, minutes] = reminder.time.split(':').map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate >= now) {
      const id = `${checkId}-${reminder.days}`;
      PushNotification.localNotificationSchedule({
        channelId: 'check-reminders',
        id,
        title: 'Check Reminder',
        message: `${title} ${reminder.message}`,
        date: reminderDate,
        allowWhileIdle: true,
        playSound: priority === 'high',
        soundName: 'default',
        vibrate: true,
        importance: 'high',
        userInfo: { checkId, type: 'check_reminder' },
      });

      scheduledIds.push(id);
    }
  }
  console.log('Scheduled reminders:', scheduledIds);
  return scheduledIds.length > 0 ? scheduledIds.join(',') : null;
}

export async function cancelNotifications(notificationId: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      if (Platform.OS === 'android') {
        // Android
        PushNotification.cancelLocalNotifications({ id: notificationId });
        resolve();
      } else {
        // iOS
        PushNotificationIOS.removeDeliveredNotifications([notificationId]);
        resolve();
      }
    } catch (error) {
      console.warn('Failed to cancel notification:', error);
      reject(error);
    }
  });
}
