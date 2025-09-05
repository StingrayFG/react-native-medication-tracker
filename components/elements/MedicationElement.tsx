
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { availableFrequencies } from '@/constants/medicationConstants';
import { MedicationType } from '@/db/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { Pressable } from 'react-native';


export type EditorProps =  {
  medication: MedicationType
};

export function MedicationElement({ medication }: EditorProps) {

  const backgroundColor = useThemeColor({}, 'box');
  const parsedTakenAt = medication.takenAt
  .map(t => t.toLocaleString('en-GB', { hour: 'numeric', minute: 'numeric' }))
  .join(', ') +
  ' - ' + 
  availableFrequencies
  .find(a => a.code === medication.frequency)?.label
  .toLowerCase();

  const handleOnPress = () => {
    router.push(`/(panels)/editor?passed_medication_id=${medication.id}`)
  }

  return (
    <Pressable onPress={handleOnPress}>
      <ThemedView style={{
        padding: 4,
        backgroundColor: backgroundColor,
      }}>

        <ThemedText>
          <ThemedText type={'defaultSemiBold'}>
            {medication.name}
          </ThemedText>
          <ThemedText>
            {medication.alias ? (' - ' + medication.alias) : ''}
          </ThemedText>
        </ThemedText>

        {medication.instructions &&
          <ThemedText>
            {medication.instructions}
          </ThemedText>
        }

        <ThemedText>
          <ThemedText type={'defaultSemiBold'}>
            {medication.dosage + ' ' + 
            medication.dosageUnit}
          </ThemedText>
          <ThemedText>
            {' - ' + parsedTakenAt}
          </ThemedText>
        </ThemedText>

      </ThemedView>
    </Pressable>
  )
}
