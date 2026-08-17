import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminClassesScreen from '../screens/Admin/AdminClassesScreen';
import AdminSubjectsScreen from '../screens/Admin/AdminSubjectsScreen';
import AdminRoomsScreen from '../screens/Admin/AdminRoomsScreen';
import AdminNetworksScreen from '../screens/Admin/AdminNetworksScreen';
import AdminProfileScreen from '../screens/Admin/AdminProfileScreen';
import AppIcon from '../components/Icon/AppIcon';

export type AdminTabParamList = {
  AdminDashboardTab: undefined;
  AdminUsersTab: undefined;
  AdminClassesTab: undefined;
  AdminSubjectsTab: undefined;
  AdminRoomsTab: undefined;
  AdminNetworksTab: undefined;
  AdminSettingsTab: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 6;
  const tabBarHeight = 54 + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="AdminDashboardTab"
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }: { color: string; size: number; focused: boolean }) => {
          let iconName = 'grid-outline';

          if (route.name === 'AdminDashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'AdminUsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminClassesTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'AdminSubjectsTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'AdminRoomsTab') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'AdminNetworksTab') {
            iconName = focused ? 'wifi' : 'wifi-outline';
          } else if (route.name === 'AdminSettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <View style={focused ? styles.activeIconContainer : null}>
              <AppIcon name={iconName} size={18} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="AdminUsersTab"
        component={AdminUsersScreen}
        options={{ tabBarLabel: 'Users' }}
      />
      <Tab.Screen
        name="AdminClassesTab"
        component={AdminClassesScreen}
        options={{ tabBarLabel: 'Classes' }}
      />
      <Tab.Screen
        name="AdminSubjectsTab"
        component={AdminSubjectsScreen}
        options={{ tabBarLabel: 'Subjects' }}
      />
      <Tab.Screen
        name="AdminRoomsTab"
        component={AdminRoomsScreen}
        options={{ tabBarLabel: 'Rooms' }}
      />
      <Tab.Screen
        name="AdminNetworksTab"
        component={AdminNetworksScreen}
        options={{ tabBarLabel: 'Networks' }}
      />
      <Tab.Screen
        name="AdminSettingsTab"
        component={AdminProfileScreen}
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
    fontSize: 10,
    fontWeight: '600',
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
});

export default AdminTabNavigator;
