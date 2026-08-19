import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login/Login';
import Home from './src/screens/Home/Home';
import AdminTabNavigator from './src/navigation/AdminTabNavigator';
import StudentTabNavigator from './src/navigation/StudentTabNavigator';
import StudentCheckInScreen from './src/screens/Student/StudentCheckInScreen';
import StudentFaceRegisterScreen from './src/screens/Student/StudentFaceRegisterScreen';
import { navigationRef } from './src/services/navigationService';
import { authStorage } from './src/services/authStorage';
import { apiConfig } from './src/services/apiConfig';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'StudentHome' | 'Home' | 'AdminHome'>('Login');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([authStorage.init(), apiConfig.init()]);
        const user = authStorage.getUser();
        const token = authStorage.getAccessToken();

        if (user && token) {
          const role = (user.role || '').toLowerCase();
          if (role === 'admin') {
            setInitialRoute('AdminHome');
          } else if (role === 'lecturer' || role === 'teacher') {
            setInitialRoute('Home');
          } else {
            setInitialRoute('StudentHome');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (err) {
        console.log('[App] Bootstrap error:', err);
        setInitialRoute('Login');
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrap();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute}>
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default App;
