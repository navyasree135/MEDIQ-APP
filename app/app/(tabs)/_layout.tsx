import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1d6d5b" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'sparkles' : 'sparkles-outline'} color={color} />
          ),
          headerTitle: '',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: (user?.role === 'patient' || !user) ? '/(tabs)/chat' : null,
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} />
          ),
          headerTitle: 'AI Triage Chat',
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
          headerTitle: 'Appointments',
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
          headerTitle: 'Account',
        }}
      />
    </Tabs>
  );
}
