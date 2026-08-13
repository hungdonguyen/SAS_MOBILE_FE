import React, { useState } from 'react';
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
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import StatCard from '../../components/StatCard/StatCard';
import { AdminStatMetric, AdminClassItem, AnomalyAlert } from '../../types/adminTypes';
import { StatMetric } from '../../types/dashboard';

const ADMIN_STATS: StatMetric[] = [
  {
    id: 'astat-1',
    title: 'Total Classes',
    value: 24,
    trend: '+12% this semester',
    iconName: 'school-outline',
    backgroundColor: '#6366F1', // Indigo
    accentColor: '#4F46E5',
  },
  {
    id: 'astat-2',
    title: 'Total Students',
    value: '1,254',
    trend: '+5% this semester',
    iconName: 'people-outline',
    backgroundColor: '#2563EB', // Blue
    accentColor: '#1D4ED8',
  },
  {
    id: 'astat-3',
    title: 'Avg Attendance',
    value: '85%',
    trend: '+3% vs last week',
    iconName: 'checkmark-circle-outline',
    backgroundColor: '#10B981', // Emerald Green
    accentColor: '#059669',
  },
  {
    id: 'astat-4',
    title: 'Active Sessions',
    value: 5,
    trend: '5 rooms ongoing',
    iconName: 'time-outline',
    backgroundColor: '#F59E0B', // Amber
    accentColor: '#D97706',
  },
];

const MOCK_ALERTS: AnomalyAlert[] = [
  {
    id: 'al-1',
    type: 'warning',
    title: 'Spoofing Attempt Detected',
    description: 'Student 21110004 flagged for location mismatch at room A3-201.',
    timestamp: '5m ago',
  },
  {
    id: 'al-2',
    type: 'error',
    title: 'AI Camera Disconnected',
    description: 'Room B1-401 camera IP 192.168.1.105 unreachable.',
    timestamp: '15m ago',
  },
  {
    id: 'al-3',
    type: 'info',
    title: 'Session Started',
    description: 'Artificial Intelligence AI405 started in C3-102.',
    timestamp: '30m ago',
  },
];

const MOCK_ACTIVE_CLASSES: AdminClassItem[] = [
  {
    id: 'ac-1',
    classCode: 'WP301',
    subjectName: 'Web Programming',
    room: 'A3-201',
    building: 'Building A',
    lecturerName: 'Nguyễn Văn A',
    enrolledCount: 45,
    totalCapacity: 50,
    schedule: 'Thứ 3, Thứ 5 (07:30 - 09:30)',
    status: 'ongoing',
    attendanceRate: 90,
  },
  {
    id: 'ac-2',
    classCode: 'DB201',
    subjectName: 'Database Systems',
    room: 'A2-105',
    building: 'Building A',
    lecturerName: 'Trần Thị B',
    enrolledCount: 30,
    totalCapacity: 30,
    schedule: 'Thứ 2, Thứ 6 (09:45 - 11:45)',
    status: 'upcoming',
    attendanceRate: 100,
  },
  {
    id: 'ac-3',
    classCode: 'NW302',
    subjectName: 'Computer Networks',
    room: 'B1-401',
    building: 'Building B',
    lecturerName: 'Lê Văn C',
    enrolledCount: 38,
    totalCapacity: 40,
    schedule: 'Thứ 3, Thứ 5 (07:30 - 09:30)',
    status: 'ongoing',
    attendanceRate: 95,
  },
  {
    id: 'ac-4',
    classCode: 'AI405',
    subjectName: 'Artificial Intelligence',
    room: 'C3-102',
    building: 'Building C',
    lecturerName: 'Phạm Văn D',
    enrolledCount: 15,
    totalCapacity: 60,
    schedule: 'Thứ 6 (07:30 - 11:45)',
    status: 'ongoing',
    attendanceRate: 25,
  },
];

