import Checkbox from 'expo-checkbox';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ScheduleDayType, ScheduleMedicationType } from '@/db/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import medicationHistoryServices from '@/services/medicationHistoryServices';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';


export type EditorProps =  {
  day: ScheduleDayType
};

export function ScheduleDayElement ({ day }: EditorProps) {

  const backgroundColor = useThemeColor({}, 'box');
  const checkboxInactiveColor = useThemeColor({}, 'checkboxInactive');
  const checkboxActiveColor = useThemeColor({}, 'checkboxActive');

  const [usedDay, setUsedDay] = useState<ScheduleDayType>(day);

  useEffect(() => {
    setUsedDay(day);
  }, [day])

  const getDifferenceInDaysForDates = (date1: Date, date2: Date) => {
    const dateDiff = ((new Date(date1)).setHours(0,0,0,0) - (new Date(date2)).setHours(0,0,0,0));
    const dateDiffDays = Math.floor(dateDiff / (86400 * 1000)); 
    return dateDiffDays;
  }

  const getParsedDate = () => {
    const diffDays = getDifferenceInDaysForDates(usedDay.date, new Date());

    if (diffDays === -1) {
      return 'Yesterday, ' + usedDay.date.toLocaleDateString('en-GB', 
        { year: 'numeric', month: 'long', day: 'numeric' })
    } else if (diffDays === 0) {
      return 'Today, ' + usedDay.date.toLocaleDateString('en-GB', 
        { year: 'numeric', month: 'long', day: 'numeric' })
    } else if (diffDays === 1) {
      return 'Tomorrow, ' + usedDay.date.toLocaleDateString('en-GB', 
        { year: 'numeric', month: 'long', day: 'numeric' })
    } else {
      return usedDay.date.toLocaleDateString('en-GB', 
        { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    }
  }

  const getCheckbox = (medication: ScheduleMedicationType) => {
    const currentDate = new Date((new Date()).setHours(0,0,0,0));
    const diffDays = getDifferenceInDaysForDates(usedDay.date, currentDate);
    
    if (diffDays === -1) {
      if (medication.hasBeenTaken) {
        return <MaterialIcons name={'check-box'} color={checkboxInactiveColor} size={28} style={{
          marginTop: -4,
          marginLeft: -4,
          marginRight: -4,
        }}/>
      } else {
        return <MaterialIcons name={'disabled-by-default'} color={checkboxInactiveColor} size={28} style={{
          marginTop: -4,
          marginLeft: -4,
          marginRight: -4,
        }}/>
      }
    } else if (diffDays === 0) {
      return <Checkbox
      value={medication.hasBeenTaken}
      onValueChange={(event) => handleOnCheckboxPress(event, medication)} 
      color={checkboxActiveColor} />
    }
  }

  const handleOnCheckboxPress = (event: boolean, medication: ScheduleMedicationType) => {
    try {
      if (medication.hasBeenTaken) {
        medicationHistoryServices.deleteHistoryRecord(medication);
      } else {
        medicationHistoryServices.createHistoryRecord(medication);
      }
  
      let newMedications = [ ...usedDay.medications ];
      newMedications[newMedications.findIndex(m => m.id === medication.id)].hasBeenTaken = !medication.hasBeenTaken;
      setUsedDay({
        ...usedDay,
        medications: newMedications
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <ThemedView style={{
      padding: 8,
      backgroundColor: backgroundColor,
    }}>

      <ThemedText type={'defaultSemiBold'}>
        {getParsedDate()}
      </ThemedText>
      
      <ThemedView style={{
        marginTop: 8
      }}>
        {usedDay.medications.map((medication, index) => 
          <ThemedView key={'day-' + day.date.getTime() + '-medication-' + index}
          style={{
            flex: 1,
            flexDirection: 'row',
            gap: 8,
          }}>
            {getCheckbox(medication)}

            <ThemedText>
              <ThemedText>
                { medication.takenAt.toLocaleString('en-GB', 
                { hour: 'numeric', minute: 'numeric' }) }
              </ThemedText>

              <ThemedText>
                { ' - ' +
                medication.dosage + ' ' + 
                medication.dosageUnit}
              </ThemedText>

              <ThemedText type={'defaultSemiBold'}>
                { ' - ' + medication.name }
              </ThemedText>
            </ThemedText>

          </ThemedView>
        )}

        {day.medications.length === 0 && 
          <ThemedText type={'defaultItalic'}>
            No medications for this day
          </ThemedText>
        }
      </ThemedView>
      
    </ThemedView>
  )
}
