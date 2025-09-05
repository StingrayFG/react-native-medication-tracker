import { Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { ScheduleDayElement } from '@/components/elements/ScheduleDayElement';
import { ThemedView } from '@/components/ui/ThemedView';
import { scheduleShownDaysCount } from '@/constants/medicationConstants';
import { MedicationHistoryType, MedicationType, ScheduleDayType, ScheduleMedicationType } from '@/db/types';
import medicationHistoryServices from '@/services/medicationHistoryServices';
import medicationServices from '@/services/medicationServices';


export default function ScheduleScreen() {
  
  const path = usePathname();

  const [scheduleByDay, setScheduleByDay] = useState<Array<ScheduleDayType>>([]);

  const getDifferenceInDaysForDates = (date1: Date, date2: Date) => {
    const dateDiff = ((new Date(date1)).setHours(0,0,0,0) - (new Date(date2)).setHours(0,0,0,0));
    const dateDiffDays = Math.floor(dateDiff / (86400 * 1000)); 
    return dateDiffDays;
  }

  const assignTimeToDate = (time: Date, date: Date) => {
    return new Date(
      date.getFullYear(), date.getMonth(), date.getDate(), 
      time.getHours(), time.getMinutes(), time.getSeconds()
    );
  }

  useEffect(() => {
    (async () => {
      const shownDaysCount = scheduleShownDaysCount;
      const firstShownDate = new Date((new Date()).setHours(0,0,0,0) - (86400 * 1000)); // the schedule starts from yesterday
      const lastShownDate = new Date(firstShownDate.setHours(0,0,0,0) + (86400 * 1000 * (shownDaysCount)));

      const allMedications = await medicationServices.getAllMedications();
      
      let scheduleByDay: Array<ScheduleDayType> = Array.from(Array(shownDaysCount + 1).keys())
      .map(i => ({
        date: new Date(firstShownDate.setHours(0,0,0,0) + (86400 * 1000 * i)),
        medications: new Array<ScheduleMedicationType>(),
      }))

      const sortScheduleByDay = () => {
        let sortedScheduleByDay = [ ...scheduleByDay ];

        for (let day of sortedScheduleByDay) {
          day.medications = day.medications.sort((a, b) => 
            a.takenAt.getTime() - b.takenAt.getTime()
          );
        }    

        scheduleByDay = sortedScheduleByDay;
      }

      const addMedicationToSchedule = (medication: MedicationType, latestMedicationHistory: Array<MedicationHistoryType>) => {
        if (medication.frequency < 0) {
          let checkedDate;

          if (latestMedicationHistory.length > 0) {
            checkedDate = new Date(new Date(latestMedicationHistory[0].beenTakenAt).setHours(0,0,0,0) - 
            Math.abs(86400 * 1000 * medication.frequency));
          } else {
            const firstToStartDiffDays = getDifferenceInDaysForDates(firstShownDate, medication.startDate)
            const parsedFrequency = Math.abs(medication.frequency);
            const previousToStartDiffDays = Math.floor(firstToStartDiffDays / parsedFrequency) * parsedFrequency;
            checkedDate = new Date(new Date(medication.startDate).setHours(0,0,0,0) + (86400 * 1000 * previousToStartDiffDays));
          }

          if (checkedDate.getTime() < medication.startDate.getTime()) {
            checkedDate = new Date(medication.startDate);
          }
          
          while (getDifferenceInDaysForDates(checkedDate, lastShownDate) <= 0) {
            const checkedToFirstDiffDays = getDifferenceInDaysForDates(checkedDate, firstShownDate);
        
            if ((checkedToFirstDiffDays <= 1) && (checkedToFirstDiffDays >= 0)) {
              const scheduleTakenAt = assignTimeToDate(medication.takenAt[0], checkedDate);
              const scheduleHasBeenTaken = 
              latestMedicationHistory.find(b => b.beenTakenAt.getTime() === scheduleTakenAt.getTime()) ? true : false;

              scheduleByDay[checkedToFirstDiffDays].medications.push({
                ...medication,
                takenAt: assignTimeToDate(medication.takenAt[0], checkedDate),
                hasBeenTaken: scheduleHasBeenTaken
              })
            } else if ((checkedToFirstDiffDays > 0) && (checkedToFirstDiffDays < (shownDaysCount + 1))) {
              scheduleByDay[checkedToFirstDiffDays].medications.push({
                ...medication,
                takenAt: assignTimeToDate(medication.takenAt[0], checkedDate),
                hasBeenTaken: false,
              })   
            }

            checkedDate = new Date(checkedDate.setHours(0,0,0,0) + Math.abs(86400 * 1000 * medication.frequency));
          }

        } else if (medication.frequency > 0) {
          for (let day of scheduleByDay) {
            for (const takenAt of medication.takenAt) {
              const scheduleTakenAt = assignTimeToDate(takenAt, day.date);
              const scheduleHasBeenTaken = 
              latestMedicationHistory.find(b => b.beenTakenAt.getTime() === scheduleTakenAt.getTime()) ? true : false;

              day.medications.push({
                ...medication,
                takenAt: scheduleTakenAt,
                hasBeenTaken: scheduleHasBeenTaken,
              })
            }
          }    
        }
      }

      const assembleScheduleByDay = async () => {
        for (const medication of allMedications) { 
          let latestMedicationHistory: Array<MedicationHistoryType> = [];

          try {
            const usedCount = Math.max(1, medication.frequency * 2); // take twice the records to get the data for the yesterday
            latestMedicationHistory = (await medicationHistoryServices.getLatestHistoryRecordsByMedicationId(medication.id!, usedCount));
          } catch (e) {
            //console.log(e);
          }

          addMedicationToSchedule(medication, latestMedicationHistory);
        }

        sortScheduleByDay();
      }

      await assembleScheduleByDay();
      setScheduleByDay(scheduleByDay);
    })();
  }, [path])

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Schedule', 
        headerBackVisible: false, 
      }} />

      <ScrollView>

        <ThemedView style={{
          gap: 8,
          padding: 8,
        }}>
          {scheduleByDay.map((day, index) => 
            <ScheduleDayElement day={day} key={'day-' + day.date.getTime()} />
          )}
        </ThemedView>

      </ScrollView>
    </>
  );
}
