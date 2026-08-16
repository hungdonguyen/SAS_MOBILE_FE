import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';
import { authStorage } from '../../services/authStorage';
import { apiConfig } from '../../services/apiConfig';
import { TodaySessionDto } from '../../types/studentTypes';

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
      const data = await studentApi.getTodaySessions();
      setSessions(data || []);
    } catch (err: any) {
      console.log('Error fetching today sessions:', err);
      const message =
        err.response?.data?.message ||
        `Cannot connect to Backend API (${apiConfig.getBaseUrl()}). Please check server.`;
      setErrorMsg(message);
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

  const handleStartCheckIn = (session: TodaySessionDto) => {
    navigation.navigate('StudentCheckIn', { session });
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.username || 'ST').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Hello, {user?.username || 'Student'}</Text>
            <Text style={styles.dateText}>{currentDateStr}</Text>
          </View>
        </View>

        <View style={styles.liveApiBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveApiText}>Live API</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D9488']}
            tintColor="#0D9488"
          />
        }
      >
        {/* Face Registration Alert Banner */}
        {!user?.hasRegisteredFace ? (
          <View style={styles.faceAlertBanner}>
            <View style={styles.faceAlertIconWrapper}>
              <AppIcon name="alert-circle" size={24} color="#D97706" />
            </View>
            <View style={styles.faceAlertContent}>
              <Text style={styles.faceAlertTitle}>Face Profile Not Registered</Text>
              <Text style={styles.faceAlertDesc}>
                Register your portrait face data to enable biometric AI attendance check-in.
              </Text>
              <TouchableOpacity
                style={styles.registerFaceBtn}
                onPress={() => navigation.navigate('StudentFaceRegister')}
                activeOpacity={0.85}
              >
                <Text style={styles.registerFaceBtnText}>Register Face Now</Text>
                <AppIcon name="chevron-forward-outline" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.faceVerifiedBanner}>
            <View style={styles.faceVerifiedLeft}>
              <AppIcon name="checkmark-circle-outline" size={20} color="#059669" />
              <Text style={styles.faceVerifiedText}>Biometric Face ID Verified</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('StudentFaceRegister')}
              activeOpacity={0.7}
            >
              <Text style={styles.updateFaceText}>Update</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Classes scheduled for today from Backend Database
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={() => fetchTodaySessions()}
            activeOpacity={0.7}
          >
            <AppIcon name="time-outline" size={16} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* Loading / Error / Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Fetching today's schedule from API...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <AppIcon name="alert-circle-outline" size={36} color="#EF4444" />
            <Text style={styles.errorTitle}>API Connection Notice</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchTodaySessions()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="calendar-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any class sessions scheduled for today. Enjoy your day!
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const isPending = session.attendanceStatus === 'pending';

            return (
              <View key={session.sessionId} style={styles.sessionCard}>
                {/* Header info */}
                <View style={styles.sessionTopRow}>
                  <View style={styles.subjectInfoCol}>
                    <Text style={styles.subjectName}>{session.subjectName}</Text>
                    <Text style={styles.subjectCode}>{session.subjectCode}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      session.attendanceStatus === 'present' && styles.statusPresent,
                      session.attendanceStatus === 'late' && styles.statusLate,
                      session.attendanceStatus === 'absent' && styles.statusAbsent,
                      isPending && styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        session.attendanceStatus === 'present' && styles.statusPresentText,
                        session.attendanceStatus === 'late' && styles.statusLateText,
                        session.attendanceStatus === 'absent' && styles.statusAbsentText,
                        isPending && styles.statusPendingText,
                      ]}
                    >
                      {session.attendanceStatus === 'present'
                        ? '✓ Present'
                        : session.attendanceStatus === 'late'
                        ? '⚠️ Late'
                        : session.attendanceStatus === 'absent'
                        ? '✕ Absent'
                        : 'Not Checked In'}
                    </Text>
                  </View>
                </View>

                {/* Details info */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <AppIcon name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>{session.roomName}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <AppIcon name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>
                      {session.startTime} - {session.endTime}
                    </Text>
                  </View>
                </View>

                {/* Verification requirements info */}
                <View style={styles.validationRow}>
                  <Text style={styles.validationLabel}>Security checks:</Text>
                  <View style={styles.validationPills}>
                    {session.validations?.networkEnabled && (
                      <View style={styles.valPill}>
                        <Text style={styles.valPillText}>🌐 Network IP</Text>
                      </View>
                    )}
                    {session.validations?.gpsEnabled && (
                      <View style={styles.valPill}>
                        <Text style={styles.valPillText}>📍 GPS Radius</Text>
                      </View>
                    )}
                    {session.validations?.faceEnabled && (
                      <View style={styles.valPill}>
                        <Text style={styles.valPillText}>👤 Face AI</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action button */}
                {isPending ? (
                  <TouchableOpacity
                    style={styles.checkInActionBtn}
                    onPress={() => handleStartCheckIn(session)}
                    activeOpacity={0.85}
                  >
                    <AppIcon name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.checkInActionBtnText}>Check-In Now</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.checkedInInfoRow}>
                    <AppIcon name="checkmark-circle-outline" size={15} color="#059669" />
                    <Text style={styles.checkedInInfoText}>
                      Checked in at {session.checkedInAt ? session.checkedInAt.slice(11, 16) : 'Today'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  liveApiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveApiText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  faceAlertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  faceAlertIconWrapper: {
    paddingTop: 2,
  },
  faceAlertContent: {
    flex: 1,
  },
  faceAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  faceAlertDesc: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 3,
    lineHeight: 17,
  },
  registerFaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 10,
    gap: 4,
  },
  registerFaceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  faceVerifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  faceVerifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faceVerifiedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  updateFaceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshIconBtn: {
    padding: 6,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 32,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPresent: { backgroundColor: '#DCFCE7' },
  statusLate: { backgroundColor: '#FEF3C7' },
  statusAbsent: { backgroundColor: '#FEE2E2' },
  statusPending: { backgroundColor: '#F1F5F9' },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPresentText: { color: '#15803D' },
  statusLateText: { color: '#B45309' },
  statusAbsentText: { color: '#991B1B' },
  statusPendingText: { color: '#64748B' },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  validationLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  validationPills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  valPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  valPillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  checkInActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  checkInActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkedInInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  checkedInInfoText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
});

export default StudentDashboardScreen;
