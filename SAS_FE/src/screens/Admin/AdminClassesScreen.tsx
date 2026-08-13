import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AdminClassItem } from '../../types/adminTypes';

const MOCK_ADMIN_CLASSES: AdminClassItem[] = [
  {
    id: 'cls-1',
    classCode: 'WP301',
    subjectName: 'Web Programming',
    room: 'A3-201',
    building: 'Building A',
    lecturerName: 'TS. Nguyễn Văn A',
    enrolledCount: 45,
    totalCapacity: 50,
    schedule: 'Thứ 3, Thứ 5 (07:30 - 09:30)',
    status: 'ongoing',
    attendanceRate: 90,
  },
  {
    id: 'cls-2',
    classCode: 'SE201',
    subjectName: 'Software Engineering',
    room: 'A2-105',
    building: 'Building A',
    lecturerName: 'ThS. Trần Thị B',
    enrolledCount: 30,
    totalCapacity: 30,
    schedule: 'Thứ 2, Thứ 4 (08:45 - 11:45)',
    status: 'ongoing',
    attendanceRate: 87,
  },
  {
    id: 'cls-3',
    classCode: 'DB301',
    subjectName: 'Database Systems',
    room: 'B1-401',
    building: 'Building B',
    lecturerName: 'ThS. Lê Văn C',
    enrolledCount: 25,
    totalCapacity: 30,
    schedule: 'Thứ 6 (13:30 - 16:30)',
    status: 'upcoming',
    attendanceRate: 94,
  },
  {
    id: 'cls-4',
    classCode: 'AI405',
    subjectName: 'Artificial Intelligence',
    room: 'C3-102',
    building: 'Building C',
    lecturerName: 'TS. Phạm Văn D',
    enrolledCount: 58,
    totalCapacity: 60,
    schedule: 'Thứ 6 (07:30 - 11:45)',
    status: 'completed',
    attendanceRate: 96,
  },
];

const AdminClassesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_ADMIN_CLASSES.filter(
    (c) =>
      c.classCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClass = () => {
    Alert.alert('Create Class Section', 'Opening class section creation wizard.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campus Classes</Text>
          <Text style={styles.headerSubtitle}>Monitor all active sections and lecturer assignments</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddClass} activeOpacity={0.85}>
          <AppIcon name="school-outline" size={14} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Class</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search code, subject, lecturer..."
      />

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map((item) => {
          const isOngoing = item.status === 'ongoing';
          const isUpcoming = item.status === 'upcoming';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.classCode}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    isOngoing
                      ? styles.statusOngoing
                      : isUpcoming
                      ? styles.statusUpcoming
                      : styles.statusCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isOngoing
                        ? styles.textOngoing
                        : isUpcoming
                        ? styles.textUpcoming
                        : styles.textCompleted,
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.subjectName}>{item.subjectName}</Text>

              <View style={styles.metaRow}>
                <AppIcon name="school-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>Lecturer: {item.lecturerName}</Text>
              </View>

              <View style={styles.metaRow}>
                <AppIcon name="location-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>{item.room} ({item.building})</Text>
              </View>

              <View style={styles.metaRow}>
                <AppIcon name="time-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>{item.schedule}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Text style={styles.enrolledText}>
                  Enrolled: <Text style={styles.enrolledVal}>{item.enrolledCount}</Text> / {item.totalCapacity}
                </Text>

                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{item.attendanceRate}% Avg Attendance</Text>
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusOngoing: { backgroundColor: '#DCFCE7' },
  statusUpcoming: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textOngoing: { color: '#15803D' },
  textUpcoming: { color: '#B45309' },
  textCompleted: { color: '#64748B' },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enrolledText: {
    fontSize: 12,
    color: '#64748B',
  },
  enrolledVal: {
    fontWeight: '800',
    color: '#6366F1',
  },
  rateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default AdminClassesScreen;
