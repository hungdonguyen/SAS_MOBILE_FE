import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { studentApi } from '../../services/studentApi';
import { authStorage } from '../../services/authStorage';
import { NavigationService } from '../../services/navigationService';
import { getErrorMessage } from '../../utils/errors';
import { TodaySessionDto } from '../../types/studentTypes';
import { theme } from '../../theme/colors';
import AppIcon from '../../components/Icon/AppIcon';

import DashboardHeader from '../../components/Student/DashboardHeader';
import TimeStatusCard from '../../components/Student/TimeStatusCard';
import TodaySchedule from '../../components/Student/TodaySchedule';

const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<TodaySessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState(authStorage.getUser());

  const fetchTodaySessions = async (isPullRefresh = false) => {
    if (!isPullRefresh) setLoading(true);
    setErrorMsg(null);

    try {
      const [data, meData] = await Promise.all([
        studentApi.getTodaySessions(),
        studentApi.getMe()
      ]);
      setSessions(data || []);
      setUser({ ...authStorage.getUser(), ...meData } as any);
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setUser(authStorage.getUser());
      fetchTodaySessions();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodaySessions(true);
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          try {
            await studentApi.logout();
          } catch (e) {} // ignore error, clearUser is already handled in API
          NavigationService.reset('Login');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.blueGradientStart]}
            tintColor={theme.colors.blueGradientStart}
          />
        }
      >
        <DashboardHeader 
          user={user as any} 
          onLogout={handleLogout} 
          onSwitchLanguage={() => {}}
        />

        <TimeStatusCard 
          sessions={sessions} 
          onCheckInPress={(session) => navigation.navigate('StudentCheckIn', { session })} 
        />

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.blueGradientStart} />
          </View>
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTodaySessions()}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TodaySchedule sessions={sessions} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceBg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.softDanger,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.textDanger,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: theme.colors.spAbsent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
  }
});

export default StudentDashboardScreen;
