import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';
import { getErrorMessage } from '../../utils/errors';
import { AttendanceHistoryDto } from '../../types/studentTypes';
import { theme } from '../../theme/colors';

const StudentHistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<AttendanceHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async (isPull = false) => {
    if (!isPull) setLoading(true);
    setErrorMsg(null);

    try {
      const data = await studentApi.getStudentHistory();
      setHistory(data || []);
    } catch (err) {
      console.log('Error fetching history:', err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, []);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = history.length;
    const present = history.filter((h) => h.status === 'present').length;
    const late = history.filter((h) => h.status === 'late').length;
    const absent = history.filter((h) => h.status === 'absent').length;

    return { total, present, late, absent };
  }, [history]);

  // Filtered List
  const filteredList = useMemo(() => {
    return history.filter((item) => {
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }
      return true;
    });
  }, [history, activeFilter]);

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Attendance History</Text>
            <Text style={styles.headerSubtitle}>Review all your past attendance records</Text>
          </View>

        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* 4 Overlapping Summary Cards */}
        <View style={styles.summaryGrid}>
          <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.statCard}>
            <AppIcon name="calendar-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statVal}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </LinearGradient>

          <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.statCard}>
            <AppIcon name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statVal}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </LinearGradient>

          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statCard}>
            <AppIcon name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statVal}>{stats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </LinearGradient>

          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.statCard}>
            <AppIcon name="close-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statVal}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </LinearGradient>
        </View>

        {/* Dummy Select Controls to match layout */}
        <View style={styles.controlsRow}>
          <View style={styles.dummySelect}>
            <Text style={styles.dummySelectText}>Current Semester</Text>
            <AppIcon name="chevron-down-outline" size={16} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.dummySelect}>
            <Text style={styles.dummySelectText}>Latest</Text>
            <AppIcon name="chevron-down-outline" size={16} color={theme.colors.textSecondary} />
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {(['all', 'present', 'late', 'absent'] as const).map((key) => {
              const isActive = activeFilter === key;
              let label = 'All';
              if (key === 'present') label = 'Present';
              if (key === 'late') label = 'Late';
              if (key === 'absent') label = 'Absent';
              
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveFilter(key)}
                >
                  <LinearGradient
                    colors={isActive ? ['#2563eb', '#1d4ed8'] : [theme.colors.surfaceInput, theme.colors.surfaceInput]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pill}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content list */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <AppIcon name="alert-circle-outline" size={32} color="#EF4444" />
            <Text style={styles.errorTitle}>Failed to Load Data</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchHistory()}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.centerBox}>
            <View style={styles.emptyIconWrap}>
              <AppIcon name="file-tray-outline" size={36} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Attendance Records</Text>
            <Text style={styles.emptyDesc}>No attendance records match your filter.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredList.map((item) => {
              const status = item.status || 'pending';
              const isPresent = status === 'present';
              const isLate = status === 'late';
              const isAbsent = status === 'absent';
              const isExcused = status === 'excused';

              const statusColor = isPresent ? '#15803d' : isLate ? '#b45309' : '#991b1b';
              const statusBg = isPresent ? '#d1fae5' : isLate ? '#fef3c7' : '#fee2e2';
              const statusDot = isPresent ? '#22c55e' : isLate ? '#f59e0b' : '#ef4444';
              const statusLabel = isPresent ? 'Present' : isLate ? 'Late' : isAbsent ? 'Absent' : isExcused ? 'Excused' : status;

              return (
                <View key={item.id} style={styles.recordCard}>
                  <View style={styles.recordHeaderRow}>
                    <View style={styles.recordTextCol}>
                      <View style={styles.subjectRow}>
                        <Text style={styles.recordSubjectName} numberOfLines={1}>{item.subjectName || item.subject_name || 'No subject'}</Text>
                      </View>
                      <Text style={styles.recordSubjectCode}>{item.subjectCode || item.subject_code}</Text>
                      <View style={styles.recordDetailsRow}>
                        <Text style={styles.detailText}>{item.sessionDate || item.date}</Text>
                        <Text style={styles.detailDot}>•</Text>
                        <Text style={styles.detailText}>{item.startTime || item.time} - {item.endTime || '--:--'}</Text>
                        <Text style={styles.detailDot}>•</Text>
                        <AppIcon name="hardware-chip-outline" size={14} color={theme.colors.textMuted} />
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusDot }]} />
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24, 
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe', // blue-200
    marginTop: 4,
  },
  langBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIcon: {
    width: 28,
    height: 20,
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16, 
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  dummySelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dummySelectText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  filterPillsScroll: {
    marginTop: 16,
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  recordTextCol: {
    flex: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordSubjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  recordSubjectCode: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recordDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  detailDot: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptyDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    padding: 20,
    margin: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    textAlign: 'center',
    marginTop: 4,
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StudentHistoryScreen;
