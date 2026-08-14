import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { studentApi } from '../../services/studentApi';
import { AttendanceHistoryDto } from '../../types/studentTypes';

const StudentHistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<AttendanceHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async (isPull = false) => {
    if (!isPull) setLoading(true);
    setErrorMsg(null);

    try {
      const data = await studentApi.getStudentHistory();
      setHistory(data || []);
    } catch (err: any) {
      console.log('Error fetching history:', err);
      setErrorMsg(
        err.response?.data?.message || 'Unable to load attendance history from Backend API.'
      );
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
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { total, present, late, absent, rate };
  }, [history]);

  // Filtered List
  const filteredList = useMemo(() => {
    return history.filter((item) => {
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.subjectName.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.roomName.toLowerCase().includes(q) ||
        item.sessionDate.toLowerCase().includes(q)
      );
    });
  }, [history, activeFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.headerSubtitle}>Real-time verified attendance records</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => fetchHistory()}
          activeOpacity={0.7}
        >
          <AppIcon name="time-outline" size={16} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by subject, code, room, date..."
      />

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
        {/* Attendance Summary Stat Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryCardTitle}>Semester Attendance Rate</Text>
            <Text style={styles.rateHighlight}>{stats.rate}%</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Sessions</Text>
              <Text style={styles.metricVal}>{stats.total}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: '#059669' }]}>Present</Text>
              <Text style={[styles.metricVal, { color: '#059669' }]}>{stats.present}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: '#D97706' }]}>Late</Text>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>{stats.late}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: '#DC2626' }]}>Absent</Text>
              <Text style={[styles.metricVal, { color: '#DC2626' }]}>{stats.absent}</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.pill, activeFilter === 'all' && styles.pillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.pillText, activeFilter === 'all' && styles.pillTextActive]}>
              All ({history.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, activeFilter === 'present' && styles.pillActive]}
            onPress={() => setActiveFilter('present')}
          >
            <Text style={[styles.pillText, activeFilter === 'present' && styles.pillTextActive]}>
              Present ({stats.present})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, activeFilter === 'late' && styles.pillActive]}
            onPress={() => setActiveFilter('late')}
          >
            <Text style={[styles.pillText, activeFilter === 'late' && styles.pillTextActive]}>
              Late ({stats.late})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, activeFilter === 'absent' && styles.pillActive]}
            onPress={() => setActiveFilter('absent')}
          >
            <Text style={[styles.pillText, activeFilter === 'absent' && styles.pillTextActive]}>
              Absent ({stats.absent})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content list */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.centerText}>Loading attendance records...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <AppIcon name="alert-circle-outline" size={32} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading History</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchHistory()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.centerBox}>
            <AppIcon name="calendar-outline" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyDesc}>
              No attendance logs match your active filter or search query.
            </Text>
          </View>
        ) : (
          filteredList.map((item) => {
            const isPresent = item.status === 'present';
            const isLate = item.status === 'late';
            const isAbsent = item.status === 'absent';

            return (
              <View key={item.id} style={styles.recordCard}>
                <View style={styles.recordHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordSubjectName}>{item.subjectName}</Text>
                    <Text style={styles.recordSubjectCode}>{item.subjectCode}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isPresent && styles.badgePresent,
                      isLate && styles.badgeLate,
                      isAbsent && styles.badgeAbsent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isPresent && styles.badgePresentText,
                        isLate && styles.badgeLateText,
                        isAbsent && styles.badgeAbsentText,
                      ]}
                    >
                      {isPresent
                        ? '✓ Present'
                        : isLate
                        ? '⚠️ Late'
                        : isAbsent
                        ? '✕ Absent'
                        : item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordDetailsRow}>
                  <View style={styles.recordDetailItem}>
                    <AppIcon name="calendar-outline" size={13} color="#64748B" />
                    <Text style={styles.recordDetailText}>{item.sessionDate}</Text>
                  </View>

                  <View style={styles.recordDetailItem}>
                    <AppIcon name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.recordDetailText}>{item.roomName}</Text>
                  </View>

                  <View style={styles.recordDetailItem}>
                    <AppIcon name="time-outline" size={13} color="#64748B" />
                    <Text style={styles.recordDetailText}>
                      {item.startTime} - {item.endTime}
                    </Text>
                  </View>
                </View>

                {item.checkedInAt && (
                  <View style={styles.checkInStampRow}>
                    <Text style={styles.checkInStampLabel}>Check-in stamp:</Text>
                    <Text style={styles.checkInStampVal}>{item.checkedInAt}</Text>
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#0D9488',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CCFBF1',
  },
  rateHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  pillActive: {
    backgroundColor: '#0D9488',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  centerText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 4,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordSubjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  recordSubjectCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgePresent: { backgroundColor: '#DCFCE7' },
  badgeLate: { backgroundColor: '#FEF3C7' },
  badgeAbsent: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  badgePresentText: { color: '#15803D' },
  badgeLateText: { color: '#B45309' },
  badgeAbsentText: { color: '#991B1B' },
  recordDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  recordDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordDetailText: {
    fontSize: 12,
    color: '#64748B',
  },
  checkInStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  checkInStampLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  checkInStampVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
});

export default StudentHistoryScreen;
