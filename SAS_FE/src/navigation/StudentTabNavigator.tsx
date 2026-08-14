import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StudentDashboardScreen from '../screens/Student/StudentDashboardScreen';
import StudentHistoryScreen from '../screens/Student/StudentHistoryScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';
import AppIcon from '../components/Icon/AppIcon';

export type StudentTabParamList = {
  StudentDashboardTab: undefined;
  StudentHistoryTab: undefined;
  StudentProfileTab: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

const StudentTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="StudentDashboardTab"
      screenOptions={({ route }: { route: any }) => ({
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
        tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
          let iconName = 'grid-outline';

          if (route.name === 'StudentDashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'StudentHistoryTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'StudentProfileTab') {
            iconName = focused ? 'people' : 'people-outline';
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
        name="StudentDashboardTab"
        component={StudentDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="StudentHistoryTab"
        component={StudentHistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="StudentProfileTab"
        component={StudentProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
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

export default StudentTabNavigator;
