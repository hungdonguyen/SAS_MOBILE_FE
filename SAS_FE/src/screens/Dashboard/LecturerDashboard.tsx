import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import SearchBar from '../../components/SearchBar/SearchBar';
import StatCard from '../../components/StatCard/StatCard';
import ScheduleCard from '../../components/ScheduleCard/ScheduleCard';
import AppIcon from '../../components/Icon/AppIcon';
import { StatMetric, ScheduleItem, SessionStatusType } from '../../types/dashboard';

const INITIAL_STATS: StatMetric[] = [
  {
    id: 'stat-1',
    title: 'Assigned Classes',
    value: 6,
    trend: '+8% compared to last week',
    iconName: 'school-outline',
    backgroundColor: '#0D9488', // Dark Teal
    accentColor: '#0F766E',
  },
  {
    id: 'stat-2',
    title: 'Students',
    value: 186,
    trend: '+8% compared to last week',
    iconName: 'people-outline',
    backgroundColor: '#2563EB', // Vivid Blue
    accentColor: '#1D4ED8',
  },
  {
    id: 'stat-3',
    title: 'Attendance Rate',
    value: '91%',
    trend: '+8% compared to last week',
    iconName: 'checkmark-circle-outline',
    backgroundColor: '#10B981', // Emerald Green
    accentColor: '#059669',
  },
  {
    id: 'stat-4',
    title: 'Today Sessions',
    value: 3,
    trend: '+8% compared to last week',
    iconName: 'time-outline',
    backgroundColor: '#F59E0B', // Amber / Orange
    accentColor: '#D97706',
  },
];

const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'session-1',
    classId: 'WP301',
    subjectName: 'Web Programming',
    room: 'A3-201',
    building: 'Building A',
    startTime: '07:30',
    endTime: '09:30',
    timeFormatted: '07:30 - 09:30',
    checkedInCount: 28,
    totalCapacity: 32,
    status: 'ongoing',
  },
  {
    id: 'session-2',
    classId: 'SE201',
    subjectName: 'Software Engineering',
    room: 'A2-105',
    building: 'Building A',
    startTime: '08:45',
    endTime: '11:45',
    timeFormatted: '08:45 - 11:45',
    checkedInCount: 0,
    totalCapacity: 30,
    status: 'upcoming',
  },
  {
    id: 'session-3',
    classId: 'DB301',
    subjectName: 'Database Systems',
    room: 'B1-401',
    building: 'Building B',
    startTime: '13:30',
    endTime: '15:30',
    timeFormatted: '13:30 - 15:30',
    checkedInCount: 0,
    totalCapacity: 25,
    status: 'upcoming',
  },
];

const LecturerDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const filteredSchedules = useMemo(() => {
    return INITIAL_SCHEDULES.filter((item) => {
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
  }, [searchQuery, activeFilter]);

  const handleAttendanceAction = (item: ScheduleItem) => {
    navigation.navigate('ClassesTab', {
      screen: 'ClassDetail',
      params: { classId: item.classId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <Header
        lecturerName="Lecturer LC"
        role="Lecturer"
        currentDate="June 12, 2026"
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
          {INITIAL_STATS.map((stat) => (
            <View key={stat.id} style={styles.statCol}>
              <StatCard item={stat} />
            </View>
          ))}
        </View>

        {/* Schedule Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.sectionSubtitle}>Live tracking of ongoing classes</Text>
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
              All ({INITIAL_SCHEDULES.length})
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
              Ongoing (1)
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
              Upcoming (2)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Schedule List */}
        {filteredSchedules.length > 0 ? (
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
              Try adjusting your search query or filter settings.
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
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
