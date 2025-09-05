import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { CustomButton } from '@/components/ui/CustomButton';
import { CustomSelector } from '@/components/ui/CustomSelector';
import { CustomTextInput } from '@/components/ui/CustomTextInput';
import { ThemedView } from '@/components/ui/ThemedView';
import { availableDosageUnits, availableFrequencies } from '@/constants/medicationConstants';
import { MedicationType } from '@/db/types';
import medicationServices from '@/services/medicationServices';

export default function EditorScreen() {

  const router = useRouter();

  const params = useLocalSearchParams<{ passed_medication_id: string }>();
  const passedMedicationId = params.passed_medication_id ? parseInt(params.passed_medication_id) : undefined;

  const emptyMedication: MedicationType = {
    name: '',
    alias: '',
    instructions: '',
    dosage: 0,
    dosageUnit: availableDosageUnits[0].label,
    startDate: new Date(),
    frequency: availableFrequencies[2].code,
    takenAt: Array.from(Array(1).keys())
    .map(i => new Date((new Date()).setHours(0,0,0,0)))
  };

  const [lastSavedMedication, setLastSavedMedication] = useState<MedicationType>(emptyMedication);
  const [editedMedication, setEditedMedication] = useState<MedicationType>(emptyMedication);
  const [canBeSaved, setCanBeSaved] = useState<boolean>(false);
  const [isEditingExistingMedication, setIsEditingExistingMedication] = useState<boolean>(passedMedicationId ? true : false);
  const [isEditingMedication, setIsEditingMedication] = useState<boolean>(!isEditingExistingMedication);

  useEffect(() => {
    (async () => {
      if (passedMedicationId) {
        try {
          const passedMedication = await medicationServices.getMedicationById(passedMedicationId);
          setEditedMedication(passedMedication);
          setLastSavedMedication(passedMedication);
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, [])
  
  useEffect(() => {
    if (
      editedMedication.name &&
      (editedMedication.dosage > 0) &&
      (JSON.stringify(editedMedication) !== JSON.stringify(lastSavedMedication))
    ) {
      setCanBeSaved(true);
    } else {
      setCanBeSaved(false);
    }
  }, [editedMedication, lastSavedMedication])


  // FORM HANDLING
  const [startDatePickerIsOpen, setStartDatePickerIsOpen] = useState<boolean>(false);
  const [takenAtPickerOpen, setTakenAtPickerOpen] = useState<Array<boolean>>([false, false, false]);

  const handleOnInputChange = (text: string, propertyName: string) => {
    setEditedMedication({...editedMedication, [propertyName]: text})
  }

  const openStartDatePicker = () => {
    setStartDatePickerIsOpen(true);
  }

  const closeStartDatePicker = () => {
    setStartDatePickerIsOpen(false);
  }

  const openTakenAtPicker = (index: number) => {
    const newTakenAtPickerOpen = [ ...takenAtPickerOpen ];
    newTakenAtPickerOpen[index] = true;
    setTakenAtPickerOpen(newTakenAtPickerOpen);
  }

  const closeTakenAtPicker = (index: number) => {
    const newTakenAtPickerOpen = [ ...takenAtPickerOpen ];
    newTakenAtPickerOpen[index] = false;
    setTakenAtPickerOpen(newTakenAtPickerOpen);
  }

  const handleOnDosageUnitSelection = (dosageUnit: { label: string, code: number}) => {
    setEditedMedication({ ...editedMedication, dosageUnit: dosageUnit.label })
  }

  const handleOnStartDateSelection = (event: DateTimePickerEvent, startDate: Date | undefined) => {
    if (startDate) {
      setEditedMedication({...editedMedication, startDate: new Date(startDate.setHours(0,0,0,0))})
    }
    closeStartDatePicker();
  }

  const handleOnFrequencySelection = (frequency: { label: string, code: number }) => {
    setEditedMedication({ 
      ...editedMedication,

      frequency: frequency.code,

      takenAt: [
        ...editedMedication.takenAt,
        ...Array.from(Array(3).keys())
        .map(i => new Date((new Date()).setHours(0,0,0,0)))
      ].slice(0, Math.max(1, frequency.code))
     })
  }

  const handleOnTakenAtSelection = (event: DateTimePickerEvent, takenAt: Date | undefined, takenAtIndex: number) => {
    if (takenAt) {
      let newTakenAt = [ ...editedMedication.takenAt ];
      newTakenAt[takenAtIndex] = takenAt;
      setEditedMedication({...editedMedication, takenAt: newTakenAt});
    }
    closeTakenAtPicker(takenAtIndex);
  }

  const handleOnSaveButtonPress = async () => {
    try {
      if (isEditingExistingMedication) {
        await medicationServices.updateMedication(editedMedication);
      } else {
        await medicationServices.createMedication(editedMedication);
      }

      setLastSavedMedication(editedMedication);
      setIsEditingMedication(false);
      setIsEditingExistingMedication(true);
    } catch (e) {
      console.log(e)
    }
  }  
  
  const handleOnCancelButtonPress = async () => {
    setIsEditingMedication(false);
  }

  const handleOnEditButtonPress = async () => {
    setIsEditingMedication(true);
  }

  const handleOnDeleteButtonPress = async () => {
    return Alert.alert(
      'Confirmation',
      'Are you certain you want to delete this medication?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            await medicationServices.deleteMedication(editedMedication);
            router.back();
          },
        },
        {
          text: 'No',
        },
      ]
    );
  }

  //
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Medication editor',
        headerRight: () => 
          isEditingMedication ? 
        <ThemedView style={{
          flexDirection: 'row-reverse',
          marginRight: -8,
        }}>
          {isEditingExistingMedication && 
            <CustomButton type={'icon'}
            onPress={handleOnCancelButtonPress}>
              <MaterialIcons name={'undo'} color={'#000'} size={28}/>
            </CustomButton>
          }

          <CustomButton type={'icon'}
          isEnabled={canBeSaved}
          onPress={handleOnSaveButtonPress}>
            <MaterialIcons name={'save'} color={'#000'} size={28}/>
          </CustomButton>

          {isEditingExistingMedication && 
            <CustomButton type={'icon'}
            onPress={handleOnDeleteButtonPress}>
              <MaterialIcons name={'delete-outline'} color={'#000'} size={28}/>
            </CustomButton>
          }
        </ThemedView>  
        :
        <ThemedView style={{
          flexDirection: 'row-reverse',
          marginRight: -8,
        }}>
          <CustomButton type={'icon'}
          onPress={handleOnEditButtonPress}>
            <MaterialIcons name={'edit'} color={'#000'} size={28}/>
          </CustomButton>
        </ThemedView>  
      }} />
      <ScrollView>

        <ThemedView style={{
          padding: 8,
          gap: 8,
        }}>

          <ThemedView type={'box'} style={{
            padding: 8,
            gap: 8,
          }}>
            <CustomTextInput
            isEnabled={isEditingMedication}
            header={'Name'}
            onChangeText={text => handleOnInputChange(text, 'name')}
            value={editedMedication.name}/>

            <CustomTextInput
            isEnabled={isEditingMedication}
            header={'Alias'}
            onChangeText={text => handleOnInputChange(text, 'alias')}
            value={editedMedication.alias}/>

            <ThemedView style={styles.gridBox}>
              <ThemedView style={styles.gridItem}>
                <CustomTextInput
                isEnabled={isEditingMedication}
                keyboardType='number-pad'
                header={'Dosage'}
                onChangeText={text => handleOnInputChange(text, 'dosage')}
                value={editedMedication.dosage.toString()}/>
              </ThemedView>
              <ThemedView style={styles.gridItem}>
                <CustomSelector
                isEnabled={isEditingMedication}
                header={'Dosage unit'}
                options={availableDosageUnits} 
                selectedOption={availableDosageUnits.filter(a => a.label === editedMedication.dosageUnit)[0]}
                onSelectOption={handleOnDosageUnitSelection} />
              </ThemedView>
            </ThemedView>

            <CustomTextInput
            isEnabled={isEditingMedication}
            header={'Instructions'}
            multiline={true}
            onChangeText={text => handleOnInputChange(text, 'instructions')}
            value={editedMedication.instructions}/>
          </ThemedView>

          <ThemedView type={'box'} style={{
            padding: 8,
            gap: 8,
          }}>
            <CustomTextInput
            isEnabled={isEditingMedication}
            onPress={openStartDatePicker}
            header={'Start date'}
            editable={false}
            value={editedMedication.startDate.toLocaleDateString('en-GB', 
            { year: 'numeric', month: 'long', day: 'numeric' })}/>

            <ThemedView style={{ 
              position: 'absolute' 
            }}>
              {startDatePickerIsOpen && 
                <DateTimePicker
                value={editedMedication.startDate}
                mode={'date'}
                onChange={handleOnStartDateSelection} />
              }
            </ThemedView>
            
            <CustomSelector
            isEnabled={isEditingMedication}
            header={'Frequency'}
            options={availableFrequencies}
            selectedOption={availableFrequencies.filter(a => a.code === editedMedication.frequency)[0]}
            onSelectOption={handleOnFrequencySelection} />

            <CustomTextInput
            isEnabled={isEditingMedication}
            onPress={() => openTakenAtPicker(0)}
            header={availableFrequencies.filter(a => a.code === editedMedication.frequency)[0].code >= 2 ? 
            'Taken at, #1' : 'Taken at'}
            editable={false}
            value={editedMedication.takenAt[0].toLocaleString('en-GB', 
            { hour: 'numeric', minute: 'numeric' })}/>

            {availableFrequencies.filter(a => a.code === editedMedication.frequency)[0].code >= 2 &&
              <CustomTextInput
              isEnabled={isEditingMedication}
              onPress={() => openTakenAtPicker(1)}
              header={'Taken at, #2'}
              editable={false}
              value={editedMedication.takenAt[1].toLocaleString('en-GB', 
              { hour: 'numeric', minute: 'numeric' })}/>
            }

            {availableFrequencies.filter(a => a.code === editedMedication.frequency)[0].code >= 3 &&
              <CustomTextInput
              isEnabled={isEditingMedication}
              onPress={() => openTakenAtPicker(2)}
              header={'Taken at, #3'}
              editable={false}
              value={editedMedication.takenAt[2].toLocaleString('en-GB', 
              { hour: 'numeric', minute: 'numeric' })}/>
            }

            {Array.from(Array(3).keys()).map(i => 
              <ThemedView key={'time-picker-' + i} 
              style={{ 
                position: 'absolute' 
              }}>
                {takenAtPickerOpen[i] && 
                  <DateTimePicker
                  value={editedMedication.takenAt[i]}
                  mode={'time'}
                  onChange={(event, date) => handleOnTakenAtSelection(event, date, i)}
                />
                } 
              </ThemedView>
            )}
          </ThemedView>

        </ThemedView>

      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  gridBox: {
    marginRight: -8,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  gridItem: {
    width: '50%',
    paddingRight: 8,
  },
});
