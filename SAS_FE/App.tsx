import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login/Login';
import Home from './src/screens/Home/Home';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import StudentTabNavigator from './src/navigation/StudentTabNavigator';
import StudentCheckInScreen from './src/screens/Student/StudentCheckInScreen';
import StudentFaceRegisterScreen from './src/screens/Student/StudentFaceRegisterScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Auth */}
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />

          {/* Student Flow (Live API Connected) */}
          <Stack.Screen
            name="StudentHome"
            component={StudentTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StudentCheckIn"
            component={StudentCheckInScreen as any}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StudentFaceRegister"
            component={StudentFaceRegisterScreen}
            options={{ headerShown: false }}
          />

          {/* Lecturer Flow (Mock Data) */}
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />

          {/* Admin Flow (Mock Data) */}
          <Stack.Screen name="AdminHome" component={AdminTabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
    </SafeAreaProvider>
  );
}

export default App;