interface AdminDashboardScreenProps {
  navigation?: any;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const filteredClasses = MOCK_ACTIVE_CLASSES.filter((c) => {
    if (classFilter !== 'all' && c.status !== classFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.classCode.toLowerCase().includes(q) ||
      c.subjectName.toLowerCase().includes(q) ||
      c.lecturerName.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Admin Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>SmartAttend Admin</Text>
            <Text style={styles.brandSubtitle}>Campus System Monitoring</Text>
          </View>
        </View>

        <View style={styles.adminActions}>
          <View style={styles.dateBadge}>
            <AppIcon name="calendar-outline" size={12} color="#64748B" />
            <Text style={styles.dateText}>May 11, 2026</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search class code, subject, lecturer..."
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {/* Stat Cards Grid (2x2) */}
        <View style={styles.statsGrid}>
          {ADMIN_STATS.map((stat) => (
            <View key={stat.id} style={styles.statCol}>
              <StatCard item={stat} />
            </View>
          ))}
        </View>

        {/* System Alerts / Security Feed */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTitleGroup}>
            <AppIcon name="notifications-outline" size={16} color="#6366F1" />
            <Text style={styles.sectionTitle}>System Alerts & Anomaly Feed</Text>
          </View>
        </View>

        <View style={styles.alertsCardGroup}>
          {MOCK_ALERTS.map((alert) => {
            const isWarn = alert.type === 'warning';
            const isErr = alert.type === 'error';
            return (
              <View key={alert.id} style={styles.alertItem}>
                <View
                  style={[
                    styles.alertDot,
                    isWarn
                      ? styles.dotWarn
                      : isErr
                      ? styles.dotErr
                      : styles.dotInfo,
                  ]}
                />
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertTime}>{alert.timestamp}</Text>
                  </View>
                  <Text style={styles.alertDesc}>{alert.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Live Class Monitoring Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Live Class Monitoring</Text>
          <Text style={styles.sectionBadgeText}>{filteredClasses.length} Active</Text>
        </View>

        {/* Filter Pills Tabs */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, classFilter === 'all' && styles.filterTabActive]}
            onPress={() => setClassFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                classFilter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({MOCK_ACTIVE_CLASSES.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, classFilter === 'ongoing' && styles.filterTabActive]}
            onPress={() => setClassFilter('ongoing')}
          >
            <Text
              style={[
                styles.filterTabText,
                classFilter === 'ongoing' && styles.filterTabTextActive,
              ]}
            >
              Ongoing (3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, classFilter === 'upcoming' && styles.filterTabActive]}
            onPress={() => setClassFilter('upcoming')}
          >
            <Text
              style={[
                styles.filterTabText,
                classFilter === 'upcoming' && styles.filterTabTextActive,
              ]}
            >
              Upcoming (1)
            </Text>
          </TouchableOpacity>
        </View>

        {filteredClasses.map((item) => {
          const isOngoing = item.status === 'ongoing';

          return (
            <View key={item.id} style={styles.classMonitorCard}>
              <View style={styles.classCardHeader}>
                <View style={styles.classCodeBadge}>
                  <Text style={styles.classCodeText}>{item.classCode}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    isOngoing ? styles.statusOngoing : styles.statusUpcoming,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isOngoing ? styles.dotOngoing : styles.dotUpcoming,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isOngoing ? styles.statusTextOngoing : styles.statusTextUpcoming,
                    ]}
                  >
                    {isOngoing ? 'Ongoing' : 'Upcoming'}
                  </Text>
                </View>
              </View>

              <Text style={styles.subjectName}>{item.subjectName}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="school-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>Lecturer: {item.lecturerName}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="location-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>{item.room} ({item.building})</Text>
                </View>
                <View style={styles.metaItem}>
                  <AppIcon name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>{item.schedule}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.attendanceProgressGroup}>
                  <Text style={styles.progressLabel}>Checked In</Text>
                  <Text style={styles.progressValueText}>
                    <Text style={styles.checkedCount}>{item.enrolledCount}</Text> / {item.totalCapacity}
                  </Text>
                </View>

                <View style={styles.ratePill}>
                  <Text style={styles.ratePillText}>{item.attendanceRate}% Rate</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: -2,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 14,
  },
  statCol: {
    width: '50%',
    paddingHorizontal: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
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
  alertsCardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  dotWarn: { backgroundColor: '#F59E0B' },
  dotErr: { backgroundColor: '#EF4444' },
  dotInfo: { backgroundColor: '#3B82F6' },
  alertContent: {
    flex: 1,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  alertTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  alertDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  classMonitorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  classCodeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusOngoing: { backgroundColor: '#DCFCE7' },
  statusUpcoming: { backgroundColor: '#FEF3C7' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotOngoing: { backgroundColor: '#16A34A' },
  dotUpcoming: { backgroundColor: '#D97706' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOngoing: { color: '#15803D' },
  statusTextUpcoming: { color: '#B45309' },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceProgressGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  progressValueText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  checkedCount: {
    fontWeight: '800',
    color: '#6366F1',
  },
  ratePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default AdminDashboardScreen;
