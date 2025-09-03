import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Error' }} />
      <ThemedView style={{
        padding: 12,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        <ThemedText 
        type='title' 
        style={{textAlign: 'center'}}>
          This screen does not exist
        </ThemedText>

        <Link href='/(panels)/(tabs)/schedule' style={{
          marginTop: 12,
          paddingVertical: 12,
        }}>
          <ThemedText type='link'>Go to home screen</ThemedText>
        </Link>

      </ThemedView >
    </>
  );
} 

