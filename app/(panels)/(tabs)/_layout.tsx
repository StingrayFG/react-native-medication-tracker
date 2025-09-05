import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { CustomButton } from '@/components/ui/CustomButton';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const router = useRouter();

  const tabInactiveColor = useThemeColor({}, 'tabIconInactive' )
  const tabActiveColor = useThemeColor({}, 'tabIconActive' )

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: tabInactiveColor,
        tabBarActiveTintColor: tabActiveColor,
        headerShown: true,
      }}>
      <Tabs.Screen
        name='schedule'
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <MaterialIcons name={'calendar-month'} color={color} size={28}/>,
          headerRight: () => <ThemedView style={{
            flexDirection: 'row-reverse',
            paddingRight: 8,
          }}>
            <CustomButton type={'icon'}
            onPress={() => router.navigate('/editor')}>
              <MaterialIcons name={'control-point'} color={'#000'} size={28}/>
            </CustomButton>
          </ThemedView>,
        }}
      />
      <Tabs.Screen
        name='medications'
        options={{
          title: 'Medications',
          tabBarIcon: ({ color }) => <MaterialIcons name={'medication'} color={color} size={28}/>,
          headerRight: () => <ThemedView style={{
            flexDirection: 'row-reverse',
            paddingRight: 8,
          }}>
            <CustomButton type={'icon'}
            onPress={() => router.navigate('/editor')}>
              <MaterialIcons name={'control-point'} color={'#000'} size={28}/>
            </CustomButton>
          </ThemedView>,
        }}
      />
    </Tabs>
  );
}