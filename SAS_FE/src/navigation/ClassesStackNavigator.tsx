import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClassesListScreen from '../screens/Classes/ClassesListScreen';
import ClassDetailScreen from '../screens/Classes/ClassDetailScreen';
import AttendanceVerificationScreen from '../screens/Classes/AttendanceVerificationScreen';

export type ClassesStackParamList = {
  ClassesList: undefined;
  ClassDetail: { classId: string; sessionId?: string };
  AttendanceVerification: {
    student?: any;
    sectionId?: string;
    sessionId?: string;
  };
};

const Stack = createNativeStackNavigator<ClassesStackParamList>();

const ClassesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="ClassesList">
      <Stack.Screen
        name="ClassesList"
        component={ClassesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AttendanceVerification"
        component={AttendanceVerificationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ClassesStackNavigator;
