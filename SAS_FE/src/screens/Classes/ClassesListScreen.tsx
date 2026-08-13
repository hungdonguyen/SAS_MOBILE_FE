import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';

interface ClassItem {
  id: string;
  classCode: string; // e.g. WP301
  subjectName: string; // e.g. Web Programming
  room: string; // e.g. A3-201
  schedule: string; // e.g. Thứ 3, Thứ 5 (07:30 - 09:30)
  studentCount: number;
  totalSessions: number;
  completedSessions: number;
  attendanceRate: number; // percentage
  status: 'active' | 'completed';
}

const MOCK_CLASSES: ClassItem[] = [
  {
    id: 'c1',
    classCode: 'WP301',
    subjectName: 'Web Programming',
    room: 'A3-201',
    schedule: 'Thứ 3, Thứ 5 (07:30 - 09:30)',
    studentCount: 32,
    totalSessions: 15,
    completedSessions: 12,
    attendanceRate: 91,
    status: 'active',
  },
  {
    id: 'c2',
    classCode: 'SE201',
    subjectName: 'Software Engineering',
    room: 'A2-105',
    schedule: 'Thứ 2, Thứ 4 (08:45 - 11:45)',
    studentCount: 30,
    totalSessions: 15,
    completedSessions: 8,
    attendanceRate: 87,
    status: 'active',
  },
  {
    id: 'c3',
    classCode: 'DB301',
    subjectName: 'Database Systems',
    room: 'B1-401',
    schedule: 'Thứ 6 (13:30 - 16:30)',
    studentCount: 25,
    totalSessions: 12,
    completedSessions: 10,
    attendanceRate: 94,
    status: 'active',
  },
  {
    id: 'c4',
    classCode: 'AI401',
    subjectName: 'Artificial Intelligence',
    room: 'C2-302',
    schedule: 'Thứ 3 (13:30 - 16:30)',
    studentCount: 28,
    totalSessions: 15,
    completedSessions: 15,
    attendanceRate: 96,
    status: 'completed',
  },
];

interface ClassesListScreenProps {
  navigation: any;
}

const ClassesListScreen: React.FC<ClassesListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  const filteredClasses = MOCK_CLASSES.filter((c) => {
    if (filterTab !== 'all' && c.status !== filterTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.classCode.toLowerCase().includes(q) ||
      c.subjectName.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Classes Management</Text>
          <Text style={styles.headerSubtitle}>View and track attendance for your assigned classes</Text>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search class code, subject, room..."
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'all' && styles.filterPillActive]}
          onPress={() => setFilterTab('all')}
        >
          <Text style={[styles.filterText, filterTab === 'all' && styles.filterTextActive]}>
            All ({MOCK_CLASSES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'active' && styles.filterPillActive]}
          onPress={() => setFilterTab('active')}
        >
          <Text style={[styles.filterText, filterTab === 'active' && styles.filterTextActive]}>
            Active (3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'completed' && styles.filterPillActive]}
          onPress={() => setFilterTab('completed')}
        >
          <Text style={[styles.filterText, filterTab === 'completed' && styles.filterTextActive]}>
            Completed (1)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class Cards List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredClasses.map((item) => {
          const progress = Math.round((item.completedSessions / item.totalSessions) * 100);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('ClassDetail', { classId: item.classCode })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.classCode}</Text>
                </View>

                <View style={styles.rateBadge}>
                  <AppIcon name="checkmark-circle-outline" size={14} color="#0D9488" />
                  <Text style={styles.rateText}>{item.attendanceRate}% Avg</Text>
                </View>
              </View>

              <Text style={styles.subjectTitle}>{item.subjectName}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.room}</Text>
                </View>
                <View style={styles.metaItem}>
                  <AppIcon name="people-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.studentCount} Students</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.schedule}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.progressCol}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValueText}>
                      {item.completedSessions}/{item.totalSessions} Sessions ({progress}%)
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                </View>

                <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.7}>
                  <Text style={styles.detailsBtnText}>View Details</Text>
                  <AppIcon name="chevron-forward-outline" size={14} color="#0D9488" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
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
    gap: 12,
  },
  progressCol: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  progressValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 2.5,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
});

export default ClassesListScreen;
