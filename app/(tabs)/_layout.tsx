import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { COLORS } from '../../lib/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'monospace',
          letterSpacing: 1,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: focused ? COLORS.text : COLORS.textMuted, fontWeight: '700' }}>
              [~]
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'COURSES',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: focused ? COLORS.text : COLORS.textMuted, fontWeight: '700' }}>
              [{}]
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'RANKS',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: focused ? COLORS.text : COLORS.textMuted, fontWeight: '700' }}>
              [##]
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: focused ? COLORS.text : COLORS.textMuted, fontWeight: '700' }}>
              [@]
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
