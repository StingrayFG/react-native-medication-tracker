import { Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { MedicationElement } from '@/components/elements/MedicationElement';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MedicationType } from '@/db/types';
import medicationServices from '@/services/medicationServices';


export default function MedicationsScreen() {
  
  const path = usePathname();

  const [medications, setMedications] = useState<Array<MedicationType>>([]);

  useEffect(() => {
    (async () => {
      const allMedications = await medicationServices.getAllMedications();

      setMedications(allMedications);
    })();
  }, [path])
  
  return (
    <>
      <Stack.Screen options={{ title: 'Medications' }} />
      <ScrollView>

        <ThemedView style={{
          gap: 8,
          padding: 8,
        }}>
          {medications.map((medication, index) => 
            <MedicationElement key={'medication-' + index} medication={medication}/>
          )}

          {medications.length === 0 && 
            <ThemedText type={'subtitle'}
            style={{
              textAlign: 'center',
              marginTop: 8,
            }}>
              Nothing here yet
            </ThemedText>
          }
        </ThemedView>

      </ScrollView>
    </>
  );
}
