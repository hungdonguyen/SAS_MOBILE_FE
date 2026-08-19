import React, { useState, useMemo, useCallback } from 'react';
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
import Header from '../../components/Header/Header';
import SearchBar from '../../components/SearchBar/SearchBar';
import StatCard from '../../components/StatCard/StatCard';
import ScheduleCard from '../../components/ScheduleCard/ScheduleCard';
import AppIcon from '../../components/Icon/AppIcon';
import { StatMetric, ScheduleItem, SessionStatusType } from '../../types/dashboard';
import { lecturerDashboardService } from '../../api/services/lecturerDashboardService';
import { authStorage } from '../../api/storage';

const LecturerDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<StatMetric[]>([
    {
      id: 'stat-1',
      title: 'Assigned Classes',
      value: '—',
      trend: 'Assigned sections',
      iconName: 'school-outline',
      backgroundColor: '#0D9488',
      accentColor: '#0F766E',
    },
    {
      id: 'stat-2',
      title: 'Students',
      value: '—',
      trend: 'Enrolled students',
      iconName: 'people-outline',
      backgroundColor: '#2563EB',
      accentColor: '#1D4ED8',
    },
    {
      id: 'stat-3',
      title: 'Attendance Rate',
      value: '—',
      trend: 'Average across classes',
      iconName: 'checkmark-circle-outline',
      backgroundColor: '#10B981',
      accentColor: '#059669',
    },
    {
      id: 'stat-4',
      title: 'Today Sessions',
      value: '—',
      trend: 'Scheduled today',
      iconName: 'time-outline',
      backgroundColor: '#F59E0B',
      accentColor: '#D97706',
    },
  ]);

  const [todaySchedules, setTodaySchedules] = useState<ScheduleItem[]>([]);

  const loadDashboardData = async () => {
    try {
      const [kpiRes, sessionsRes] = await Promise.allSettled([
        lecturerDashboardService.getLecturerStats(),
        lecturerDashboardService.getLecturerTodaySessions(),
      ]);

      if (kpiRes.status === 'fulfilled') {
        const kpi = kpiRes.value;
        const assignedClasses = kpi.assignedClassesCount ?? kpi.assignedClasses ?? 0;
        const totalStudents = kpi.totalStudentsCount ?? kpi.totalStudents ?? 0;
        const avgRate = kpi.averageAttendanceRate ?? 0;
        const todayCount = kpi.todaySessionsCount ?? 0;

        setStats([
          {
            id: 'stat-1',
            title: 'Assigned Classes',
            value: assignedClasses,
            trend: `${assignedClasses} active sections`,
            iconName: 'school-outline',
            backgroundColor: '#0D9488',
            accentColor: '#0F766E',
          },
          {
            id: 'stat-2',
            title: 'Students',
            value: totalStudents,
            trend: `${totalStudents} total enrolled`,
            iconName: 'people-outline',
            backgroundColor: '#2563EB',
            accentColor: '#1D4ED8',
          },
          {
            id: 'stat-3',
            title: 'Attendance Rate',
            value: `${avgRate}%`,
            trend: 'Semester average',
            iconName: 'checkmark-circle-outline',
            backgroundColor: '#10B981',
            accentColor: '#059669',
          },
          {
            id: 'stat-4',
            title: 'Today Sessions',
            value: todayCount,
            trend: `${todayCount} scheduled`,
            iconName: 'time-outline',
            backgroundColor: '#F59E0B',
            accentColor: '#D97706',
          },
        ]);
      }

      if (sessionsRes.status === 'fulfilled') {
        const mappedSessions: (ScheduleItem & { sectionId?: string })[] = sessionsRes.value.map((sess) => {
          let status: SessionStatusType = (sess.status as SessionStatusType) || 'upcoming';

          const sTime = sess.startTime ? sess.startTime.slice(0, 5) : '07:30';
          const eTime = sess.endTime ? sess.endTime.slice(0, 5) : '09:30';

          // Dynamic time resolution for today's sessions:
          // If the session is not explicitly cancelled or completed, evaluate based on current time
          if (status !== 'cancelled' && status !== 'completed') {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const [sH, sM] = sTime.split(':').map((v) => parseInt(v, 10) || 0);
            const [eH, eM] = eTime.split(':').map((v) => parseInt(v, 10) || 0);

            const startMinutes = sH * 60 + sM;
            const endMinutes = eH * 60 + eM;

            if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
              status = 'ongoing';
            } else if (currentMinutes < startMinutes) {
              status = 'upcoming';
            } else if (currentMinutes > endMinutes) {
              status = 'completed';
            }
          }

          const courseCode = sess.courseCode || sess.subjectCode || 'CLASS';
          const courseName = sess.courseName || sess.subjectName || 'Course';
          const room = sess.roomCode || sess.room || 'TBD';
          const present = sess.presentCount ?? sess.checkedInCount ?? 0;
          const enrolled = sess.totalEnrolled ?? 0;

          return {
            id: sess.sessionId,
            sectionId: sess.sectionId,
            classId: courseCode,
            subjectName: courseName,
            room: room,
            building: sess.building || 'Campus',
            startTime: sTime,
            endTime: eTime,
            timeFormatted: sess.timeRange || `${sTime} - ${eTime}`,
            checkedInCount: present,
            totalCapacity: enrolled,
            status,
          };
        });
        setTodaySchedules(mappedSessions);
      }
    } catch (e) {
      console.log('Error loading lecturer dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const filteredSchedules = useMemo(() => {
    return todaySchedules.filter((item) => {
      // Filter by status tab
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }
      // Filter by search text
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.classId.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q)
      );
    });
  }, [todaySchedules, searchQuery, activeFilter]);

  const handleAttendanceAction = (item: ScheduleItem & { sectionId?: string }) => {
    navigation.navigate('ClassesTab', {
      screen: 'ClassDetail',
      params: {
        classId: item.sectionId || item.id,
        sessionId: item.id,
        classCode: item.classId,
        subjectName: item.subjectName,
        room: item.room,
      },
    });
  };

  const currentUser = authStorage.getUser();
  const lecturerDisplayName = currentUser?.fullName || currentUser?.username || 'Lecturer';
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const ongoingCount = todaySchedules.filter((s) => s.status === 'ongoing').length;
  const upcomingCount = todaySchedules.filter((s) => s.status === 'upcoming').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <Header
        lecturerName={lecturerDisplayName}
        role="Lecturer"
        currentDate={currentDateStr}
      />

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search student, class ID, room..."
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
            colors={['#0D9488']}
          />
        }
      >
        {/* Stat Cards Grid (2x2) */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCol}>
              <StatCard item={stat} />
            </View>
          ))}
        </View>

        {/* Schedule Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.sectionSubtitle}>Live tracking of ongoing and upcoming classes</Text>
          </View>
        </View>

        {/* Filter Pills Tabs */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({todaySchedules.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'ongoing' && styles.filterTabActive]}
            onPress={() => setActiveFilter('ongoing')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'ongoing' && styles.filterTabTextActive,
              ]}
            >
              Ongoing ({ongoingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'upcoming' && styles.filterTabActive]}
            onPress={() => setActiveFilter('upcoming')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'upcoming' && styles.filterTabTextActive,
              ]}
            >
              Upcoming ({upcomingCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Schedule List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Loading today's schedule...</Text>
          </View>
        ) : filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              item={schedule}
              onPressAttendance={handleAttendanceAction}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <AppIcon name="calendar-outline" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No sessions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'No class sessions scheduled for today.'}
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCol: {
    width: '50%',
    paddingHorizontal: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#0D9488',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LecturerDashboard;
