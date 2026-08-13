import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LecturerDashboard from '../screens/Dashboard/LecturerDashboard';
import ClassesStackNavigator from './ClassesStackNavigator';
import StudentsScreen from '../screens/Students/StudentsScreen';
import DisputesScreen from '../screens/Disputes/DisputesScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AppIcon from '../components/Icon/AppIcon';

export type LecturerTabParamList = {
  DashboardTab: undefined;
  ClassesTab: undefined;
  StudentsTab: undefined;
  DisputesTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<LecturerTabParamList>();

const LecturerTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'grid-outline';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ClassesTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'StudentsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'DisputesTab') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <View style={focused ? styles.activeIconContainer : null}>
              <AppIcon name={iconName} size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={LecturerDashboard}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="ClassesTab"
        component={ClassesStackNavigator}
        options={{ tabBarLabel: 'Classes' }}
      />
      <Tab.Screen
        name="StudentsTab"
        component={StudentsScreen}
        options={{ tabBarLabel: 'Students' }}
      />
      <Tab.Screen
        name="DisputesTab"
        component={DisputesScreen}
        options={{ tabBarLabel: 'Disputes' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
});

export default LecturerTabNavigator;
