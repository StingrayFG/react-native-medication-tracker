import * as Notifications from 'expo-notifications';

import { MedicationType } from '@/db/types';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


const notificationServices = {

  scheduleMedicationNotification: (medication: MedicationType, shouldBeTakenAt: Date) => {
    console.log('schedule notification', shouldBeTakenAt, new Date())
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication',
        body: `${medication.name} (${medication.dosage + medication.dosageUnit}) needs to be taken at ${shouldBeTakenAt
          .toLocaleString('en-GB', { hour: 'numeric', minute: 'numeric' })}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: shouldBeTakenAt,
      }
    });
  },
  
}


export default notificationServices;