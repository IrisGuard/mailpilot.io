import React from 'react';
import { Tabs } from 'expo-router';
import { Mail, Users, History, Settings, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/constants/i18n';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.subtext,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
        },
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.light.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => <Mail size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: t('templates'),
          tabBarLabel: t('templates'),
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: t('contacts'),
          tabBarLabel: t('contacts'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('history'),
          tabBarLabel: t('history'),
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}