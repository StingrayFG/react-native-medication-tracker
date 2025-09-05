import BackgroundService from 'react-native-background-actions';

import { MedicationHistoryType, MedicationType } from '@/db/types';
import medicationHistoryServices from '@/services/medicationHistoryServices';
import medicationServices from '@/services/medicationServices';
import notificationServices from '@/services/notificationServices';


const backgroundServices = { 

  startBackgroundService: async () => {
    const assignTimeToDate = (time: Date, date: Date) => {
      return new Date(
        date.getFullYear(), date.getMonth(), date.getDate(), 
        time.getHours(), time.getMinutes(), time.getSeconds()
      );
    }

    const getDifferenceInDaysForDates = (date1: Date, date2: Date) => {
      const dateDiff = ((new Date(date1)).setHours(0,0,0,0) - (new Date(date2)).setHours(0,0,0,0));
      const dateDiffDays = Math.floor(dateDiff / (86400 * 1000)); 
      return dateDiffDays;
    }

    const checkSchedule = async (checkPeriod: number) => {
      console.log('bg service schedule check', new Date())

      const currentDateAndTime = new Date();
      const currentDate = new Date((new Date()).setHours(0,0,0,0));
      const allMedications = await medicationServices.getAllMedications();

      const checkMedication = (medication: MedicationType, latestMedicationHistory: Array<MedicationHistoryType>) => {
        if (medication.frequency < 0) {
          let checkedDate;

          if (latestMedicationHistory.length > 0) {
            checkedDate = new Date(new Date(latestMedicationHistory[0].beenTakenAt).setHours(0,0,0,0) - 
            Math.abs(86400 * 1000 * medication.frequency));
          } else {
            const firstToCurrentDiffDays = getDifferenceInDaysForDates(currentDate, medication.startDate)
            const parsedFrequency = Math.abs(medication.frequency);
            const previousToStartDiffDays = Math.floor(firstToCurrentDiffDays / parsedFrequency) * parsedFrequency;
            checkedDate = new Date(new Date(medication.startDate).setHours(0,0,0,0) + (86400 * 1000 * previousToStartDiffDays));
          }

          if (checkedDate.getTime() < medication.startDate.getTime()) {
            checkedDate = new Date(medication.startDate);
          }

          while (getDifferenceInDaysForDates(checkedDate, new Date(currentDate.getTime() + (86400 * 1000))) <= 0) {
            const checkedToCurrentDiffDays = getDifferenceInDaysForDates(checkedDate, currentDate);

            if ((checkedToCurrentDiffDays === 0)) {
              const scheduleTakenAt = assignTimeToDate(medication.takenAt[0], checkedDate);
              const scheduleHasBeenTaken = 
              latestMedicationHistory.find(b => b.beenTakenAt.getTime() === scheduleTakenAt.getTime()) ? true : false;

              if (!scheduleHasBeenTaken && 
              ((scheduleTakenAt.getTime() - currentDateAndTime.getTime()) < checkPeriod) &&
              ((scheduleTakenAt.getTime() - currentDateAndTime.getTime()) > 0)) {
                notificationServices.scheduleMedicationNotification(medication, scheduleTakenAt)
              }
            }

            checkedDate = new Date(checkedDate.setHours(0,0,0,0) + Math.abs(86400 * 1000 * medication.frequency));
          }

        } else if (medication.frequency > 0) {
          for (const takenAt of medication.takenAt) {
            const scheduleTakenAt = assignTimeToDate(takenAt, currentDateAndTime);
            const scheduleHasBeenTaken = 
            latestMedicationHistory.find(b => b.beenTakenAt.getTime() === scheduleTakenAt.getTime()) ? true : false;

            if (!scheduleHasBeenTaken && 
            ((scheduleTakenAt.getTime() - currentDateAndTime.getTime()) < checkPeriod) &&
            ((scheduleTakenAt.getTime() - currentDateAndTime.getTime()) > 0)) {
              notificationServices.scheduleMedicationNotification(medication, scheduleTakenAt)
            }
          }  
        }
      }

      for (const medication of allMedications) { 
        let latestMedicationHistory: Array<MedicationHistoryType> = [];

        try {
          const usedCount = Math.max(1, medication.frequency);
          latestMedicationHistory = (await medicationHistoryServices.getLatestHistoryRecordsByMedicationId(medication.id!, usedCount));
        } catch (e) {
          //console.log(e);
        }

        checkMedication(medication, latestMedicationHistory);
      }
    }

    const options = {
      taskName: 'Examplee',
      taskTitle: 'Push service',
      taskDesc: '',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      parameters: {
        checkPeriod: 1000 * 60 * 60,
      },
    };

    const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

    const checkScheduleTask = async (taskDataArguments: any) => {
      await new Promise(async (reject, resolve) => {
        for (let i = 0; BackgroundService.isRunning(); i++) {
          checkSchedule(taskDataArguments.checkPeriod);
          await sleep(taskDataArguments.checkPeriod);
        }
      });
    }

    try {
      console.log('bg service start', new Date());
      await BackgroundService.stop();
      await BackgroundService.start(checkScheduleTask, options);
    } catch (e) {
      console.log('bg service error', e, new Date());
    }
  },
  
}


export default backgroundServices;
